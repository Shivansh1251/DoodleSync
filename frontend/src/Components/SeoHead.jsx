import { useEffect } from 'react'

const DEFAULT_DESCRIPTION = 'DoodleSync is a fast, free collaborative whiteboard for teams, classrooms, and friends to brainstorm, draw, and chat in real time.'

export default function SeoHead({
  title = 'DoodleSync | Real-time collaborative whiteboard',
  description = DEFAULT_DESCRIPTION,
  path = '/',
}) {
  useEffect(() => {
    const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
    const canonicalUrl = `${siteUrl}${path === '/' ? '/' : path}`
    const metadata = {
      title,
      description,
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:url': canonicalUrl,
      'og:image': `${siteUrl}/DoodleSync.png`,
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': `${siteUrl}/DoodleSync.png`,
    }

    document.title = title
    Object.entries(metadata).forEach(([name, content]) => {
      const selector = name.startsWith('og:') || name.startsWith('twitter:') ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let element = document.head.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        if (name.startsWith('og:') || name.startsWith('twitter:')) element.setAttribute('property', name)
        else element.setAttribute('name', name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    })

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)

    let structuredData = document.head.querySelector('#doodlesync-structured-data')
    if (!structuredData) {
      structuredData = document.createElement('script')
      structuredData.id = 'doodlesync-structured-data'
      structuredData.type = 'application/ld+json'
      document.head.appendChild(structuredData)
    }
    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'DoodleSync',
      url: siteUrl,
      description,
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['Collaborative drawing', 'Real-time chat', 'Infinite canvas'],
    })
  }, [description, path, title])

  return null
}
