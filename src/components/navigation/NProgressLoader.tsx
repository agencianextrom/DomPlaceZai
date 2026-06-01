'use client'

import { useEffect, useCallback, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

// Emerald-themed configuration for smoother SPA navigation
NProgress.configure({
  showSpinner: false,
  speed: 350,
  minimum: 0.08,
  easing: 'ease',
  trickleSpeed: 180,
})

export function NProgressLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPathRef = useRef<string | null>(null)

  // Complete the progress bar when route changes
  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  // Start progress bar on link clicks (SPA navigation)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a') as HTMLAnchorElement | null

      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip external links, anchors, and special links
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('tel:') ||
        href.startsWith('mailto:') ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }

      const isSamePage = previousPathRef.current === href
      previousPathRef.current = href

      // Don't show progress for same-page navigation
      if (isSamePage) return

      // Start NProgress
      NProgress.start()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      NProgress.done()
    }
  }, [])

  return null
}
