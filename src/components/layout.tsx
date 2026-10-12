import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronLeft, Clock, Gift, HelpCircle, Home, Type, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { iconTones, type AppIcon, type IconTone } from '@/lib/data'
import { useTextSize, type TextSize } from '@/lib/prefs'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/home', label: 'Beranda', icon: Home },
  { to: '/history', label: 'Riwayat', icon: Clock },
  { to: '/reward', label: 'Hadiah', icon: Gift },
  { to: '/account', label: 'Akun', icon: User },
]

/**
 * Mobile tab bar. One pattern for every tab: the active state stays inside the bar
 * (filled pill behind the icon + bold teal label), so nothing ever overlaps content.
 * NavLink sets aria-current="page" on the active tab.
 */
export function BottomNav() {
  return (
    <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t bg-white lg:hidden">
      <div className="grid grid-cols-4 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-xs">
            {({ isActive }) => (
              <>
                <span className={cn('grid h-8 w-14 place-items-center rounded-full transition-colors', isActive ? 'bg-emerald-100 text-teal-800' : 'text-slate-600')}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className={cn(isActive ? 'font-bold text-teal-800' : 'text-slate-600')}>{label}</span>
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
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col gap-1 border-r bg-white p-4 lg:flex"
    >
      <Link to="/home" className="mb-6 rounded-lg px-2 py-1">
        <Logo />
      </Link>
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium',
              isActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100',
            )
          }
        >
          <Icon className="size-5" aria-hidden /> {label}
        </NavLink>
      ))}
      <NavLink
        to="/help"
        className={({ isActive }) =>
          cn('mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium', isActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100')
        }
      >
        <HelpCircle className="size-5" aria-hidden /> Bantuan
      </NavLink>
    </nav>
  )
}

/**
 * App frame. Mobile: centred phone-width column with a bottom tab bar.
 * Desktop: sidebar + content column (`wide` pages get a two-column canvas).
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
  return (
    <div className="min-h-dvh bg-slate-100">
      <a
        href="#main"
        className="bg-primary sr-only z-50 rounded-lg px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Lewati ke konten utama
      </a>
      {nav && <SideNav />}
      <div className={cn(nav && 'lg:pl-60')}>
        <main
          id="main"
          className={cn(
            'bg-background relative mx-auto min-h-dvh max-w-md',
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

export function BackButton({ to, label = 'Kembali' }: { to?: string; label?: string }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      aria-label={label}
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
      <div className="flex items-center gap-3 px-4 py-3">
        {back && <BackButton to={back === true ? undefined : back} />}
        {children}
        <div className="min-w-0 flex-1">
          <Title className="text-lg leading-tight font-bold">{title}</Title>
          {subtitle && <p className="text-muted-foreground mt-0.5 text-sm leading-snug">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}

export function SectionTitle({ title, id, action }: { title: string; id?: string; action?: { label: string; to: string } }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 id={id} className="text-lg font-bold">
        {title}
      </h2>
      {action && (
        <Link to={action.to} className="text-primary rounded px-1 text-sm font-semibold">
          {action.label}
        </Link>
      )}
    </div>
  )
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <img src="/logo.svg" alt="" className="size-8" />
      {compact ? (
        <span className="sr-only">Sehat Bersama</span>
      ) : (
        <span className="text-xl font-extrabold tracking-tight">
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
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="font-semibold">{title}</p>
      {text && <p className="text-muted-foreground mt-1 text-sm">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

const sizes: { key: TextSize; label: string }[] = [
  { key: 'normal', label: 'Normal' },
  { key: 'large', label: 'Besar' },
  { key: 'xlarge', label: 'Sangat besar' },
]

/** Segmented "Ukuran teks" control. */
export function TextSizeControl() {
  const { size, setSize } = useTextSize()
  return (
    <div role="radiogroup" aria-label="Ukuran teks" className="grid grid-cols-3 gap-2">
      {sizes.map((s, i) => (
        <button
          key={s.key}
          type="button"
          role="radio"
          aria-checked={size === s.key}
          onClick={() => setSize(s.key)}
          className={cn(
            'flex min-h-11 flex-col items-center justify-center rounded-xl border px-2 py-2',
            size === s.key ? 'border-primary bg-emerald-50 text-teal-800' : 'border-slate-300 bg-white',
          )}
        >
          <span className="font-bold" style={{ fontSize: `${1 + i * 0.2}rem` }} aria-hidden>
            Aa
          </span>
          <span className="text-xs">{s.label}</span>
        </button>
      ))}
    </div>
  )
}

/** Compact header button that cycles text size. */
export function TextSizeButton() {
  const { size, setSize } = useTextSize()
  const next: Record<TextSize, TextSize> = { normal: 'large', large: 'xlarge', xlarge: 'normal' }
  const label = sizes.find((s) => s.key === size)!.label
  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full"
      onClick={() => setSize(next[size])}
      aria-label={`Ukuran teks: ${label}. Ketuk untuk mengganti.`}
    >
      <Type aria-hidden /> Aa
    </Button>
  )
}
