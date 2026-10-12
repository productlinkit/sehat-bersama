import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BadgeCheck, Bell, ChevronRight, Pill as PillIcon, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArticleCard, CategoryCover, CategoryTag, Pill } from '@/components/cards'
import { AppShell, EmptyState, IconBadge, Logo, PageHeader } from '@/components/layout'
import { useAuth } from '@/lib/auth'
import { articles, categories, consultations, notifications, packages, rupiah, services } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function HistoryPage() {
  const { t, tr, date } = useI18n()
  const [tab, setTab] = useState<'all' | 'ongoing' | 'done'>('all')
  return (
    <AppShell>
      <PageHeader title={t('Riwayat Medis', 'Medical History')} subtitle={t('Catatan, ringkasan, dan resep dari setiap konsultasi', 'Notes, summaries and prescriptions from every consultation')} />
      <div className="space-y-4 p-4 lg:p-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid h-auto min-h-11 w-full grid-cols-3 rounded-full" aria-label={t('Filter riwayat', 'Filter history')}>
            <TabsTrigger value="all" className="h-auto min-h-9 rounded-full whitespace-normal">
              {t('Semua', 'All')}
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="h-auto min-h-9 rounded-full whitespace-normal">
              {t('Berlangsung', 'Ongoing')}
            </TabsTrigger>
            <TabsTrigger value="done" className="h-auto min-h-9 rounded-full whitespace-normal">
              {t('Selesai', 'Completed')}
            </TabsTrigger>
          </TabsList>
          {(['all', 'ongoing', 'done'] as const).map((value) => {
            const list = consultations.filter((c) => value === 'all' || c.status === value)
            return (
              <TabsContent key={value} value={value} className="mt-4">
                {list.length === 0 && <EmptyState title={t('Belum ada riwayat', 'No history yet')} />}
                <ul className="grid gap-3 md:grid-cols-2">
                  {list.map((c) => (
                    <li key={c.id}>
                      <Link to="/consultation" className="block h-full rounded-xl">
                        <Card className="h-full gap-2 p-4 shadow-none">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-muted-foreground text-xs">{date(c.date)}</span>
                            <Pill tone={c.status === 'ongoing' ? 'info' : 'teal'}>{c.status === 'ongoing' ? t('Berlangsung', 'Ongoing') : t('Selesai', 'Completed')}</Pill>
                          </div>
                          <h2 className="font-semibold">{tr(c.title)}</h2>
                          <p className="text-muted-foreground text-sm">{tr(c.summary)}</p>
                          <p className="text-primary mt-auto flex items-center gap-1 text-sm font-semibold">
                            {c.status === 'ongoing' ? t('Lanjutkan percakapan', 'Continue the conversation') : t('Lihat ringkasan', 'View summary')}
                            <ChevronRight className="size-4 shrink-0" aria-hidden />
                          </p>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            )
          })}
        </Tabs>
        <Link to="/prescriptions" className="flex items-center gap-3 rounded-2xl border bg-white p-4">
          <PillIcon className="text-primary size-5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 font-semibold">{t('Resep & Dokumen', 'Prescriptions & Documents')}</span>
          <ChevronRight className="text-muted-foreground size-5 shrink-0" aria-hidden />
        </Link>
      </div>
    </AppShell>
  )
}

export function NotificationsPage() {
  const { t, tr, date } = useI18n()
  return (
    <AppShell>
      <PageHeader title={t('Notifikasi', 'Notifications')} back="/home" />
      <ul className="divide-y bg-white">
        {notifications.map((n, i) => (
          <li key={i}>
            <Link to={n.to} className={cn('flex gap-3 px-4 py-4', n.unread && 'bg-emerald-50')}>
              <span className="text-primary grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100">
                <Bell className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  {tr(n.title)}
                  {n.unread && <span className="sr-only"> {t('(belum dibaca)', '(unread)')}</span>}
                </span>
                <span className="text-muted-foreground block text-sm">{tr(n.body)}</span>
                <span className="text-muted-foreground mt-1 block text-xs">{date(n.time, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </span>
              {n.unread && <span className="bg-primary mt-2 size-2.5 shrink-0 rounded-full" aria-hidden />}
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  )
}

export function ArticlesPage() {
  const { t, tr } = useI18n()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const cat = params.get('kategori') ?? ''
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    setParams(next, { replace: true })
  }
  // Search matches the title in either language, so a query works whatever language is shown.
  const term = q.toLowerCase()
  const list = articles.filter((a) => (!cat || a.category === cat) && (!term || `${a.title.id} ${a.title.en}`.toLowerCase().includes(term)))
  const chips: [string, string][] = [['', t('Semua', 'All')], ...Object.entries(categories).map(([k, v]) => [k, tr(v.label)] as [string, string])]

  return (
    <AppShell wide>
      <PageHeader title={t('Artikel & Informasi', 'Articles & Tips')} back="/home" />
      <div className="space-y-4 p-4 lg:p-8">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" aria-hidden />
          <Input
            type="search"
            aria-label={t('Cari artikel', 'Search articles')}
            placeholder={t('Cari artikel, mis. demam', 'Search articles, e.g. fever')}
            value={q}
            onChange={(e) => set({ q: e.target.value })}
            className="h-12 rounded-full bg-white pl-11 text-base"
          />
        </div>
        <div role="radiogroup" aria-label={t('Kategori artikel', 'Article category')} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
          {chips.map(([k, label]) => (
            <button
              key={k}
              role="radio"
              aria-checked={cat === k}
              onClick={() => set({ kategori: k })}
              className={cn('min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold', cat === k ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white')}
            >
              {label}
            </button>
          ))}
        </div>
        <h2 className="sr-only">{t('Daftar artikel', 'Article list')}</h2>
        <p className="text-muted-foreground text-sm" role="status">
          {t(`${list.length} artikel`, `${list.length} ${list.length === 1 ? 'article' : 'articles'}`)}
        </p>
        {list.length === 0 ? (
          <EmptyState title={t('Artikel tidak ditemukan', 'No articles found')} text={t('Coba kata kunci lain atau pilih kategori Semua.', 'Try another keyword or choose All.')} />
        ) : (
          <ul className="grid grid-cols-1 gap-3 min-[340px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {list.map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  )
}

export function ArticleDetailPage() {
  const { t, tr } = useI18n()
  const { slug } = useParams()
  const article = articles.find((a) => a.slug === slug)
  if (!article) {
    return (
      <AppShell>
        <PageHeader title={t('Artikel', 'Article')} back="/articles" />
        <div className="p-4">
          <EmptyState title={t('Artikel tidak ditemukan', 'Article not found')} />
        </div>
      </AppShell>
    )
  }
  const related = articles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .concat(articles.filter((a) => a.category !== article.category))
    .slice(0, 2)
  return (
    <AppShell>
      <PageHeader title={t('Artikel', 'Article')} back="/articles" titleAs="p" />
      <article className="p-4 lg:p-8">
        <CategoryCover category={article.category} large className="rounded-3xl" />
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <CategoryTag category={article.category} />
          <span className="text-muted-foreground text-xs">{t(`${article.readMinutes} menit baca`, `${article.readMinutes} min read`)}</span>
        </div>
        <h1 className="mt-3 text-2xl leading-tight font-extrabold">{tr(article.title)}</h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-50">
            <Logo compact />
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-1 text-sm font-semibold">
              {t('Tim Medis Sehat Bersama', 'Sehat Bersama Medical Team')} <BadgeCheck className="text-primary size-4" aria-label={t('Terverifikasi', 'Verified')} />
            </p>
            <p className="text-muted-foreground text-xs">{t('Ditinjau oleh dr. Ayu Lestari · Okt 2026', 'Reviewed by dr. Ayu Lestari · Oct 2026')}</p>
          </div>
        </div>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-800">
          {article.body.map((p, i) => (
            <p key={i}>{tr(p)}</p>
          ))}
        </div>
        <p className="mt-8 rounded-xl bg-slate-100 p-3 text-[13px] text-slate-700">
          {t('Informasi ini bersifat edukatif dan tidak menggantikan diagnosis dokter. ', 'This information is educational and does not replace a doctor’s diagnosis. ')}
          <Link to="/triage" className="text-primary font-semibold underline">
            {t('Konsultasi dengan dokter', 'Talk to a doctor')}
          </Link>
        </p>
        <section aria-labelledby="terkait" className="mt-8">
          <h2 id="terkait" className="mb-3 text-lg font-bold">
            {t('Artikel Terkait', 'Related Articles')}
          </h2>
          <ul className="grid grid-cols-1 gap-3 min-[340px]:grid-cols-2">
            {related.map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} />
              </li>
            ))}
          </ul>
        </section>
      </article>
    </AppShell>
  )
}

export function SearchPage() {
  const { user } = useAuth()
  const { t, tr, lang } = useI18n()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const term = q.trim().toLowerCase()
  // Match both languages so "anak" and "child" both work whichever language is active.
  const match = (...parts: (string | { id: string; en: string })[]) =>
    !term || parts.map((p) => (typeof p === 'string' ? p : `${p.id} ${p.en}`)).join(' ').toLowerCase().includes(term)
  const svc = services.filter((s) => match(s.name, s.description))
  const pkgs = packages.filter((p) => match(p.name, ...p.features))
  const arts = articles.filter((a) => match(a.title, categories[a.category]?.label ?? a.category))
  const total = svc.length + pkgs.length + arts.length

  return (
    <AppShell wide>
      <PageHeader title={t('Cari', 'Search')} back="/home" />
      <div className="space-y-6 p-4 lg:p-8">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" aria-hidden />
          <Input
            type="search"
            autoFocus
            aria-label={t('Cari layanan, artikel, atau paket', 'Search services, articles or plans')}
            placeholder={t('Cari layanan, artikel, paket', 'Search services, articles, plans')}
            value={q}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
            className="h-12 rounded-full bg-white pl-11 text-base"
          />
        </div>
        <p className="text-muted-foreground text-sm" role="status">
          {term ? t(`${total} hasil untuk "${q}"`, `${total} ${total === 1 ? 'result' : 'results'} for "${q}"`) : t('Ketik untuk mencari', 'Type to search')}
        </p>
        {term && total === 0 && (
          <EmptyState title={t('Tidak ada hasil', 'No results')} text={t("Coba kata lain, misalnya 'anak', 'demam', atau 'mingguan'.", "Try another word, such as 'child', 'fever' or 'weekly'.")} />
        )}
        {svc.length > 0 && (
          <section aria-labelledby="hasil-layanan">
            <h2 id="hasil-layanan" className="mb-2 font-bold">
              {t('Layanan', 'Services')}
            </h2>
            <ul className="grid gap-2 md:grid-cols-2">
              {svc.map((s) => (
                <li key={s.key}>
                  <Link to={user ? s.to.user : s.to.guest} className="flex h-full items-center gap-3 rounded-xl border bg-white p-3">
                    <IconBadge icon={s.icon} tone={s.tone} className="size-10" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{tr(s.name)}</span>
                      <span className="text-muted-foreground block text-sm">{tr(s.description)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {pkgs.length > 0 && (
          <section aria-labelledby="hasil-paket">
            <h2 id="hasil-paket" className="mb-2 font-bold">
              {t('Paket', 'Plans')}
            </h2>
            <ul className="grid gap-2 md:grid-cols-2">
              {pkgs.map((p) => (
                <li key={p.id}>
                  <Link to={`/packages?selected=${p.id}`} className="flex flex-wrap items-center justify-between gap-x-3 rounded-xl border bg-white p-3">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-primary font-bold">{rupiah(p.price, lang)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {arts.length > 0 && (
          <section aria-labelledby="hasil-artikel">
            <h2 id="hasil-artikel" className="mb-2 font-bold">
              {t('Artikel', 'Articles')}
            </h2>
            <ul className="grid grid-cols-1 gap-3 min-[340px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {arts.map((a) => (
                <li key={a.slug}>
                  <ArticleCard article={a} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  )
}
