import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Bot, ChevronRight, FileText, HelpCircle, MessageSquare, Stethoscope, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pill } from '@/components/cards'
import { DoctorsOnline } from '@/components/doctors'
import { AppShell, IconBadge, PageHeader } from '@/components/layout'
import { track } from '@/lib/analytics'
import { useAuth } from '@/lib/auth'
import { AI_COPILOT_EXPLAINER, homeServiceCities, homeServices, iconTones, quotas, services } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function TriagePage() {
  const { user } = useAuth()
  const { t, tr } = useI18n()
  return (
    <AppShell>
      <PageHeader title={t('Pilih Layanan', 'Choose a Service')} subtitle={t('Semua layanan dalam satu akses Sehat Bersama.', 'Every Sehat Bersama service in one place.')} back="/home" />
      <div className="space-y-3 p-4 lg:p-8">
        <ul className="grid gap-3 md:grid-cols-2">
          {services.map((s) => (
            <li key={s.key}>
              <Link
                to={user ? s.to.user : s.to.guest}
                className={cn('flex h-full items-center gap-3 rounded-2xl border p-3 transition active:scale-[0.99] min-[360px]:gap-4 min-[360px]:p-4', iconTones[s.tone].tint)}
              >
                <IconBadge icon={s.icon} tone={s.tone} className="size-12 bg-white min-[360px]:size-14" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-bold">{tr(s.name)}</span>
                    {s.badge && <Pill tone={s.badge.tone}>{tr(s.badge.label)}</Pill>}
                  </span>
                  <span className="text-muted-foreground block text-sm">{tr(s.description)}</span>
                </span>
                <ChevronRight className="text-muted-foreground size-5 shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/help" className="flex items-center gap-3 rounded-2xl bg-emerald-100 p-4 font-semibold text-teal-900">
          <HelpCircle className="size-6 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">{t('Bingung pilih layanan? Lihat bantuan atau chat dengan tim layanan kami.', 'Not sure which service? See help or chat with our support team.')}</span>
          <ChevronRight className="size-5 shrink-0" aria-hidden />
        </Link>
      </div>
    </AppShell>
  )
}

/** Branded pre-consultation screen: who you'll talk to, how it works, what it costs. */
export function ConsultationStartPage() {
  const { t, tr } = useI18n()
  const [params] = useSearchParams()
  const isAnak = params.get('type') === 'anak'
  const quota = quotas.find((q) => q.label.id === (isAnak ? 'Konsultasi Dokter Anak' : 'Chat Dokter Umum'))
  const steps = [
    { icon: Bot, title: t('Ceritakan keluhanmu', 'Describe your symptoms'), text: t('AI Co-Pilot menanyakan gejala supaya dokter langsung paham kondisimu.', 'AI Co-Pilot asks about your symptoms so the doctor understands your situation straight away.') },
    {
      icon: Stethoscope,
      title: t('Dokter bergabung', 'A doctor joins'),
      text: isAnak
        ? t('Dokter spesialis anak membalas di chat yang sama, rata-rata dalam 3 menit.', 'A paediatrician replies in the same chat, usually within 3 minutes.')
        : t('Dokter umum membalas di chat yang sama, rata-rata dalam 3 menit.', 'A general doctor replies in the same chat, usually within 3 minutes.'),
    },
    { icon: FileText, title: t('Terima ringkasan & resep', 'Get a summary & prescription'), text: t('Catatan konsultasi dan resep digital tersimpan di Riwayat.', 'Consultation notes and digital prescriptions are saved in History.') },
  ]
  return (
    <AppShell>
      <PageHeader title={isAnak ? t('Konsultasi Dokter Anak', 'Paediatrician Consultation') : t('Konsultasi Dokter Umum', 'General Doctor Consultation')} back />
      <div className="space-y-5 p-4 lg:p-8">
        <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-700 p-5 text-white min-[360px]:p-6">
          <UserRound className="size-10" aria-hidden />
          <h2 className="mt-3 text-2xl font-bold">{t('Dokter siap mendengarkanmu', 'A doctor is ready to listen')}</h2>
          <p className="mt-1 text-white">{t('Chat privat dan aman. Kamu bisa beralih ke telepon atau video kapan saja.', 'Private, secure chat. Switch to a phone or video call at any time.')}</p>
          {quota && (
            <p className="mt-4 inline-block rounded-full bg-white px-3 py-1 text-sm font-semibold text-teal-900">
              {t(`Kuota: ${quota.remaining} dari ${quota.total} tersisa`, `Quota: ${quota.remaining} of ${quota.total} left`)}
            </p>
          )}
        </div>
        <DoctorsOnline />
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3 rounded-2xl border bg-white p-4">
              <span className="text-primary grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100">
                <s.icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">
                  {i + 1}. {s.title}
                </span>
                <span className="text-muted-foreground block text-sm">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-muted-foreground rounded-xl bg-slate-100 p-3 text-sm">{tr(AI_COPILOT_EXPLAINER)}</p>
        <Button asChild className="h-auto min-h-12 w-full rounded-full text-base font-semibold whitespace-normal">
          <Link to="/consultation" onClick={() => track('consultation_start', { type: isAnak ? 'anak' : 'umum' })}>
            {t('Mulai Konsultasi', 'Start consultation')}
          </Link>
        </Button>
        <p className="text-muted-foreground text-center text-[13px]">
          {t('Kondisi darurat? Hubungi 112 / 119 atau ke IGD terdekat.', 'Emergency? Call 112 / 119 or go to the nearest emergency department.')}
        </p>
      </div>
    </AppShell>
  )
}

export function HomeServicesPage() {
  const { user } = useAuth()
  const { t, tr } = useI18n()
  const [city, setCity] = useState(homeServiceCities[0])
  const navigate = useNavigate()
  return (
    <AppShell>
      <PageHeader title={t('Layanan ke Rumah', 'Home Services')} subtitle={t('Tenaga medis datang ke lokasimu.', 'Medical staff come to you.')} back="/triage" />
      <div className="space-y-4 p-4 lg:p-8">
        <div role="radiogroup" aria-label={t('Pilih kota', 'Choose a city')} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
          {homeServiceCities.map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={c === city}
              onClick={() => setCity(c)}
              className={cn(
                'min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold',
                c === city ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white',
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {homeServices.map((s) => (
            <li key={s.name.id}>
              <Card className="h-full flex-row items-start gap-3 p-4 shadow-none min-[360px]:gap-4">
                <IconBadge icon={s.icon} tone={s.tone} className="size-12 min-[360px]:size-14" />
                <div className="min-w-0 flex-1 space-y-1">
                  <h2 className="font-bold">{tr(s.name)}</h2>
                  <Pill tone="info">{city}</Pill>
                  <p className="text-muted-foreground text-sm">{tr(s.desc)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 rounded-full"
                    aria-label={t(`Pesan ${s.name.id} di ${city}`, `Book ${s.name.en} in ${city}`)}
                    onClick={() =>
                      user
                        ? toast.success(t(`Permintaan ${s.name.id} di ${city} terkirim. Tim kami akan menghubungimu.`, `Your ${s.name.en} request in ${city} was sent. Our team will contact you.`))
                        : navigate(`/login?redirect=${encodeURIComponent('/home-services')}`)
                    }
                  >
                    {t('Pesan', 'Book')}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-1 gap-3 pt-2 min-[360px]:grid-cols-2">
          <Button variant="outline" className="h-auto min-h-11 rounded-xl whitespace-normal" onClick={() => toast(t('Terima kasih atas masukanmu!', 'Thanks for your feedback!'))}>
            <MessageSquare aria-hidden /> {t('Beri Masukan', 'Give feedback')}
          </Button>
          <Button variant="secondary" className="h-auto min-h-11 rounded-xl whitespace-normal" onClick={() => navigate('/history')}>
            {t('Riwayat Medis', 'Medical History')}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
