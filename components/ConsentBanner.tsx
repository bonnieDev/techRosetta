'use client'

import { useEffect, useRef, useState } from 'react'
import { allowAnalytics, refuseAnalytics, storedChoice } from '@/lib/consent'
import '@/styles/consent.css'

const REOPEN = 'tr:consent-open'

export function ConsentBanner({ required }: { required: boolean }) {
  const [open, setOpen] = useState(false)
  const title = useRef<HTMLHeadingElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const moveFocus = useRef(false)

  useEffect(() => {
    if (required && !storedChoice()) setOpen(true)
    const onOpen = () => {
      returnTo.current = document.activeElement as HTMLElement
      moveFocus.current = true
      setOpen(true)
    }
    window.addEventListener(REOPEN, onOpen)
    return () => window.removeEventListener(REOPEN, onOpen)
  }, [required])

  useEffect(() => {
    if (open && moveFocus.current) title.current?.focus()
    moveFocus.current = false
  }, [open])

  const choose = (choice: () => void) => {
    choice()
    setOpen(false)
    // the button that had focus is about to disappear
    const fallback = document.getElementById('main')
    ;(returnTo.current ?? fallback)?.focus()
    returnTo.current = null
  }

  if (!open) return null

  return (
    <section className="consent" aria-labelledby="consent-title" data-section="consent">
      <div className="consent__inner">
        <h2 className="consent__title" id="consent-title" ref={title} tabIndex={-1}>
          Analytics choice
        </h2>
        <p className="consent__text">
          May we use Google Analytics to count visits and clicks? It never records anything you type.
          The site works the same either way.
        </p>
        <div className="consent__actions">
          <button type="button" className="button" onClick={() => choose(allowAnalytics)}>
            Accept
          </button>
          <button type="button" className="button" onClick={() => choose(refuseAnalytics)}>
            Reject
          </button>
        </div>
      </div>
    </section>
  )
}

export function ConsentReopen() {
  return (
    <button type="button" className="text-button" onClick={() => window.dispatchEvent(new Event(REOPEN))}>
      Analytics choice
    </button>
  )
}
