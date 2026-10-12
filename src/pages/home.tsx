import { Link, useNavigate } from 'react-router-dom'
import { Bell, HelpCircle, MapPin, MessageCircle, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArticleCard, Pill, QuotaList } from '@/components/cards'
import { Carousel } from '@/components/carousel'
import { DoctorsOnline } from '@/components/doctors'
import { AppShell, IconBadge, Logo, SectionTitle } from '@/components/layout'
import { useAuth } from '@/lib/auth'
import { articles, quotas, services } from '@/lib/data'

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const popular = services.slice(0, 4)
  const firstName = user?.name.split(' ')[0]

  return (
    <AppShell wide>
      <div className="space-y-6 px-4 pt-4 lg:px-8 lg:pt-8">
        {/* Header with brand mark */}
        <div className="flex items-center justify-between gap-2">
          <Link to="/home" className="rounded-lg lg:hidden" aria-label="Sehat Bersama, beranda">
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {!user && (
              <Button asChild variant="ghost" size="icon" className="size-11 rounded-full">
                <Link to="/help" aria-label="Bantuan">
                  <HelpCircle className="size-5" aria-hidden />
                </Link>
              </Button>
            )}
            {user ? (
              <Link
                to="/notifications"
                aria-label="Notifikasi, 2 belum dibaca"
                className="relative grid size-11 place-items-center rounded-full border border-slate-300 bg-white"
              >
                <Bell className="size-5" aria-hidden />
                <span className="absolute top-2.5 right-3 size-2 rounded-full bg-red-600" aria-hidden />
              </Link>
            ) : (
              <Button asChild className="rounded-full px-5">
                <Link to="/login">Masuk</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-8">
          {/* Left column */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">
                {greeting()}, {firstName ?? 'Sahabat Sehat'}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                <MapPin className="size-4" aria-hidden /> Indonesia
              </p>
            </div>

            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                const q = new FormData(e.currentTarget).get('q')?.toString().trim()
                navigate(`/search${q ? `?q=${encodeURIComponent(q)}` : ''}`)
              }}
              className="flex gap-2"
            >
              <label className="flex h-12 flex-1 items-center gap-2 rounded-full border border-[#848ea0] bg-white px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-700">
                <Search className="text-muted-foreground size-5 shrink-0" aria-hidden />
                <span className="sr-only">Cari layanan, artikel, atau paket</span>
                <input name="q" type="search" placeholder="Cari layanan, artikel, paket" className="min-w-0 flex-1 bg-transparent outline-none focus-visible:outline-none" />
              </label>
            </form>

            {user ? (
              <Card className="gap-3 p-4 shadow-none">
                <Link to="/consultation" className="flex items-center gap-3 rounded-xl">
                  <span className="text-primary grid size-12 shrink-0 place-items-center rounded-full bg-emerald-50">
                    <MessageCircle className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">Konsultasi berlangsung</span>
                    <span className="text-muted-foreground block text-sm">Dokter Umum · aktivitas terakhir 12 Okt</span>
                  </span>
                  <Pill>Lanjutkan</Pill>
                </Link>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/consultation/start?type=umum">
                    <RotateCcw aria-hidden /> Konsultasi lagi
                  </Link>
                </Button>
              </Card>
            ) : null}

            <DoctorsOnline />

            <section aria-labelledby="layanan">
              <SectionTitle id="layanan" title="Layanan Populer" action={{ label: 'Semua layanan', to: '/triage' }} />
              <ul className="grid grid-cols-4 gap-2">
                {popular.map((s) => (
                  <li key={s.key}>
                    <Link to={user ? s.to.user : s.to.guest} className="flex flex-col items-center gap-2 rounded-xl p-1 text-center">
                      <IconBadge icon={s.icon} tone={s.tone} className="size-16" />
                      <span className="text-[13px] leading-tight font-semibold">{s.shortName}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {user && (
              <Card className="gap-4 p-5 shadow-none">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Kuota Layanan</h2>
                  <Link to="/account" className="text-primary rounded px-1 text-sm font-semibold">
                    Detail
                  </Link>
                </div>
                <QuotaList quotas={quotas} />
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="mt-6 space-y-6 lg:mt-0">
            <Carousel
              label="Promo unggulan"
              slides={[
                <PromoCard
                  key="dokter"
                  tag="SIAGA 24 JAM"
                  title="Konsultasi Dokter Kapan Saja"
                  text="Mulai dari Rp 2.000, dokter siap membalas dalam hitungan menit."
                  cta="Mulai Konsultasi"
                  to={user ? '/consultation/start?type=umum' : '/packages?for=umum'}
                  className="from-teal-700 to-emerald-700"
                  tagClass="text-teal-900"
                />,
                <PromoCard
                  key="lega"
                  tag="KESEHATAN MENTAL"
                  title="Coba Lega, Teman Cerita"
                  text="Cerita kapan pun kamu perlu. Coba 1 pesan gratis tanpa daftar."
                  cta="Coba Lega"
                  to="/lega"
                  className="from-violet-700 to-fuchsia-700"
                  tagClass="text-violet-900"
                />,
              ]}
            />

            <section aria-labelledby="artikel">
              <SectionTitle id="artikel" title="Artikel & Informasi" action={{ label: 'Lihat Semua', to: '/articles' }} />
              <ul className="grid grid-cols-2 gap-3">
                {articles.slice(0, 4).map((a) => (
                  <li key={a.slug}>
                    <ArticleCard article={a} />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function PromoCard(props: { tag: string; title: string; text: string; cta: string; to: string; className: string; tagClass: string }) {
  return (
    <div className={`flex min-h-48 flex-col rounded-3xl bg-gradient-to-br p-5 text-white ${props.className}`}>
      {/* Solid white chip with dark text (≥7:1), not translucent white on a gradient. */}
      <span className={`self-start rounded-full bg-white px-2.5 py-1 text-xs font-bold tracking-wide ${props.tagClass}`}>{props.tag}</span>
      <h3 className="mt-3 text-xl leading-tight font-bold">{props.title}</h3>
      <p className="mt-1 text-sm text-white">{props.text}</p>
      <Button asChild variant="secondary" className="mt-auto self-start rounded-full bg-white text-slate-900 hover:bg-white/90">
        <Link to={props.to}>{props.cta}</Link>
      </Button>
    </div>
  )
}
