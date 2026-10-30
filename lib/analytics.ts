/**
 * One place to record what visitors do, sent to Google Analytics. The tag only
 * exists once it's allowed to run (see lib/consent.ts), so every call is
 * optional, and nothing is queued from before someone accepts.
 *
 * Never send anything a visitor typed.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

type Params = Record<string, string | number>

export function track(event: string, params: Params = {}) {
  window.gtag?.('event', event, params)
}

const clean = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

const sectionOf = (el: Element) => el.closest('[data-section]')?.getAttribute('data-section') ?? 'page'

/**
 * The path through the page: one `section_view` the first time each
 * `[data-section]` comes into view, numbered in the order reached, then one
 * `page_exit` when they leave. Returns a cleanup function.
 */
export function trackJourney(): () => void {
  const started = performance.now()
  const seen = new Set<string>()
  let last = ''
  let exited = false

  // Sent separately from seen: someone who accepts partway through still gets
  // the sections they had already reached, each exactly once.
  const sent = new Set<string>()
  const report = () => {
    if (!window.gtag) return
    ;[...seen].forEach((section, i) => {
      if (sent.has(section)) return
      sent.add(section)
      track('section_view', { section, order: i + 1 })
    })
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const section = sectionOf(entry.target)
        last = section
        seen.add(section)
      }
      report()
    },
    // counts once a section's top third is on screen, not on a glancing scroll
    { threshold: 0, rootMargin: '0px 0px -35% 0px' },
  )
  document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el))

  window.addEventListener('tr:analytics-allowed', report)

  const exit = () => {
    if (exited) return
    exited = true
    // 'beacon' lets the hit leave even as the tab closes
    track('page_exit', {
      last_section: last,
      sections_seen: seen.size,
      seconds_on_page: Math.round((performance.now() - started) / 1000),
      transport_type: 'beacon',
    })
  }
  // Hidden is the last moment a phone reliably reports anything; coming back re-arms it.
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') exit()
    else exited = false
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pagehide', exit)

  return () => {
    observer.disconnect()
    window.removeEventListener('tr:analytics-allowed', report)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pagehide', exit)
  }
}

/**
 * Every click on something you can interact with, named by where it was and
 * what it was: one `ui_click` with `part`, `section` and `control`, using the
 * label a person sees. Returns a cleanup function.
 */
export function trackClicks(): () => void {
  const textOf = (el: Element) => {
    const copy = el.cloneNode(true) as Element
    copy.querySelectorAll('[aria-hidden="true"], .visually-hidden').forEach((n) => n.remove())
    return copy.textContent
  }

  const onClick = (e: MouseEvent) => {
    const target = e.target as Element | null
    if (!target?.closest) return
    // the button or link wins over a picture inside it
    const control = target.closest('a, button, [role=button], summary, label') || target.closest('img')
    if (!control) return
    const label =
      clean(
        control.getAttribute('aria-label') ||
          (control instanceof HTMLImageElement ? control.alt && 'Image: ' + control.alt.slice(0, 40) : '') ||
          textOf(control) ||
          control.getAttribute('title'),
      ).slice(0, 50) || control.tagName.toLowerCase()
    const section = sectionOf(control).slice(0, 40)
    track('ui_click', { part: `${section}: ${label}`, section, control: label })
  }

  document.addEventListener('click', onClick, true)
  return () => document.removeEventListener('click', onClick, true)
}
