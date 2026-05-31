'use client'

import { useEffect } from 'react'
import { loadPostHog } from '@/lib/analytics'

export function PostHogInit() {
  useEffect(() => {
    loadPostHog()
  }, [])

  return null
}
