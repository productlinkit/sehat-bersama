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
import { cn } from '@/lib/utils'

export function TriagePage() {
  const { user } = useAuth()
  return (
    <AppShell>
      <PageHeader title="Pilih Layanan" subtitle="Semua layanan dalam satu akses Sehat Bersama." back="/home" />
      <div className="space-y-3 p-4 lg:p-8">
        <ul className="space-y-3">
          {services.map((s) => (
            <li key={s.key}>
              <Link
                to={user ? s.to.user : s.to.guest}
                className={cn('flex items-center gap-4 rounded-2xl border p-4 transition active:scale-[0.99]', iconTones[s.tone].tint)}
              >
                <IconBadge icon={s.icon} tone={s.tone} className="size-14 bg-white" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{s.name}</span>
                    {s.badge && <Pill tone={s.badge.tone}>{s.badge.label}</Pill>}
                  </span>
                  <span className="text-muted-foreground block text-sm">{s.description}</span>
                </span>
                <ChevronRight className="text-muted-foreground size-5 shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/help" className="flex items-center gap-3 rounded-2xl bg-emerald-100 p-4 font-semibold text-teal-900">
          <HelpCircle className="size-6 shrink-0" aria-hidden />
          <span className="flex-1">Bingung pilih layanan? Lihat bantuan atau chat dengan tim layanan kami.</span>
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      </div>
    </AppShell>
  )
}

/** Branded pre-consultation screen: who you'll talk to, how it works, what it costs. */
export function ConsultationStartPage() {
  const [params] = useSearchParams()
  const isAnak = params.get('type') === 'anak'
  const quota = quotas.find((q) => q.label === (isAnak ? 'Konsultasi Dokter Anak' : 'Chat Dokter Umum'))
  const steps = [
    { icon: Bot, title: 'Ceritakan keluhanmu', text: 'AI Co-Pilot menanyakan gejala supaya dokter langsung paham kondisimu.' },
    { icon: Stethoscope, title: 'Dokter bergabung', text: `${isAnak ? 'Dokter spesialis anak' : 'Dokter umum'} membalas di chat yang sama, rata-rata dalam 3 menit.` },
    { icon: FileText, title: 'Terima ringkasan & resep', text: 'Catatan konsultasi dan resep digital tersimpan di Riwayat.' },
  ]
  return (
    <AppShell>
      <PageHeader title={isAnak ? 'Konsultasi Dokter Anak' : 'Konsultasi Dokter Umum'} back />
      <div className="space-y-5 p-4 lg:p-8">
        <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-700 p-6 text-white">
          <UserRound className="size-10" aria-hidden />
          <h2 className="mt-3 text-2xl font-bold">Dokter siap mendengarkanmu</h2>
          <p className="mt-1 text-white">Chat privat dan aman. Kamu bisa beralih ke telepon atau video kapan saja.</p>
          {quota && (
            <p className="mt-4 inline-block rounded-full bg-white px-3 py-1 text-sm font-semibold text-teal-900">
              Kuota: {quota.remaining} dari {quota.total} tersisa
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
              <span>
                <span className="block font-semibold">
                  {i + 1}. {s.title}
                </span>
                <span className="text-muted-foreground block text-sm">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-muted-foreground rounded-xl bg-slate-100 p-3 text-sm">{AI_COPILOT_EXPLAINER}</p>
        <Button asChild className="h-12 w-full rounded-full text-base font-semibold">
          <Link to="/consultation" onClick={() => track('consultation_start', { type: isAnak ? 'anak' : 'umum' })}>
            Mulai Konsultasi
          </Link>
        </Button>
        <p className="text-muted-foreground text-center text-[13px]">Kondisi darurat? Hubungi 112 / 119 atau ke IGD terdekat.</p>
      </div>
    </AppShell>
  )
}

export function HomeServicesPage() {
  const { user } = useAuth()
  const [city, setCity] = useState(homeServiceCities[0])
  const navigate = useNavigate()
  return (
    <AppShell>
      <PageHeader
        title="Layanan ke Rumah"
        subtitle="Tenaga medis datang ke lokasimu."
        back="/triage"
      />
      <div className="space-y-4 p-4 lg:p-8">
        <div role="radiogroup" aria-label="Pilih kota" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
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
        <ul className="space-y-3">
          {homeServices.map((s) => (
            <li key={s.name}>
              <Card className="flex-row items-center gap-4 p-4 shadow-none">
                <IconBadge icon={s.icon} tone={s.tone} className="size-14" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">{s.name}</h2>
                  <Pill tone="info">{city}</Pill>
                  <p className="text-muted-foreground mt-1 text-sm">{s.desc}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  aria-label={`Pesan ${s.name} di ${city}`}
                  onClick={() =>
                    user
                      ? toast.success(`Permintaan ${s.name} di ${city} terkirim. Tim kami akan menghubungimu.`)
                      : navigate(`/login?redirect=${encodeURIComponent('/home-services')}`)
                  }
                >
                  Pesan
                </Button>
              </Card>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" className="h-11 rounded-xl" onClick={() => toast('Terima kasih atas masukanmu!')}>
            <MessageSquare aria-hidden /> Beri Masukan
          </Button>
          <Button variant="secondary" className="h-11 rounded-xl" onClick={() => navigate('/history')}>
            Riwayat Medis
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
