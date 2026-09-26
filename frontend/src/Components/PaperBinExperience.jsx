import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlus2, Home, PanelsTopLeft, RotateCcw, Save, Trash2, Undo2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import DustbinModel from './DustbinModel'
import PaperDrawingCanvas from './PaperDrawingCanvas'

const TOSS_DURATION_MS = 4280
const DRAFTS_STORAGE_KEY = 'doodlesync-paper-drafts-v1'

function readDrafts(storageKey) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((draft) => draft && typeof draft.id === 'string').map((draft) => ({
      id: draft.id,
      title: typeof draft.title === 'string' ? draft.title : 'Untitled page',
      kind: draft.kind === 'template' ? 'template' : 'blank',
      template: ['moodboard', 'weekly', 'storyboard'].includes(draft.template) ? draft.template : 'moodboard',
      notes: draft.notes && typeof draft.notes === 'object' ? draft.notes : {},
      strokes: Array.isArray(draft.strokes) ? draft.strokes : [],
      saved: Boolean(draft.saved),
      updatedAt: Number(draft.updatedAt) || Date.now(),
    }))
  } catch {
    return []
  }
}

function createDraft(number) {
  return {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: `Untitled page ${number}`,
    kind: 'blank',
    template: 'moodboard',
    notes: {},
    strokes: [],
    saved: false,
    revision: 0,
    updatedAt: Date.now(),
  }
}

function getNextDraftNumber(drafts) {
  const highestNumber = drafts.reduce((highest, draft) => {
    const match = draft.title.match(/^Untitled page(?:\s+(\d+))?$/)
    if (!match) return highest
    return Math.max(highest, Number(match[1] || 1))
  }, 0)
  return highestNumber + 1
}

export default function PaperBinExperience({ children, standalone = false }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const draftOwner = user?.id || user?._id || user?.email || user?.name || 'anonymous'
  const storageKey = `${DRAFTS_STORAGE_KEY}:${encodeURIComponent(String(draftOwner))}`
  const initialDraftState = useRef(null)
  if (!initialDraftState.current) {
    let initialDrafts = readDrafts(storageKey)
    let initialDraft = standalone ? [...initialDrafts].sort((a, b) => b.updatedAt - a.updatedAt)[0] : null
    if (standalone && !initialDraft) {
      initialDraft = { ...createDraft(initialDrafts.length + 1), kind: 'template' }
      initialDrafts = [...initialDrafts, initialDraft]
    }
    initialDraftState.current = {
      key: storageKey,
      drafts: initialDrafts,
      activeId: initialDraft?.id || null,
      page: initialDraft?.kind || (standalone ? 'template' : 'site'),
    }
  }
  const [page, setPage] = useState(initialDraftState.current.page)
  const [tossing, setTossing] = useState(false)
  const [flipping, setFlipping] = useState(false)
  const [binEnabled, setBinEnabled] = useState(false)
  const [throwStartedAt, setThrowStartedAt] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [draftState, setDraftState] = useState(() => ({ key: initialDraftState.current.key, drafts: initialDraftState.current.drafts }))
  const drafts = draftState.key === storageKey ? draftState.drafts : []
  const setDrafts = (update) => setDraftState((current) => {
    const currentDrafts = current.key === storageKey ? current.drafts : readDrafts(storageKey)
    return { key: storageKey, drafts: typeof update === 'function' ? update(currentDrafts) : update }
  })
  const [activeDraftId, setActiveDraftId] = useState(initialDraftState.current.activeId)
  const [pagesOpen, setPagesOpen] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const [inkColor, setInkColor] = useState('#29243d')
  const [undoState, setUndoState] = useState(null)
  const [crumpleOriginY, setCrumpleOriginY] = useState(0)
  const timerRef = useRef(null)
  const flipTimerRef = useRef(null)
  const undoRef = useRef(null)
  const undoActionRef = useRef(() => {})
  const activeDraft = drafts.find((draft) => draft.id === activeDraftId)
  const isAlternativePage = page !== 'site'
  const isWebsiteCrushing = tossing && page === 'site'

  useEffect(() => {
    if (draftState.key === storageKey) return
    window.clearTimeout(timerRef.current)
    window.clearTimeout(flipTimerRef.current)
    const refreshedDrafts = readDrafts(storageKey)
    let refreshedDraft = standalone ? [...refreshedDrafts].sort((a, b) => b.updatedAt - a.updatedAt)[0] : null
    if (standalone && !refreshedDraft) {
      refreshedDraft = { ...createDraft(refreshedDrafts.length + 1), kind: 'template' }
      refreshedDrafts.push(refreshedDraft)
    }
    setDraftState({ key: storageKey, drafts: refreshedDrafts })
    setActiveDraftId(refreshedDraft?.id || null)
    setPage(refreshedDraft?.kind || (standalone ? 'template' : 'site'))
    setPageCount(0)
    undoRef.current = null
    setUndoState(null)
    setTossing(false)
    setThrowStartedAt(null)
    setDrawing(false)
  }, [draftState.key, storageKey, standalone])

  useEffect(() => {
    if (draftState.key !== storageKey) return undefined
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(draftState.drafts))
      } catch {
        // Keep the editor usable if browser storage is full or disabled.
      }
    }, 180)
    return () => window.clearTimeout(timeout)
  }, [draftState, storageKey])

  useEffect(() => () => {
    window.clearTimeout(timerRef.current)
    window.clearTimeout(flipTimerRef.current)
  }, [])

  const updateDraft = (id, changes) => {
    setDrafts((current) => current.map((draft) => draft.id === id
      ? { ...draft, ...changes, saved: false, revision: (draft.revision || 0) + 1, updatedAt: Date.now() }
      : draft))
  }

  const openDraft = (draft) => {
    setActiveDraftId(draft.id)
    setPage(draft.kind)
    setDrawing(false)
  }

  const makeNewPage = () => {
    const next = createDraft(getNextDraftNumber(drafts))
    setDrafts((current) => [...current, next])
    setActiveDraftId(next.id)
    setPage('blank')
    setPagesOpen(true)
    setDrawing(false)
  }

  const tossPage = () => {
    if (tossing) return
    if (page === 'site') setCrumpleOriginY(window.scrollY)
    undoRef.current = null
    setUndoState(null)
    const tossedDraft = page === 'site' ? null : activeDraft
    const previousPageCount = pageCount
    setThrowStartedAt(performance.now())
    setBinEnabled(true)
    setTossing(true)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      const remainingDrafts = tossedDraft ? drafts.filter((draft) => draft.id !== tossedDraft.id) : drafts
      const nextDraft = createDraft(getNextDraftNumber(tossedDraft ? [...remainingDrafts, tossedDraft] : remainingDrafts))
      setDrafts((current) => [...current.filter((draft) => draft.id !== tossedDraft?.id), nextDraft])
      if (tossedDraft) {
        const undo = { draft: tossedDraft, nextDraftId: nextDraft.id, nextDraftRevision: nextDraft.revision, previousPageCount }
        undoRef.current = undo
        setUndoState(undo)
      }
      setPageCount((count) => count + 1)
      setActiveDraftId(nextDraft.id)
      setPage('blank')
      setPagesOpen(true)
      setDrawing(false)
      setTossing(false)
      setThrowStartedAt(null)
      setBinEnabled(true)
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : TOSS_DURATION_MS)
  }

  const flipPage = (nextPage) => {
    if (flipping || tossing || page === nextPage) return
    setFlipping(true)
    window.clearTimeout(flipTimerRef.current)
    flipTimerRef.current = window.setTimeout(() => {
      updateDraft(activeDraftId, { kind: nextPage })
      setPage(nextPage)
      setFlipping(false)
    }, 520)
  }

  const returnToSite = () => {
    if (tossing) return
    if (standalone) {
      navigate('/')
      return
    }
    setFlipping(true)
    window.clearTimeout(flipTimerRef.current)
    flipTimerRef.current = window.setTimeout(() => {
      setPage('site')
      setFlipping(false)
    }, 520)
  }

  const updateNote = (key, value) => {
    if (!activeDraft) return
    updateDraft(activeDraft.id, { notes: { ...activeDraft.notes, [key]: value } })
  }

  const updateStrokes = (strokes) => {
    if (!activeDraft) return
    updateDraft(activeDraft.id, { strokes })
  }

  const selectTemplate = (template) => {
    if (!activeDraft) return
    updateDraft(activeDraft.id, { template })
  }

  const undoLastToss = () => {
    const undo = undoRef.current
    if (!undo || tossing) return
    undoRef.current = null
    setUndoState(null)
    setDrafts((current) => {
      const tossedPageIsAlreadyPresent = current.some((draft) => draft.id === undo.draft.id)
      const nextPage = current.find((draft) => draft.id === undo.nextDraftId)
      const keepNewPage = nextPage && nextPage.revision !== undo.nextDraftRevision
      const restored = current.filter((draft) => draft.id !== undo.draft.id && (keepNewPage || draft.id !== undo.nextDraftId))
      return tossedPageIsAlreadyPresent ? restored : [...restored, undo.draft]
    })
    setActiveDraftId(undo.draft.id)
    setPage(undo.draft.kind)
    setPagesOpen(true)
    setDrawing(false)
    setFlipping(true)
    window.clearTimeout(flipTimerRef.current)
    flipTimerRef.current = window.setTimeout(() => setFlipping(false), 520)
    setPageCount((count) => Math.max(undo.previousPageCount, count - 1))
  }

  undoActionRef.current = undoLastToss

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.key.toLowerCase() !== 'z') return
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
      if (!undoRef.current || tossing) return
      event.preventDefault()
      undoActionRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tossing])

  return (
    <div className={`paper-world${tossing ? ' is-tossing' : ''}${tossing && isAlternativePage ? ' is-page-tossing' : ''}`}>
      <div
        className={`paper-world-content${isWebsiteCrushing ? ' is-crumpling' : ''}${isAlternativePage ? ' is-away' : ''}`}
        style={isWebsiteCrushing ? { '--crumple-origin-y': `${crumpleOriginY}px` } : undefined}
        aria-hidden={isAlternativePage || tossing}
        inert={isAlternativePage || tossing}
      >
        {children}
      </div>

      {isAlternativePage && activeDraft && (
        <section className={`fresh-paper-page${page === 'template' ? ' is-template' : ''}${pagesOpen ? ' has-pages-open' : ''}${flipping ? ' is-flipping' : ''}${tossing ? ' is-crumpling' : ''}`} aria-label={page === 'template' ? 'Idea template sheet' : 'Blank sheet'} aria-hidden={tossing} inert={tossing}>
          <header className="paper-editor-header">
            <input
              className="paper-page-title"
              aria-label="Page title"
              value={activeDraft.title}
              onChange={(event) => updateDraft(activeDraft.id, { title: event.target.value })}
              placeholder="Untitled page"
              maxLength={80}
            />
            <span className={`paper-save-status${activeDraft.saved ? ' is-saved' : ''}`} aria-live="polite">
              <i />{activeDraft.saved ? 'Saved locally' : 'Unsaved'}
            </span>
            {undoState && <button type="button" className="paper-tool-button paper-undo-toss-button" onClick={undoLastToss} aria-label="Undo page toss" title="Undo toss (Ctrl+Z)"><Undo2 size={15} /><span>Undo</span></button>}
            <button type="button" className="paper-tool-button paper-save-button" onClick={() => setDrafts((current) => current.map((draft) => draft.id === activeDraft.id ? { ...draft, saved: true, updatedAt: Date.now() } : draft))}>
              <Save size={15} /><span>Save</span>
            </button>
          </header>

          <div className="paper-page-toolbar">
            <button type="button" className="paper-tool-button" onClick={() => setPagesOpen((open) => !open)} aria-expanded={pagesOpen} aria-controls="paper-pages-shelf">
              <PanelsTopLeft size={16} /><span>Pages {drafts.length ? `(${drafts.length})` : ''}</span>
            </button>
            <button type="button" className="paper-tool-button" onClick={() => flipPage(page === 'blank' ? 'template' : 'blank')} aria-label={page === 'blank' ? 'Flip to template' : 'Flip to blank page'} title={page === 'blank' ? 'Flip to template' : 'Flip to blank page'}>
              {page === 'blank' ? <PanelsTopLeft size={17} /> : <FilePlus2 size={17} />}
              <span>{page === 'blank' ? 'Template' : 'Blank'}</span>
            </button>
            <button type="button" className="paper-tool-button paper-home-button" onClick={returnToSite} aria-label="Return to website" title="Return to website">
              <Home size={16} />
            </button>
          </div>

          <aside id="paper-pages-shelf" className={`paper-pages-shelf${pagesOpen ? ' is-open' : ''}`} aria-label="Your pages" aria-hidden={!pagesOpen} inert={!pagesOpen}>
            <div className="paper-shelf-heading"><span>Your pages</span><button type="button" onClick={makeNewPage} aria-label="Create a new blank page" title="New page"><FilePlus2 size={16} /></button></div>
            <div className="paper-shelf-list">
              {[...drafts].reverse().map((draft) => (
                <button key={draft.id} type="button" className={`paper-shelf-item${draft.id === activeDraft.id ? ' is-active' : ''}`} onClick={() => openDraft(draft)}>
                  <span className="paper-shelf-sheet" aria-hidden="true" />
                  <span className="paper-shelf-item-copy"><b>{draft.title || 'Untitled page'}</b><small>{draft.saved ? 'Saved locally' : 'Unsaved'}</small></span>
                </button>
              ))}
              {drafts.length === 0 && <span className="paper-shelf-empty">Your pages will show up here.</span>}
            </div>
          </aside>

          <div className="paper-edit-tools" role="toolbar" aria-label="Page tools">
            <button type="button" className={`paper-tool-button${drawing ? ' is-selected' : ''}`} onClick={() => setDrawing((enabled) => !enabled)} aria-pressed={drawing}>
              <span className="paper-pencil-mark" aria-hidden="true">✎</span><span>{drawing ? 'Drawing' : 'Draw'}</span>
            </button>
            <button type="button" className="paper-tool-button paper-icon-tool" disabled={!activeDraft.strokes.length} onClick={() => updateStrokes(activeDraft.strokes.slice(0, -1))} aria-label="Undo last stroke" title="Undo last stroke"><Undo2 size={16} /></button>
            <label className="paper-ink-picker" title="Ink color"><input type="color" value={inkColor} onChange={(event) => setInkColor(event.target.value)} aria-label="Ink color" /><span>Ink</span></label>
            <button type="button" className="paper-tool-button paper-icon-tool" disabled={!activeDraft.strokes.length} onClick={() => updateStrokes([])} aria-label="Clear drawing" title="Clear drawing"><Trash2 size={15} /></button>
          </div>

          {page === 'template' && (
            <div className="paper-template-picker" role="group" aria-label="Choose a template">
              {[
                ['moodboard', 'Moodboard'],
                ['weekly', 'Weekly planner'],
                ['storyboard', 'Storyboard'],
              ].map(([id, label]) => (
                <button key={id} type="button" className={`paper-template-option${activeDraft.template === id ? ' is-selected' : ''}`} onClick={() => selectTemplate(id)} aria-pressed={activeDraft.template === id}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {page === 'template' ? (
            <div className={`paper-template-layout template-${activeDraft.template}`}>
              {activeDraft.template === 'moodboard' && (
                <>
                  <div className="moodboard-heading"><i /><i /></div>
                  <div className="moodboard-grid">
                    {Array.from({ length: 6 }, (_, index) => {
                      const key = `mood-${index}`
                      return <div className={`moodboard-tile moodboard-tile-${index + 1}`} key={key}><i /><textarea aria-label={`Moodboard note ${index + 1}`} value={activeDraft.notes[key] || ''} onChange={(event) => updateNote(key, event.target.value)} placeholder="Add a thought…" maxLength={140} /></div>
                    })}
                  </div>
                </>
              )}
              {activeDraft.template === 'weekly' && (
                <div className="weekly-planner-grid">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                    <section className="weekly-planner-day" key={day}>
                      <b>{day}</b>
                      {Array.from({ length: 3 }, (_, index) => {
                        const key = `${day.toLowerCase()}-${index}`
                        return <input key={key} aria-label={`${day} plan ${index + 1}`} value={activeDraft.notes[key] || ''} onChange={(event) => updateNote(key, event.target.value)} placeholder="Plan…" maxLength={80} />
                      })}
                    </section>
                  ))}
                </div>
              )}
              {activeDraft.template === 'storyboard' && (
                <div className="storyboard-grid">
                  {Array.from({ length: 6 }, (_, index) => <div className={`storyboard-frame storyboard-frame-${index + 1}`} key={index}><i /><b /><span /><textarea aria-label={`Storyboard frame ${index + 1} caption`} value={activeDraft.notes[`story-${index}`] || ''} onChange={(event) => updateNote(`story-${index}`, event.target.value)} placeholder={`Frame ${index + 1}`} maxLength={100} /></div>)}
                </div>
              )}
            </div>
          ) : (
            <textarea className="paper-blank-lines" aria-label="Write on your page" value={activeDraft.notes.body || ''} onChange={(event) => updateNote('body', event.target.value)} placeholder="Write on this page…" />
          )}

          <PaperDrawingCanvas
            strokes={activeDraft.strokes}
            active={drawing}
            color={inkColor}
            onStroke={(stroke) => updateStrokes([...activeDraft.strokes, stroke])}
          />
        </section>
      )}

      <button type="button" className={`paper-bin-button${tossing ? ' is-active' : ''}`} onClick={tossPage} onPointerEnter={() => setBinEnabled(true)} onFocus={() => setBinEnabled(true)} aria-label={isAlternativePage ? 'Crumple and toss this page' : 'Crumple and toss the website page'} title={isAlternativePage ? 'Toss this page' : 'Toss this page'} disabled={tossing}>
        <span className="paper-bin-fallback" aria-hidden="true" />
        <DustbinModel tossing={tossing} enabled={binEnabled} pageCount={pageCount} throwStartedAt={throwStartedAt} />
        <span className="paper-bin-pile" aria-hidden="true">
          {Array.from({ length: Math.min(pageCount, 15) }, (_, index) => (
            <i key={index} style={{
              '--paper-row': Math.floor(index / 3),
              '--paper-column': index % 3,
              '--paper-tilt': `${((index % 5) - 2) * 11}deg`,
              '--paper-delay': `${Math.min(index * 22, 220)}ms`,
            }} />
          ))}
        </span>
        <span className="paper-bin-prompt" aria-hidden="true"><RotateCcw size={12} /> Toss</span>
      </button>
    </div>
  )
}
