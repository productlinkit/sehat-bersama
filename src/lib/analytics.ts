// Minimal funnel analytics. Events go to localStorage (and the console in dev) so the
// package-select → payment conversion can be inspected at /internal/funnel.
// Swap `send` for your analytics SDK (GA4, Amplitude, PostHog…) in production.

export type FunnelEvent = 'package_view' | 'package_select' | 'checkout_view' | 'payment_success' | 'consultation_start'

interface StoredEvent {
  event: FunnelEvent
  at: string
  props?: Record<string, string>
}

const KEY = 'sb:events'

function read(): StoredEvent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function send(e: StoredEvent) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...read(), e].slice(-500)))
  } catch {
    /* storage unavailable */
  }
  if (import.meta.env.DEV) console.debug('[funnel]', e.event, e.props ?? {})
}

export function track(event: FunnelEvent, props?: Record<string, string>) {
  send({ event, at: new Date().toISOString(), props })
}

export const funnelSteps: { event: FunnelEvent; label: { id: string; en: string } }[] = [
  { event: 'package_view', label: { id: 'Lihat Pilih Paket', en: 'Viewed plans' } },
  { event: 'package_select', label: { id: 'Pilih paket', en: 'Selected a plan' } },
  { event: 'checkout_view', label: { id: 'Buka pembayaran', en: 'Opened payment' } },
  { event: 'payment_success', label: { id: 'Pembayaran berhasil', en: 'Payment succeeded' } },
  { event: 'consultation_start', label: { id: 'Mulai konsultasi', en: 'Started consultation' } },
]

export function funnelCounts() {
  const events = read()
  return funnelSteps.map((s) => ({ ...s, count: events.filter((e) => e.event === s.event).length }))
}

export function resetFunnel() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* storage unavailable */
  }
}
