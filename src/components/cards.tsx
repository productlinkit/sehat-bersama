import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { categoryOf, type Article, type Quota } from '@/lib/data'
import { cn } from '@/lib/utils'

/** Branded category artwork, used for every article thumbnail (no placeholders). */
export function CategoryCover({ category, className, large }: { category: string; className?: string; large?: boolean }) {
  const c = categoryOf(category)
  const Icon = c.icon
  return (
    <div className={cn('relative grid aspect-[16/9] place-items-center overflow-hidden rounded-xl bg-gradient-to-br', c.cover, className)} aria-hidden>
      <span className="absolute -right-6 -bottom-6 size-24 rounded-full bg-white/30" />
      <span className="absolute -top-4 -left-4 size-16 rounded-full bg-white/25" />
      <span className={cn('relative grid place-items-center rounded-full bg-white/80 shadow-sm', large ? 'size-24' : 'size-14')}>
        <Icon className={cn(c.fg, large ? 'size-12' : 'size-7')} />
      </span>
    </div>
  )
}

export function CategoryTag({ category }: { category: string }) {
  return (
    <span className="inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-teal-800">
      {categoryOf(category).label}
    </span>
  )
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link to={`/article/${article.slug}`} className="block h-full rounded-xl" aria-label={`Baca artikel: ${article.title}`}>
      <Card className="h-full gap-0 overflow-hidden p-2 shadow-none transition hover:shadow-md">
        <CategoryCover category={article.category} />
        <div className="space-y-1.5 px-1.5 pt-3 pb-1.5">
          <CategoryTag category={article.category} />
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{article.title}</h3>
          <p className="text-muted-foreground text-xs">{article.readMinutes} menit baca</p>
        </div>
      </Card>
    </Link>
  )
}

export function QuotaList({ quotas }: { quotas: Quota[] }) {
  return (
    <ul className="space-y-4">
      {quotas.map((q) => (
        <li key={q.label} className="space-y-2">
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>{q.label}</span>
            <span>
              {q.remaining} dari {q.total} tersisa
            </span>
          </div>
          <Progress
            value={(q.remaining / q.total) * 100}
            aria-label={`${q.label}: ${q.remaining} dari ${q.total} tersisa`}
            className="h-2 bg-slate-200 [&>div]:bg-teal-700"
          />
        </li>
      ))}
    </ul>
  )
}

/** Colour roles: teal = included/success, info = neutral status, warning (amber) = warnings only. */
const pillTones = {
  teal: 'bg-emerald-50 text-teal-800 border-emerald-300',
  info: 'bg-sky-50 text-sky-900 border-sky-300',
  warning: 'bg-amber-50 text-amber-900 border-amber-400',
  violet: 'bg-violet-50 text-violet-800 border-violet-300',
  slate: 'bg-slate-100 text-slate-700 border-slate-300',
  red: 'bg-red-50 text-red-700 border-red-300',
}

export function Pill({ children, tone = 'teal', className }: { children: ReactNode; tone?: keyof typeof pillTones; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide', pillTones[tone], className)}>
      {children}
    </span>
  )
}
