import { createContext, useContext, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

const FooterRevealContext = createContext(null)

export function FooterReveal({ children, className = '', ...props }) {
  const rootRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start start', 'end end'],
  })
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 34,
    restDelta: 0.001,
  })

  return (
    <FooterRevealContext.Provider value={progress}>
      <section ref={rootRef} className={`footer-reveal-root ${className}`} {...props}>
        {children}
      </section>
    </FooterRevealContext.Provider>
  )
}

export function FooterRevealContent({ children, className = '', ...props }) {
  return <div className={`footer-reveal-content ${className}`} {...props}>{children}</div>
}

export function FooterRevealFooter({ children, className = '', ...props }) {
  const MotionDiv = motion.div
  const progress = useContext(FooterRevealContext)
  const reduceMotion = useReducedMotion()
  if (!progress) throw new Error('FooterRevealFooter must be inside FooterReveal.')

  const opacity = useTransform(progress, [0.84, 1], [0, 1])
  const scale = useTransform(progress, [0.84, 1], [0.965, 1])
  const y = useTransform(progress, [0.84, 1], [18, 0])

  return (
    <MotionDiv
      className={`footer-reveal-footer ${className}`}
      style={reduceMotion ? { opacity: 1, scale: 1 } : { opacity, scale, y }}
      {...props}
    >
      {children}
    </MotionDiv>
  )
}
