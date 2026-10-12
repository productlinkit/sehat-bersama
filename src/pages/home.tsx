import { Link, useNavigate } from 'react-router-dom'
import { Bell, HelpCircle, MapPin, MessageCircle, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArticleCard, Pill, QuotaList } from '@/components/cards'
import { Carousel } from '@/components/carousel'
import { DoctorsOnline } from '@/components/doctors'
import { AppShell, IconBadge, LanguageToggle, Logo, SectionTitle, touchLink } from '@/components/layout'
import { useAuth } from '@/lib/auth'
import { articles, quotas, services } from '@/lib/data'
import { useI18n } from '@/lib/i18n'

function useGreeting() {
  const { t } = useI18n()
  const h = new Date().getHours()
  if (h < 11) return t('Selamat pagi', 'Good morning')
  if (h < 15) return t('Selamat siang', 'Good afternoon')
  if (h < 18) return t('Selamat sore', 'Good afternoon')
  return t('Selamat malam', 'Good evening')
}

export function HomePage() {
  const { user } = useAuth()
  const { t, tr } = useI18n()
  const navigate = useNavigate()
  const greeting = useGreeting()
  const popular = services.slice(0, 4)
  const firstName = user?.name.split(' ')[0]

  return (
    <AppShell wide>
      <div className="space-y-6 px-4 pt-4 lg:px-8 lg:pt-8">
        {/* Header with brand mark */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link to="/home" className="rounded-lg lg:hidden" aria-label={t('Sehat Bersama, beranda', 'Sehat Bersama, home')}>
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <LanguageToggle compact className="lg:hidden" />
            {!user && (
              <Button asChild variant="ghost" size="icon" className="size-11 rounded-full">
                <Link to="/help" aria-label={t('Bantuan', 'Help')}>
                  <HelpCircle className="size-5" aria-hidden />
                </Link>
              </Button>
            )}
            {user ? (
              <Link
                to="/notifications"
                aria-label={t('Notifikasi, 2 belum dibaca', 'Notifications, 2 unread')}
                className="relative grid size-11 place-items-center rounded-full border border-slate-300 bg-white"
              >
                <Bell className="size-5" aria-hidden />
                <span className="absolute top-2.5 right-3 size-2 rounded-full bg-red-600" aria-hidden />
              </Link>
            ) : (
              <Button asChild className="rounded-full px-4">
                <Link to="/login">{t('Masuk', 'Sign in')}</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-8">
          {/* Left column */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">
                {greeting}, {firstName ?? t('Sahabat Sehat', 'friend')}
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
            >
              <label className="flex h-12 min-w-0 items-center gap-2 rounded-full border border-[#848ea0] bg-white px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-700">
                <Search className="text-muted-foreground size-5 shrink-0" aria-hidden />
                <span className="sr-only">{t('Cari layanan, artikel, atau paket', 'Search services, articles or plans')}</span>
                <input
                  name="q"
                  type="search"
                  placeholder={t('Cari layanan, artikel, paket', 'Search services, articles, plans')}
                  className="w-0 min-w-0 flex-1 bg-transparent text-base outline-none focus-visible:outline-none"
                />
              </label>
            </form>

            {user && (
              <Card className="gap-3 p-4 shadow-none">
                <Link to="/consultation" className="flex flex-wrap items-center gap-3 rounded-xl">
                  <span className="text-primary grid size-12 shrink-0 place-items-center rounded-full bg-emerald-50">
                    <MessageCircle className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 basis-40">
                    <span className="block font-semibold">{t('Konsultasi berlangsung', 'Ongoing consultation')}</span>
                    <span className="text-muted-foreground block text-sm">{t('Dokter Umum · aktivitas terakhir 12 Okt', 'General doctor · last active 12 Oct')}</span>
                  </span>
                  <Pill>{t('Lanjutkan', 'Continue')}</Pill>
                </Link>
                <Button asChild variant="outline" className="h-auto min-h-10 rounded-xl whitespace-normal">
                  <Link to="/consultation/start?type=umum">
                    <RotateCcw aria-hidden /> {t('Konsultasi lagi', 'New consultation')}
                  </Link>
                </Button>
              </Card>
            )}

            <DoctorsOnline />

            <section aria-labelledby="layanan">
              <SectionTitle id="layanan" title={t('Layanan Populer', 'Popular Services')} action={{ label: t('Semua layanan', 'All services'), to: '/triage' }} />
              <ul className="grid grid-cols-4 gap-1.5 min-[360px]:gap-2">
                {popular.map((s) => (
                  <li key={s.key} className="min-w-0">
                    <Link to={user ? s.to.user : s.to.guest} className="flex flex-col items-center gap-2 rounded-xl p-1 text-center">
                      <IconBadge icon={s.icon} tone={s.tone} className="aspect-square w-full max-w-16" />
                      <span className="text-[13px] leading-tight font-semibold [overflow-wrap:anywhere]">{tr(s.shortName)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {user && (
              <Card className="gap-4 p-5 shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-x-2">
                  <h2 className="text-lg font-bold">{t('Kuota Layanan', 'Your Quota')}</h2>
                  <Link to="/account" className={touchLink}>
                    {t('Detail', 'Details')}
                  </Link>
                </div>
                <QuotaList quotas={quotas} />
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="mt-6 space-y-6 lg:mt-0">
            <Carousel
              label={t('Promo unggulan', 'Featured promotions')}
              slides={[
                <PromoCard
                  key="dokter"
                  tag={t('SIAGA 24 JAM', 'OPEN 24/7')}
                  title={t('Konsultasi Dokter Kapan Saja', 'See a Doctor Any Time')}
                  text={t('Mulai dari Rp 2.000, dokter siap membalas dalam hitungan menit.', 'From Rp 2,000, with doctors replying within minutes.')}
                  cta={t('Mulai Konsultasi', 'Start a consultation')}
                  to={user ? '/consultation/start?type=umum' : '/packages?for=umum'}
                  className="from-teal-700 to-emerald-700"
                  tagClass="text-teal-900"
                />,
                <PromoCard
                  key="lega"
                  tag={t('KESEHATAN MENTAL', 'MENTAL HEALTH')}
                  title={t('Coba Lega, Teman Cerita', 'Try Lega, Someone to Talk To')}
                  text={t('Cerita kapan pun kamu perlu. Coba 1 pesan gratis tanpa daftar.', 'Talk whenever you need. Try one free message, no sign-up.')}
                  cta={t('Coba Lega', 'Try Lega')}
                  to="/lega"
                  className="from-violet-700 to-fuchsia-700"
                  tagClass="text-violet-900"
                />,
              ]}
            />

            <section aria-labelledby="artikel">
              <SectionTitle id="artikel" title={t('Artikel & Informasi', 'Articles & Tips')} action={{ label: t('Lihat Semua', 'See all'), to: '/articles' }} />
              <ul className="grid grid-cols-1 gap-3 min-[340px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-2">
                {articles.slice(0, 4).map((a, i) => (
                  <li key={a.slug} className={i === 3 ? 'md:hidden lg:block' : undefined}>
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
      <Button asChild variant="secondary" className="mt-4 h-auto min-h-10 self-start rounded-full bg-white whitespace-normal text-slate-900 hover:bg-white/90">
        <Link to={props.to}>{props.cta}</Link>
      </Button>
    </div>
  )
}
