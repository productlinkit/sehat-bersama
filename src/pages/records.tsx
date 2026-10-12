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
import { cn } from '@/lib/utils'

export function HistoryPage() {
  const [tab, setTab] = useState<'all' | 'ongoing' | 'done'>('all')
  return (
    <AppShell>
      <PageHeader title="Riwayat Medis" subtitle="Catatan, ringkasan, dan resep dari setiap konsultasi" />
      <div className="space-y-4 p-4 lg:p-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid h-11 w-full grid-cols-3 rounded-full" aria-label="Filter riwayat">
            <TabsTrigger value="all" className="rounded-full">Semua</TabsTrigger>
            <TabsTrigger value="ongoing" className="rounded-full">Berlangsung</TabsTrigger>
            <TabsTrigger value="done" className="rounded-full">Selesai</TabsTrigger>
          </TabsList>
          {(['all', 'ongoing', 'done'] as const).map((value) => {
            const list = consultations.filter((c) => value === 'all' || c.status === value)
            return (
              <TabsContent key={value} value={value} className="mt-4">
                {list.length === 0 && <EmptyState title="Belum ada riwayat" />}
                <ul className="space-y-3">
                  {list.map((c) => (
                    <li key={c.id}>
                      <Link to="/consultation" className="block rounded-xl">
                        <Card className="gap-2 p-4 shadow-none">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">{c.date}</span>
                            <Pill tone={c.status === 'ongoing' ? 'info' : 'teal'}>{c.status === 'ongoing' ? 'Berlangsung' : 'Selesai'}</Pill>
                          </div>
                          <h2 className="font-semibold">{c.title}</h2>
                          <p className="text-muted-foreground text-sm">{c.summary}</p>
                          <p className="text-primary flex items-center gap-1 text-sm font-semibold">
                            {c.status === 'ongoing' ? 'Lanjutkan percakapan' : 'Lihat ringkasan'}
                            <ChevronRight className="size-4" aria-hidden />
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
          <PillIcon className="text-primary size-5" aria-hidden />
          <span className="flex-1 font-semibold">Resep & Dokumen</span>
          <ChevronRight className="text-muted-foreground size-5" aria-hidden />
        </Link>
      </div>
    </AppShell>
  )
}

export function NotificationsPage() {
  return (
    <AppShell>
      <PageHeader title="Notifikasi" back="/home" />
      <ul className="divide-y bg-white">
        {notifications.map((n, i) => (
          <li key={i}>
            <Link to={n.to} className={cn('flex gap-3 px-4 py-4', n.unread && 'bg-emerald-50')}>
              <span className="text-primary grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100">
                <Bell className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  {n.title}
                  {n.unread && <span className="sr-only"> (belum dibaca)</span>}
                </span>
                <span className="text-muted-foreground block text-sm">{n.body}</span>
                <span className="text-muted-foreground mt-1 block text-xs">{n.time}</span>
              </span>
              {n.unread && <span className="bg-primary mt-2 size-2.5 rounded-full" aria-hidden />}
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  )
}

export function ArticlesPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const cat = params.get('kategori') ?? ''
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    setParams(next, { replace: true })
  }
  const list = articles.filter(
    (a) => (!cat || a.category === cat) && (!q || a.title.toLowerCase().includes(q.toLowerCase())),
  )
  const chips = [['', 'Semua'], ...Object.entries(categories).map(([k, v]) => [k, v.label])]

  return (
    <AppShell wide>
      <PageHeader title="Artikel & Informasi" back="/home" />
      <div className="space-y-4 p-4 lg:p-8">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" aria-hidden />
          <Input
            type="search"
            aria-label="Cari artikel"
            placeholder="Cari artikel, mis. demam"
            value={q}
            onChange={(e) => set({ q: e.target.value })}
            className="h-12 rounded-full bg-white pl-11 text-base"
          />
        </div>
        <div role="radiogroup" aria-label="Kategori artikel" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
          {chips.map(([k, label]) => (
            <button
              key={k}
              role="radio"
              aria-checked={cat === k}
              onClick={() => set({ kategori: k })}
              className={cn(
                'min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold',
                cat === k ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <h2 className="sr-only">Daftar artikel</h2>
        <p className="text-muted-foreground text-sm" role="status">
          {list.length} artikel
        </p>
        {list.length === 0 ? (
          <EmptyState title="Artikel tidak ditemukan" text="Coba kata kunci lain atau pilih kategori Semua." />
        ) : (
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
  const { slug } = useParams()
  const article = articles.find((a) => a.slug === slug)
  if (!article) {
    return (
      <AppShell>
        <PageHeader title="Artikel" back="/articles" />
        <div className="p-4">
          <EmptyState title="Artikel tidak ditemukan" />
        </div>
      </AppShell>
    )
  }
  const related = articles.filter((a) => a.slug !== article.slug && a.category === article.category).concat(articles.filter((a) => a.category !== article.category)).slice(0, 2)
  return (
    <AppShell>
      <PageHeader title="Artikel" back="/articles" titleAs="p" />
      <article className="p-4 lg:p-8">
        <CategoryCover category={article.category} large className="rounded-3xl" />
        <div className="mt-5 flex items-center gap-2">
          <CategoryTag category={article.category} />
          <span className="text-muted-foreground text-xs">{article.readMinutes} menit baca</span>
        </div>
        <h1 className="mt-3 text-2xl leading-tight font-extrabold">{article.title}</h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-emerald-50">
            <Logo compact />
          </span>
          <div>
            <p className="flex items-center gap-1 text-sm font-semibold">
              Tim Medis Sehat Bersama <BadgeCheck className="text-primary size-4" aria-label="Terverifikasi" />
            </p>
            <p className="text-muted-foreground text-xs">Ditinjau oleh dr. Ayu Lestari · Okt 2026</p>
          </div>
        </div>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-800">
          {article.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="mt-8 rounded-xl bg-slate-100 p-3 text-[13px] text-slate-700">
          Informasi ini bersifat edukatif dan tidak menggantikan diagnosis dokter.{' '}
          <Link to="/triage" className="text-primary font-semibold underline">
            Konsultasi dengan dokter
          </Link>
        </p>
        <section aria-labelledby="terkait" className="mt-8">
          <h2 id="terkait" className="mb-3 text-lg font-bold">
            Artikel Terkait
          </h2>
          <ul className="grid grid-cols-2 gap-3">
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
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const term = q.trim().toLowerCase()
  const match = (s: string) => !term || s.toLowerCase().includes(term)
  const svc = services.filter((s) => match(s.name + ' ' + s.description))
  const pkgs = packages.filter((p) => match(p.name + ' ' + p.features.join(' ')))
  const arts = articles.filter((a) => match(a.title + ' ' + a.category))
  const total = svc.length + pkgs.length + arts.length

  return (
    <AppShell wide>
      <PageHeader title="Cari" back="/home" />
      <div className="space-y-6 p-4 lg:p-8">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" aria-hidden />
          <Input
            type="search"
            autoFocus
            aria-label="Cari layanan, artikel, atau paket"
            placeholder="Cari layanan, artikel, paket"
            value={q}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
            className="h-12 rounded-full bg-white pl-11 text-base"
          />
        </div>
        <p className="text-muted-foreground text-sm" role="status">
          {term ? `${total} hasil untuk "${q}"` : 'Ketik untuk mencari'}
        </p>
        {term && total === 0 && <EmptyState title="Tidak ada hasil" text="Coba kata lain, misalnya 'anak', 'demam', atau 'mingguan'." />}
        {svc.length > 0 && (
          <section aria-labelledby="hasil-layanan">
            <h2 id="hasil-layanan" className="mb-2 font-bold">
              Layanan
            </h2>
            <ul className="space-y-2">
              {svc.map((s) => (
                <li key={s.key}>
                  <Link to={user ? s.to.user : s.to.guest} className="flex items-center gap-3 rounded-xl border bg-white p-3">
                    <IconBadge icon={s.icon} tone={s.tone} className="size-10" />
                    <span className="flex-1">
                      <span className="block font-semibold">{s.name}</span>
                      <span className="text-muted-foreground block text-sm">{s.description}</span>
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
              Paket
            </h2>
            <ul className="space-y-2">
              {pkgs.map((p) => (
                <li key={p.id}>
                  <Link to={`/packages?selected=${p.id}`} className="flex items-center justify-between rounded-xl border bg-white p-3">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-primary font-bold">{rupiah(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {arts.length > 0 && (
          <section aria-labelledby="hasil-artikel">
            <h2 id="hasil-artikel" className="mb-2 font-bold">
              Artikel
            </h2>
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
