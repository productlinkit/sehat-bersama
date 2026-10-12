import { useEffect, useState, type ReactNode } from 'react'
import { Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * WAI-ARIA APG carousel: named region, labelled slides, pause/play control (WCAG 2.2.2),
 * and 24×24px dot targets with a small visual dot (WCAG 2.5.8).
 * Autoplay stops on hover/focus and never starts under prefers-reduced-motion.
 */
export function Carousel({ label, slides, interval = 5000 }: { label: string; slides: ReactNode[]; interval?: number }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [hovered, setHovered] = useState(false)

  // Stop autoplay as soon as the user turns on reduced motion (WCAG 2.2.2).
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const onChange = () => mq.matches && setPlaying(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!playing || hovered || slides.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval)
    return () => clearInterval(t)
  }, [playing, hovered, slides.length, interval])

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="overflow-hidden rounded-3xl">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${index * 100}%)` }}
          aria-live={playing && !hovered ? 'off' : 'polite'}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} dari ${slides.length}`}
              aria-hidden={i !== index}
              inert={i !== index}
              className="w-full shrink-0"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Jeda promo otomatis' : 'Putar promo otomatis'}
          className="grid size-8 place-items-center rounded-full text-slate-600 hover:bg-slate-200"
        >
          {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
        </button>
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Promo ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
            className="grid size-8 place-items-center rounded-full"
          >
            <span className={cn('block h-2 rounded-full transition-all', i === index ? 'bg-primary w-5' : 'w-2 bg-slate-400')} />
          </button>
        ))}
      </div>
    </section>
  )
}
