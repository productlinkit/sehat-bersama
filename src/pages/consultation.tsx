import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Cpu, Download, FileText, Info, MessageSquare, Paperclip, Phone, SendHorizontal, Share2, Video } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AppShell, BackButton, PageHeader } from '@/components/layout'
import { prescriptions } from '@/lib/data'
import { useI18n, type L } from '@/lib/i18n'
import { usePersistentState } from '@/lib/storage'
import { cn } from '@/lib/utils'

/** Seeded and system messages are bilingual (L); what the patient types is stored as typed. */
type Msg =
  | { id: string; from: 'ai' | 'doctor' | 'me'; text: L | string; at: string; status?: 'sent' | 'read' }
  | { id: string; from: 'system'; text: L }

const seed: Msg[] = [
  {
    id: '1',
    from: 'ai',
    text: {
      id: 'Hai, aku AI Co-Pilot Sehat Bersama. Aku bantu mengenali gejala awal dan menyarankan ke dokter jika diperlukan. Ada yang bisa aku bantu?',
      en: 'Hi, I’m the Sehat Bersama AI Co-Pilot. I help identify early symptoms and refer you to a doctor when needed. How can I help?',
    },
    at: '2026-10-12T10:52',
  },
  { id: '2', from: 'system', text: { id: 'Kamu melewati kuesioner awal. Dokter akan menanyakan keluhanmu secara langsung.', en: 'You skipped the intake questions. The doctor will ask about your symptoms directly.' } },
  { id: '3', from: 'system', text: { id: 'Kamu dihubungkan ke dokter. Seluruh riwayat chat diteruskan supaya dokter memahami kondisimu.', en: 'You’re now connected to a doctor. Your full chat history has been shared so they understand your situation.' } },
  {
    id: '4',
    from: 'system',
    text: {
      id: 'Dokter sudah bergabung dan siap membantumu. Kalau paketmu termasuk panggilan suara/video, kamu bisa menelepon langsung dari halaman ini.',
      en: 'The doctor has joined and is ready to help. If your plan includes voice/video calls, you can call straight from this page.',
    },
  },
  { id: '5', from: 'doctor', text: { id: 'Halo, selamat pagi. Saya dr. Ayu. Ada keluhan apa hari ini?', en: 'Hello, good morning. I’m dr. Ayu. What brings you in today?' }, at: '2026-10-12T10:54' },
]

const doctorReplies: L[] = [
  { id: 'Baik, sudah berapa lama keluhan tersebut dirasakan?', en: 'I see. How long have you had these symptoms?' },
  { id: 'Apakah disertai demam, mual, atau gejala lain?', en: 'Do you also have a fever, nausea or any other symptoms?' },
  { id: 'Terima kasih informasinya. Saya akan buatkan catatan dan resep bila diperlukan.', en: 'Thank you. I’ll write up notes and a prescription if needed.' },
]

export function ConsultationPage() {
  const { t, tr, date } = useI18n()
  const [messages, setMessages] = usePersistentState<Msg[]>('sb:chat:consult-v3', seed)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const time = (iso: string) => date(iso, { hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = (e: FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setText('')
    setMessages((m) => [...m, { id: crypto.randomUUID(), from: 'me', text: body, at: new Date().toISOString(), status: 'sent' }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => {
        const doctorCount = m.filter((x) => x.from === 'doctor').length
        const reply = doctorReplies[(doctorCount - 1) % doctorReplies.length]
        return [
          ...m.map((x) => (x.from === 'me' ? { ...x, status: 'read' as const } : x)),
          { id: crypto.randomUUID(), from: 'doctor', text: reply, at: new Date().toISOString() },
        ]
      })
    }, 1500)
  }

  return (
    <AppShell nav={false} className="flex flex-col">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="flex items-center gap-2 px-3 py-3 min-[360px]:gap-3 min-[360px]:px-4">
          <BackButton />
          <span className="text-primary hidden size-11 shrink-0 place-items-center rounded-full bg-emerald-100 min-[360px]:grid">
            <Cpu className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="leading-tight font-bold">{t('Konsultasi Dokter Umum', 'General Doctor Consultation')}</h1>
            <p className="text-muted-foreground text-sm">AI Co-Pilot + dr. Ayu Lestari</p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
            <Link to="/history">{t('Riwayat', 'History')}</Link>
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-2 border-t px-4 py-2">
          <Button variant="outline" className="rounded-xl" onClick={() => toast(t('Memulai panggilan suara…', 'Starting voice call…'))}>
            <Phone aria-hidden /> {t('Telepon', 'Call')}
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => toast(t('Memulai panggilan video…', 'Starting video call…'))}>
            <Video aria-hidden /> Video
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-4 bg-slate-100 p-3 min-[360px]:p-4" role="log" aria-label={t('Percakapan konsultasi', 'Consultation conversation')} aria-live="polite">
        {messages.map((m) =>
          m.from === 'system' ? (
            // Neutral, centred system event (amber is reserved for warnings).
            <div key={m.id} role="note" className="mx-auto flex max-w-[95%] items-start justify-center gap-2 rounded-2xl bg-slate-200/70 px-4 py-2 text-center text-[13px] text-slate-800 min-[360px]:max-w-[90%]">
              <Info className="mt-0.5 size-4 shrink-0 text-slate-600" aria-hidden />
              <span>{tr(m.text)}</span>
            </div>
          ) : (
            <div key={m.id} className={cn('flex', m.from === 'me' && 'justify-end')}>
              <div className={cn('max-w-[85%] rounded-2xl px-4 py-3 min-[360px]:max-w-[78%]', m.from === 'me' ? 'bg-primary rounded-br-sm text-white' : 'rounded-bl-sm border bg-white')}>
                <p className={cn('mb-0.5 text-xs font-semibold', m.from === 'me' ? 'sr-only' : 'text-muted-foreground')}>
                  {m.from === 'doctor' ? 'dr. Ayu Lestari' : m.from === 'ai' ? 'AI Co-Pilot' : t('Kamu', 'You')}
                </p>
                <p className="whitespace-pre-wrap">{tr(m.text)}</p>
                <p className={cn('mt-1 text-xs', m.from === 'me' ? 'text-white' : 'text-muted-foreground')}>
                  {m.from === 'me' && (m.status === 'read' ? t('Dibaca ✓✓ · ', 'Read ✓✓ · ') : t('Terkirim ✓ · ', 'Sent ✓ · '))}
                  {time(m.at)}
                </p>
              </div>
            </div>
          ),
        )}
        {typing && <div className="text-muted-foreground text-sm italic">{t('Dokter sedang mengetik…', 'The doctor is typing…')}</div>}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 space-y-3 border-t bg-white p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="outline" className="text-primary rounded-full" onClick={() => toast(t('Terima kasih atas masukanmu!', 'Thanks for your feedback!'))}>
            <MessageSquare aria-hidden /> {t('Beri Masukan', 'Feedback')}
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/prescriptions">
              {t('Resep & Dokumen', 'Prescriptions')} <ChevronRight aria-hidden />
            </Link>
          </Button>
        </div>
        <form onSubmit={send} className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-12 shrink-0 rounded-full"
            aria-label={t('Lampirkan foto atau dokumen', 'Attach a photo or document')}
            onClick={() => toast(t('Lampiran akan tersedia segera', 'Attachments are coming soon'))}
          >
            <Paperclip aria-hidden />
          </Button>
          <label htmlFor="chat-input" className="sr-only">
            {t('Tulis pesan untuk dokter', 'Write a message to the doctor')}
          </label>
          <input
            id="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('Tulis pesan...', 'Write a message...')}
            className="h-12 w-0 min-w-0 flex-1 rounded-full border border-[#848ea0] bg-white px-4 text-base outline-none"
          />
          <Button type="submit" size="icon" className="size-12 shrink-0 rounded-full" disabled={!text.trim()} aria-label={t('Kirim pesan', 'Send message')}>
            <SendHorizontal aria-hidden />
          </Button>
        </form>
      </div>
    </AppShell>
  )
}

export function PrescriptionsPage() {
  const { t, tr, date } = useI18n()
  return (
    <AppShell>
      <PageHeader title={t('Resep & Dokumen', 'Prescriptions & Documents')} subtitle={t('Resep digital dari konsultasimu.', 'Digital prescriptions from your consultations.')} back />
      <div className="space-y-4 p-4 lg:p-8">
        {prescriptions.map((rx) => (
          <Card key={rx.no} className="gap-4 p-4 shadow-none min-[360px]:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-primary text-xs font-bold tracking-widest">{t('RESEP DIGITAL', 'DIGITAL PRESCRIPTION')}</p>
                <h2 className="font-bold">Sehat Bersama</h2>
              </div>
              <FileText className="text-primary size-7 shrink-0" aria-hidden />
            </div>
            <Separator />
            <dl className="grid grid-cols-1 gap-3 text-sm min-[360px]:grid-cols-2">
              {[
                [t('No. Resep', 'Prescription no.'), rx.no],
                [t('Pasien', 'Patient'), rx.patient],
                [t('Dokter', 'Doctor'), rx.doctor],
                [t('Diterbitkan', 'Issued'), date(rx.issued, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-muted-foreground text-xs uppercase">{k}</dt>
                  <dd className="font-semibold [overflow-wrap:anywhere]">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-2 text-xs font-bold tracking-wide">{t('R/ DAFTAR OBAT', 'Rx / MEDICINES')}</p>
              {rx.items.map((it, i) => (
                <div key={i} className="flex gap-3 py-1">
                  <span className="bg-primary grid size-6 shrink-0 place-items-center rounded-full text-xs text-white">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-semibold">{it.name}</p>
                    <p className="text-muted-foreground text-sm">{tr(it.dose)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground border-t border-dashed pt-3 text-xs">
              <p className="font-semibold text-slate-700">{t('Ditandatangani secara digital', 'Digitally signed')}</p>
              <p>
                {rx.doctor} · {t('Validasi elektronik Sehat Bersama', 'Sehat Bersama electronic validation')}
              </p>
              <p className="font-mono [overflow-wrap:anywhere]">HASH: {rx.hash}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
              <Button className="h-auto min-h-10 rounded-xl whitespace-normal" onClick={() => window.print()}>
                <Download aria-hidden /> {t('Unduh PDF', 'Download PDF')}
              </Button>
              <Button
                variant="outline"
                className="h-auto min-h-10 rounded-xl whitespace-normal"
                onClick={() => {
                  navigator.clipboard?.writeText(`${location.origin}/verify/${rx.hash}`)
                  toast.success(t('Tautan verifikasi disalin', 'Verification link copied'))
                }}
              >
                <Share2 aria-hidden /> {t('Bagikan Tautan Verifikasi', 'Share verification link')}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  )
}
