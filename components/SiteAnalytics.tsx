'use client'

import { useEffect } from 'react'
import { trackClicks, trackJourney } from '@/lib/analytics'

export function SiteAnalytics() {
  useEffect(() => {
    const stopClicks = trackClicks()
    const stopJourney = trackJourney()
    return () => {
      stopClicks()
      stopJourney()
    }
  }, [])
  return null
}
