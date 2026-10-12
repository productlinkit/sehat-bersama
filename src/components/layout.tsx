import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronLeft, Clock, Gift, HelpCircle, Home, Languages, Type, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { iconTones, type AppIcon, type IconTone } from '@/lib/data'
import { LANGS, useI18n, type L } from '@/lib/i18n'
import { useTextSize, type TextSize } from '@/lib/prefs'
import { cn } from '@/lib/utils'

const tabs: { to: string; label: L; icon: typeof Home }[] = [
  { to: '/home', label: { id: 'Beranda', en: 'Home' }, icon: Home },
  { to: '/history', label: { id: 'Riwayat', en: 'History' }, icon: Clock },
  { to: '/reward', label: { id: 'Hadiah', en: 'Rewards' }, icon: Gift },
  { to: '/account', label: { id: 'Akun', en: 'Account' }, icon: User },
]

/**
 * Mobile/tablet tab bar. One pattern for every tab: the active state stays inside the bar
 * (filled pill behind the icon + bold teal label), so nothing ever overlaps content.
 * Columns and pills are fluid so it fits a 280px foldable at any text size.
 * NavLink sets aria-current="page" on the active tab.
 */
export function BottomNav() {
  const { tr } = useI18n()
  return (
    <nav aria-label={tr({ id: 'Navigasi utama', en: 'Main navigation' })} className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t bg-white md:max-w-2xl lg:hidden">
      <div className="grid grid-cols-4 px-1 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-xs">
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'grid h-8 w-full max-w-14 place-items-center rounded-full transition-colors',
                    isActive ? 'bg-emerald-100 text-teal-800' : 'text-slate-600',
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className={cn('max-w-full truncate', isActive ? 'font-bold text-teal-800' : 'text-slate-600')}>{tr(label)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

/** Desktop (≥1024px) sidebar replacing the bottom nav. */
function SideNav() {
  const { tr, t } = useI18n()
  const item = ({ isActive }: { isActive: boolean }) =>
    cn('flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium', isActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100')
  return (
    <nav aria-label={tr({ id: 'Navigasi utama', en: 'Main navigation' })} className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col gap-1 border-r bg-white p-4 lg:flex">
      <Link to="/home" className="mb-6 rounded-lg px-2 py-1">
        <Logo />
      </Link>
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={item}>
          <Icon className="size-5" aria-hidden /> {tr(label)}
        </NavLink>
      ))}
      <div className="mt-auto space-y-2">
        <LanguageToggle className="w-full" />
        <NavLink to="/help" className={item}>
          <HelpCircle className="size-5" aria-hidden /> {t('Bantuan', 'Help')}
        </NavLink>
      </div>
    </nav>
  )
}

/**
 * App frame.
 * - Phones: full-width column (max 448px) with a bottom tab bar.
 * - Tablets / landscape phones (≥768px): wider column (672px) with the same tab bar.
 * - Desktop (≥1024px): sidebar + content column; `wide` pages get a two-column canvas.
 */
export function AppShell({
  children,
  nav = true,
  wide = false,
  className,
}: {
  children: ReactNode
  nav?: boolean
  wide?: boolean
  className?: string
}) {
  const { t } = useI18n()
  return (
    <div className="min-h-dvh bg-slate-100">
      <a href="#main" className="bg-primary sr-only z-50 rounded-lg px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        {t('Lewati ke konten utama', 'Skip to main content')}
      </a>
      {nav && <SideNav />}
      <div className={cn(nav && 'lg:pl-60')}>
        <main
          id="main"
          className={cn(
            'bg-background relative mx-auto min-h-dvh max-w-md md:max-w-2xl',
            wide ? 'lg:max-w-6xl' : 'lg:max-w-3xl',
            nav && 'pb-safe',
            className,
          )}
        >
          {children}
        </main>
      </div>
      {nav && <BottomNav />}
    </div>
  )
}

export function BackButton({ to, label }: { to?: string; label?: string }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  return (
    <button
      type="button"
      aria-label={label ?? t('Kembali', 'Back')}
      onClick={() => {
        if (to) navigate(to)
        else if (window.history.length > 1) navigate(-1)
        else navigate('/home')
      }}
      className="-ml-1 grid size-11 shrink-0 place-items-center rounded-full hover:bg-slate-100"
    >
      <ChevronLeft className="size-5" aria-hidden />
    </button>
  )
}

export function PageHeader({
  title,
  subtitle,
  back,
  right,
  children,
  titleAs = 'h1',
}: {
  title: ReactNode
  subtitle?: ReactNode
  back?: string | true
  right?: ReactNode
  children?: ReactNode
  /** Use 'p' when the page renders its own h1 (one h1 per page). */
  titleAs?: 'h1' | 'p'
}) {
  const Title = titleAs
  return (
    <header className="sticky top-0 z-30 border-b bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5 min-[360px]:gap-3 min-[360px]:px-4">
        {back && <BackButton to={back === true ? undefined : back} />}
        {children}
        <div className="min-w-0 flex-1">
          <Title className="text-lg leading-tight font-bold">{title}</Title>
          {subtitle && <p className="text-muted-foreground mt-0.5 text-sm leading-snug">{subtitle}</p>}
        </div>
        {right && <div className="flex shrink-0 items-center gap-1">{right}</div>}
      </div>
    </header>
  )
}

/** Text link styled for touch: ≥24px tall hit area without changing the visual weight. */
export const touchLink = 'inline-flex min-h-6 items-center rounded px-1 text-sm font-semibold text-primary'

export function SectionTitle({ title, id, action }: { title: string; id?: string; action?: { label: string; to: string } }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-x-2">
      <h2 id={id} className="text-lg font-bold">
        {title}
      </h2>
      {action && (
        <Link to={action.to} className={touchLink}>
          {action.label}
        </Link>
      )}
    </div>
  )
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <img src="/logo.svg" alt="" className="size-8 shrink-0" />
      {compact ? (
        <span className="sr-only">Sehat Bersama</span>
      ) : (
        <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">
          <span className="text-teal-800">Sehat</span> <span className="text-emerald-700">Bersama</span>
        </span>
      )}
    </span>
  )
}

/** Round badge for a Sehat Bersama illustration icon. */
export function IconBadge({ icon: Icon, tone, className, iconClassName }: { icon: AppIcon; tone: IconTone; className?: string; iconClassName?: string }) {
  const t = iconTones[tone]
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-full', t.ring, t.fg, t.fill, className)} aria-hidden>
      <Icon className={cn('size-3/5', iconClassName)} />
    </span>
  )
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center min-[360px]:p-8">
      <p className="font-semibold">{title}</p>
      {text && <p className="text-muted-foreground mt-1 text-sm">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

const sizes: { key: TextSize; label: L }[] = [
  { key: 'normal', label: { id: 'Normal', en: 'Normal' } },
  { key: 'large', label: { id: 'Besar', en: 'Large' } },
  { key: 'xlarge', label: { id: 'Sangat besar', en: 'Extra large' } },
]

/** Segmented "Ukuran teks" control. */
export function TextSizeControl() {
  const { size, setSize } = useTextSize()
  const { tr, t } = useI18n()
  return (
    <div role="radiogroup" aria-label={t('Ukuran teks', 'Text size')} className="grid grid-cols-3 gap-2">
      {sizes.map((s, i) => (
        <button
          key={s.key}
          type="button"
          role="radio"
          aria-checked={size === s.key}
          onClick={() => setSize(s.key)}
          className={cn(
            'flex min-h-11 min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-2',
            size === s.key ? 'border-primary bg-emerald-50 text-teal-800' : 'border-slate-300 bg-white',
          )}
        >
          <span className="font-bold" style={{ fontSize: `${1 + i * 0.2}rem` }} aria-hidden>
            Aa
          </span>
          <span className="text-center text-xs leading-tight">{tr(s.label)}</span>
        </button>
      ))}
    </div>
  )
}

/** Compact header button that cycles text size. */
export function TextSizeButton() {
  const { size, setSize } = useTextSize()
  const { tr, t } = useI18n()
  const next: Record<TextSize, TextSize> = { normal: 'large', large: 'xlarge', xlarge: 'normal' }
  const label = tr(sizes.find((s) => s.key === size)!.label)
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 rounded-full px-2.5"
      onClick={() => setSize(next[size])}
      aria-label={t(`Ukuran teks: ${label}. Ketuk untuk mengganti.`, `Text size: ${label}. Tap to change.`)}
    >
      <Type aria-hidden /> Aa
    </Button>
  )
}

/**
 * Language switch (Bahasa Indonesia / English). A two-option radio group so screen readers
 * announce the current language; each option is labelled in its own language.
 */
export function LanguageToggle({ className, compact }: { className?: string; compact?: boolean }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div
      role="radiogroup"
      aria-label={t('Bahasa', 'Language')}
      className={cn('inline-flex items-center gap-0.5 rounded-full border border-slate-300 bg-white p-0.5', className)}
    >
      {!compact && <Languages className="mx-1.5 size-4 shrink-0 text-slate-600" aria-hidden />}
      {LANGS.map((l) => (
        <button
          key={l.key}
          type="button"
          role="radio"
          aria-checked={lang === l.key}
          lang={l.key}
          aria-label={l.label}
          onClick={() => setLang(l.key)}
          className={cn(
            'min-h-9 min-w-10 flex-1 rounded-full px-2.5 text-sm font-bold',
            lang === l.key ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100',
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}

/** Full-width language picker for settings pages. */
export function LanguageControl() {
  const { lang, setLang, t } = useI18n()
  return (
    <div role="radiogroup" aria-label={t('Bahasa', 'Language')} className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
      {LANGS.map((l) => (
        <button
          key={l.key}
          type="button"
          role="radio"
          aria-checked={lang === l.key}
          lang={l.key}
          onClick={() => setLang(l.key)}
          className={cn(
            'flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 font-semibold',
            lang === l.key ? 'border-primary bg-emerald-50 text-teal-800' : 'border-slate-300 bg-white',
          )}
        >
          <span className="rounded bg-slate-100 px-1.5 text-xs font-bold text-slate-700">{l.short}</span>
          {l.label}
        </button>
      ))}
    </div>
  )
}
