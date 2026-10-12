import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Info, Cpu, Download, FileText, MessageSquare, Paperclip, Phone, SendHorizontal, Share2, Video } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AppShell, BackButton, PageHeader } from '@/components/layout'
import { prescriptions } from '@/lib/data'
import { usePersistentState } from '@/lib/storage'
import { cn } from '@/lib/utils'

type Msg =
  | { id: string; from: 'ai' | 'doctor' | 'me'; text: string; time: string; status?: 'sent' | 'read' }
  | { id: string; from: 'system'; text: string }

const now = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

const seed: Msg[] = [
  {
    id: '1',
    from: 'ai',
    text: 'Hai, aku AI Co-Pilot Sehat Bersama. Aku bantu mengenali gejala awal dan menyarankan ke dokter jika diperlukan. Ada yang bisa aku bantu?',
    time: '10.52',
  },
  { id: '2', from: 'system', text: 'Kamu melewati kuesioner awal. Dokter akan menanyakan keluhanmu secara langsung.' },
  { id: '3', from: 'system', text: 'Kamu dihubungkan ke dokter. Seluruh riwayat chat diteruskan supaya dokter memahami kondisimu.' },
  {
    id: '4',
    from: 'system',
    text: 'Dokter sudah bergabung dan siap membantumu. Kalau paketmu termasuk panggilan suara/video, kamu bisa menelepon langsung dari halaman ini.',
  },
  { id: '5', from: 'doctor', text: 'Halo, selamat pagi. Saya dr. Ayu. Ada keluhan apa hari ini?', time: '10.54' },
]

const doctorReplies = [
  'Baik, sudah berapa lama keluhan tersebut dirasakan?',
  'Apakah disertai demam, mual, atau gejala lain?',
  'Terima kasih informasinya. Saya akan buatkan catatan dan resep bila diperlukan.',
]

export function ConsultationPage() {
  const [messages, setMessages] = usePersistentState<Msg[]>('sb:chat:consult-v2', seed)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = (e: FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setText('')
    setMessages((m) => [...m, { id: crypto.randomUUID(), from: 'me', text: body, time: now(), status: 'sent' }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => {
        const doctorCount = m.filter((x) => x.from === 'doctor').length
        const reply = doctorReplies[(doctorCount - 1) % doctorReplies.length]
        return [
          ...m.map((x) => (x.from === 'me' ? { ...x, status: 'read' as const } : x)),
          { id: crypto.randomUUID(), from: 'doctor', text: reply, time: now() },
        ]
      })
    }, 1500)
  }

  return (
    <AppShell nav={false} className="flex flex-col">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <BackButton />
          <span className="text-primary grid size-11 place-items-center rounded-full bg-emerald-100">
            <Cpu className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="leading-tight font-bold">Konsultasi Dokter Umum</h1>
            <p className="text-muted-foreground text-sm">AI Co-Pilot + dr. Ayu Lestari</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/history">Riwayat</Link>
          </Button>
        </div>
        <div className="flex justify-center gap-2 border-t px-4 py-2">
          <Button variant="outline" className="rounded-xl" onClick={() => toast('Memulai panggilan suara…')}>
            <Phone aria-hidden /> Telepon
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => toast('Memulai panggilan video…')}>
            <Video aria-hidden /> Video
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-4 bg-slate-100 p-4" role="log" aria-label="Percakapan konsultasi" aria-live="polite">
        {messages.map((m) =>
          m.from === 'system' ? (
            // Neutral, centred system event (amber is reserved for warnings).
            <div key={m.id} role="note" className="mx-auto flex max-w-[90%] items-start justify-center gap-2 rounded-full bg-slate-200/70 px-4 py-2 text-center text-[13px] text-slate-800">
              <Info className="mt-0.5 size-4 shrink-0 text-slate-600" aria-hidden />
              <span>{m.text}</span>
            </div>
          ) : (
            <div key={m.id} className={cn('flex', m.from === 'me' && 'justify-end')}>
              <div
                className={cn(
                  'max-w-[78%] rounded-2xl px-4 py-3',
                  m.from === 'me' ? 'bg-primary rounded-br-sm text-white' : 'rounded-bl-sm border bg-white',
                )}
              >
                <p className={cn('mb-0.5 text-xs font-semibold', m.from === 'me' ? 'sr-only' : 'text-muted-foreground')}>
                  {m.from === 'doctor' ? 'dr. Ayu Lestari' : m.from === 'ai' ? 'AI Co-Pilot' : 'Kamu'}
                </p>
                <p className="whitespace-pre-wrap">{m.text}</p>
                <p className={cn('mt-1 text-xs', m.from === 'me' ? 'text-white' : 'text-muted-foreground')}>
                  {m.from === 'me' && (m.status === 'read' ? 'Dibaca ✓✓ · ' : 'Terkirim ✓ · ')}
                  {m.time}
                </p>
              </div>
            </div>
          ),
        )}
        {typing && <div className="text-muted-foreground text-sm italic">Dokter sedang mengetik…</div>}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 space-y-3 border-t bg-white p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="flex justify-between">
          <Button variant="outline" className="text-primary rounded-full" onClick={() => toast('Terima kasih atas masukanmu!')}>
            <MessageSquare aria-hidden /> Beri Masukan
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/prescriptions">
              Resep & Dokumen <ChevronRight aria-hidden />
            </Link>
          </Button>
        </div>
        <form onSubmit={send} className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" className="size-12 rounded-full" aria-label="Lampirkan foto atau dokumen" onClick={() => toast('Lampiran akan tersedia segera')}>
            <Paperclip aria-hidden />
          </Button>
          <label htmlFor="chat-input" className="sr-only">
            Tulis pesan untuk dokter
          </label>
          <input
            id="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis pesan..."
            className="h-12 flex-1 rounded-full border border-[#848ea0] bg-white px-4 text-base outline-none"
          />
          <Button type="submit" size="icon" className="size-12 rounded-full" disabled={!text.trim()} aria-label="Kirim pesan">
            <SendHorizontal aria-hidden />
          </Button>
        </form>
      </div>
    </AppShell>
  )
}

export function PrescriptionsPage() {
  return (
    <AppShell>
      <PageHeader title="Resep & Dokumen" subtitle="Resep digital dari konsultasimu." back />
      <div className="space-y-4 p-4 lg:p-8">
        {prescriptions.map((rx) => (
          <Card key={rx.no} className="gap-4 p-5 shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary text-xs font-bold tracking-widest">RESEP DIGITAL</p>
                <h2 className="font-bold">Sehat Bersama</h2>
              </div>
              <FileText className="text-primary size-7" aria-hidden />
            </div>
            <Separator />
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['No. Resep', rx.no],
                ['Pasien', rx.patient],
                ['Dokter', rx.doctor],
                ['Diterbitkan', rx.issued],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted-foreground text-xs uppercase">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-2 text-xs font-bold tracking-wide">R/ DAFTAR OBAT</p>
              {rx.items.map((it, i) => (
                <div key={i} className="flex gap-3 py-1">
                  <span className="bg-primary grid size-6 place-items-center rounded-full text-xs text-white">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{it.name}</p>
                    <p className="text-muted-foreground text-sm">{it.dose}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground border-t border-dashed pt-3 text-xs">
              <p className="font-semibold text-slate-700">Ditandatangani secara digital</p>
              <p>{rx.doctor} · Validasi elektronik Sehat Bersama</p>
              <p className="font-mono">HASH: {rx.hash}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button className="rounded-xl" onClick={() => window.print()}>
                <Download aria-hidden /> Unduh PDF
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  navigator.clipboard?.writeText(`${location.origin}/verify/${rx.hash}`)
                  toast.success('Tautan verifikasi disalin')
                }}
              >
                <Share2 aria-hidden /> Bagikan Tautan Verifikasi
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  )
}
