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

export const funnelSteps: { event: FunnelEvent; label: string }[] = [
  { event: 'package_view', label: 'Lihat Pilih Paket' },
  { event: 'package_select', label: 'Pilih paket' },
  { event: 'checkout_view', label: 'Buka pembayaran' },
  { event: 'payment_success', label: 'Pembayaran berhasil' },
  { event: 'consultation_start', label: 'Mulai konsultasi' },
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
