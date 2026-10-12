import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check, MessageCircle, MessageSquare, Phone, SendHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { IconSparkHeart } from '@/components/icons'
import { Field } from '@/components/form'
import { AppShell, Logo, PageHeader } from '@/components/layout'
import { useAuth } from '@/lib/auth'
import { moods, type MoodKey } from '@/lib/data'
import { todayKey, usePersistentState } from '@/lib/storage'
import { cn } from '@/lib/utils'

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

/** The last 7 days, oldest first, as YYYY-MM-DD keys. */
function lastSevenDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { key: d.toISOString().slice(0, 10), label: DAY_LABELS[d.getDay()], name: DAY_NAMES[d.getDay()] }
  })
}

const moodScore: Record<MoodKey, number> = { energik: 5, senang: 4, biasa: 3, bingung: 2, sedih: 1 }
const moodOf = (k: MoodKey) => moods.find((m) => m.key === k)!

interface JournalEntry {
  id: string
  title: string
  body: string
  mood: MoodKey
  date: string
}

/** Sub-brand bridge: Lega is purple, but always signed as part of the teal Sehat Bersama family. */
function LegaByline() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white px-2 py-0.5 text-xs font-semibold text-teal-800">
      <img src="/logo.svg" alt="" className="size-4" /> bagian dari Sehat Bersama
    </span>
  )
}

function EmergencyNote() {
  return (
    <aside aria-label="Bantuan darurat" className="flex gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950">
      <Phone className="mt-0.5 size-5 shrink-0 text-teal-800" aria-hidden />
      <p>
        Lega bukan pengganti layanan darurat. Kalau kamu butuh bantuan segera, hubungi <b>119 ext 8</b> (layanan kesehatan jiwa Kemenkes) atau{' '}
        <b>112</b>.
      </p>
    </aside>
  )
}

function MoodPicker({ value, onPick, disabled }: { value?: MoodKey; onPick: (m: MoodKey) => void; disabled?: boolean }) {
  return (
    <div role="group" aria-label="Pilih perasaanmu hari ini" className="flex justify-between">
      {moods.map((m) => (
        <button
          key={m.key}
          type="button"
          aria-pressed={value === m.key}
          onClick={() => onPick(m.key)}
          disabled={disabled}
          className="flex min-w-12 flex-col items-center gap-1.5 rounded-xl p-1"
        >
          <span
            className={cn(
              'grid size-12 place-items-center rounded-full bg-violet-50 text-violet-800 transition [--icon-fill:#ddd6fe]',
              value === m.key && 'bg-white ring-[3px] ring-violet-700 [--icon-fill:#c4b5fd]',
            )}
            aria-hidden
          >
            <m.icon className="size-9" />
          </span>
          <span className={cn('text-xs', value === m.key ? 'font-bold text-violet-800' : 'text-slate-700')}>{m.label}</span>
        </button>
      ))}
    </div>
  )
}

export function LegaPage() {
  const { user } = useAuth()
  return (
    <AppShell>
      <PageHeader title="Lega" subtitle="Ruang tenang untuk bercerita, mencatat, dan menata perasaan." back="/home" />
      <div className="space-y-5 p-4 lg:p-8">
        <LegaByline />
        {user ? <LegaDashboard /> : <LegaGuestPreview />}
        <Button asChild className="h-14 w-full rounded-full bg-violet-700 text-base font-semibold hover:bg-violet-800">
          <Link to="/lega/chat">
            <MessageCircle aria-hidden /> {user ? 'Ngobrol dengan Lega' : 'Coba 1 pesan gratis'}
          </Link>
        </Button>
        <EmergencyNote />
      </div>
    </AppShell>
  )
}

/** Guests see what Lega offers, with a working mood picker that invites sign-up. */
function LegaGuestPreview() {
  const [picked, setPicked] = useState<MoodKey>()
  return (
    <>
      <Card className="items-center gap-3 border-violet-200 bg-violet-50 p-6 text-center shadow-none">
        <IconSparkHeart className="size-14 text-violet-800 [--icon-fill:#c4b5fd]" />
        <h2 className="text-lg font-bold">Teman cerita AI 24/7</h2>
        <p className="text-sm text-slate-700">
          Ceritakan perasaanmu, catat perasaan harian, dan tulis jurnal emosi. Kamu bisa coba 1 pesan tanpa daftar.
        </p>
      </Card>
      <Card className="gap-4 p-5 shadow-none">
        <div>
          <h2 className="text-lg font-bold">Cek Perasaan Harian</h2>
          <p className="text-muted-foreground text-sm">Bagaimana perasaanmu hari ini?</p>
        </div>
        <MoodPicker value={picked} onPick={setPicked} />
        {picked && (
          <div role="status" className="rounded-2xl bg-violet-50 p-4 text-sm text-violet-950">
            Terima kasih sudah jujur dengan perasaanmu ({moodOf(picked).label}).{' '}
            <Link to="/register?redirect=%2Flega" className="font-semibold text-violet-800 underline">
              Daftar gratis
            </Link>{' '}
            untuk menyimpan catatan perasaan, melihat hari beruntun, dan ringkasan mingguan.
          </div>
        )}
      </Card>
      <WeeklySummary checkins={{}} sample />
    </>
  )
}

function LegaDashboard() {
  const [checkins, setCheckins] = usePersistentState<Record<string, MoodKey>>('sb:lega:checkins', {})
  const [journal, setJournal] = usePersistentState<JournalEntry[]>('sb:lega:journal', [])
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ title: '', body: '' })
  const [errors, setErrors] = useState({ title: '', body: '' })
  const week = lastSevenDays()
  const today = checkins[todayKey()]

  let streak = 0
  for (let i = week.length - 1; i >= 0 && checkins[week[i].key]; i--) streak++

  const weekMoods = week.map((d) => checkins[d.key]).filter(Boolean) as MoodKey[]

  const saveEntry = (e: FormEvent) => {
    e.preventDefault()
    const next = { title: draft.title.trim() ? '' : 'Beri judul singkat.', body: draft.body.trim() ? '' : 'Tulis sedikit tentang perasaanmu.' }
    setErrors(next)
    if (next.title || next.body) return
    setJournal((j) => [
      {
        id: crypto.randomUUID(),
        ...draft,
        mood: today ?? 'biasa',
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      },
      ...j,
    ])
    setDraft({ title: '', body: '' })
    setOpen(false)
  }

  const journalDialog = (
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-violet-700 hover:bg-violet-800">+ Tulis jurnal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tulis Jurnal</DialogTitle>
          <DialogDescription>Hanya kamu yang bisa membaca jurnal ini.</DialogDescription>
        </DialogHeader>
        <form id="journal" noValidate onSubmit={saveEntry} className="space-y-3">
          <Field label="Judul" error={errors.title}>
            {(f) => <Input {...f} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />}
          </Field>
          <Field label="Apa yang kamu rasakan?" error={errors.body}>
            {(f) => <Textarea {...f} rows={5} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />}
          </Field>
        </form>
        <DialogFooter>
          <Button type="submit" form="journal" className="bg-violet-700 hover:bg-violet-800">
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      <Card className="gap-4 p-5 shadow-none">
        <div>
          <h2 className="text-lg font-bold">Cek Perasaan Harian</h2>
          <p className="text-muted-foreground text-sm">Bagaimana perasaanmu hari ini?</p>
        </div>
        <MoodPicker
          value={today}
          onPick={(m) => {
            setCheckins({ ...checkins, [todayKey()]: m })
            if (!today) toast.success('Perasaanmu hari ini tersimpan')
          }}
        />
        <div className="space-y-2 rounded-2xl bg-violet-50 p-4 text-center">
          <p className="text-xs font-bold tracking-wide text-violet-800">{streak} HARI BERUNTUN</p>
          <ol className="flex justify-center gap-2" aria-label="Catatan perasaan 7 hari terakhir">
            {week.map((d) => (
              <li key={d.key} className="flex flex-col items-center gap-1">
                <span
                  className={cn('grid size-7 place-items-center rounded-full border-2 border-violet-700', checkins[d.key] && 'bg-violet-700 text-white')}
                  aria-hidden
                >
                  {checkins[d.key] && <Check className="size-3.5" />}
                </span>
                <span className="text-xs text-slate-700" aria-hidden>
                  {d.label}
                </span>
                <span className="sr-only">
                  {d.name}: {checkins[d.key] ? moodOf(checkins[d.key]).label : 'belum dicatat'}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Card>

      <WeeklySummary checkins={checkins} sample={weekMoods.length === 0} />

      <section className="space-y-3" aria-labelledby="jurnal">
        <div className="flex items-center justify-between">
          <h2 id="jurnal" className="text-lg font-bold">
            Jurnal Emosi
          </h2>
          {journalDialog}
        </div>
        {journal.length === 0 && (
          <p className="text-muted-foreground rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm">
            Belum ada catatan. Tulis apa yang kamu rasakan hari ini.
          </p>
        )}
        <ul className="space-y-3">
          {journal.map((j) => (
            <li key={j.id}>
              <Card className="gap-1 border-violet-200 bg-violet-50 p-4 shadow-none">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-bold">{j.title}</h3>
                    <p className="text-muted-foreground text-xs">{j.date}</p>
                  </div>
                  {(() => {
                    const M = moodOf(j.mood).icon
                    return (
                      <span role="img" aria-label={`Perasaan: ${moodOf(j.mood).label}`} className="text-violet-800 [--icon-fill:#ddd6fe]">
                        <M className="size-7" />
                      </span>
                    )
                  })()}
                  <button
                    type="button"
                    aria-label={`Hapus jurnal ${j.title}`}
                    onClick={() => setJournal((xs) => xs.filter((x) => x.id !== j.id))}
                    className="text-muted-foreground grid size-8 place-items-center rounded-full hover:bg-violet-100"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{j.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

    </>
  )
}

/** Weekly mood chart. With no data it shows a labelled sample so the card never looks empty. */
function WeeklySummary({ checkins, sample }: { checkins: Record<string, MoodKey>; sample?: boolean }) {
  const week = lastSevenDays()
  const sampleMoods: MoodKey[] = ['biasa', 'senang', 'bingung', 'senang', 'energik', 'biasa', 'senang']
  const data = week.map((d, i) => (sample ? sampleMoods[i] : checkins[d.key]))
  const real = week.map((d) => checkins[d.key]).filter(Boolean) as MoodKey[]
  const counts = real.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m]: (acc[m] ?? 0) + 1 }), {})
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return (
    <Card className="gap-4 p-5 shadow-none">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">Ringkasan Mingguan</h2>
          <p className="text-muted-foreground text-sm">
            {sample
              ? 'Begini ringkasanmu nanti terlihat. Catat perasaanmu hari ini untuk mulai.'
              : `Minggu ini kamu mencatat ${real.length} hari. Perasaan paling sering: ${moodOf(top[0] as MoodKey).label} (${top[1]} hari).`}
          </p>
        </div>
        {sample && <span className="shrink-0 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">Contoh</span>}
      </div>
      <div className="flex h-40 items-end justify-between gap-3" aria-hidden>
        {week.map((d, i) => {
          const m = data[i]
          const Icon = m ? moodOf(m).icon : null
          return (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
              {Icon && <Icon className="size-6 text-violet-800 [--icon-fill:#ddd6fe]" />}
              <div
                className={cn('w-full rounded-t-md', m ? (sample ? 'bg-violet-300' : 'bg-violet-700') : 'bg-violet-100')}
                style={{ height: m ? `${moodScore[m] * 18}px` : '10px' }}
              />
              <span className="text-xs text-slate-700">{d.label}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

interface ChatMsg {
  id: string
  from: 'lega' | 'me'
  text: string
}

// Placeholder replies; wire this to a real model endpoint later.
const legaReplies = [
  'Terima kasih sudah mau bercerita. Aku di sini mendengarkan. Bisa ceritakan lebih lanjut apa yang paling kamu rasakan sekarang?',
  'Perasaan itu valid, dan wajar kalau terasa berat. Apa yang biasanya membantumu merasa sedikit lebih tenang?',
  'Coba tarik napas perlahan sejenak. Kalau mau, kita bisa urai satu per satu hal yang sedang memenuhi pikiranmu.',
]

const GUEST_LIMIT = 1

export function LegaChatPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [messages, setMessages] = usePersistentState<ChatMsg[]>(user ? 'sb:lega:chat' : 'sb:lega:guest-chat', [])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sent = messages.filter((m) => m.from === 'me').length
  const guestLocked = !user && sent >= GUEST_LIMIT

  const send = (e: FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || guestLocked) return
    setText('')
    setMessages((m) => [...m, { id: crypto.randomUUID(), from: 'me', text: body }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => {
        const n = m.filter((x) => x.from === 'lega').length
        return [...m, { id: crypto.randomUUID(), from: 'lega', text: legaReplies[n % legaReplies.length] }]
      })
    }, 1200)
  }

  const redirect = encodeURIComponent(location.pathname)

  return (
    <AppShell nav={false} className="flex flex-col lg:max-w-2xl">
      <PageHeader
        title="Lega"
        subtitle={user ? 'Teman cerita AI · bagian dari Sehat Bersama' : 'Mode tamu · 1 pesan gratis'}
        back="/lega"
        right={
          user && (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to="/lega">Jurnal</Link>
            </Button>
          )
        }
      />
      <div className="flex-1 space-y-3 bg-violet-50 p-4" role="log" aria-label="Percakapan dengan Lega" aria-live="polite">
        {messages.length === 0 && (
          <p className="pt-16 text-center text-slate-700">Mulai ceritakan perasaanmu. Lega siap mendengarkan.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn('flex', m.from === 'me' && 'justify-end')}>
            <p
              className={cn(
                'max-w-[78%] rounded-2xl px-4 py-3 whitespace-pre-wrap',
                m.from === 'me' ? 'rounded-br-sm bg-violet-700 text-white' : 'rounded-bl-sm border bg-white',
              )}
            >
              <span className="sr-only">{m.from === 'me' ? 'Kamu: ' : 'Lega: '}</span>
              {m.text}
            </p>
          </div>
        ))}
        {typing && <p className="text-sm text-slate-700 italic">Lega sedang mengetik…</p>}
        {guestLocked && !typing && (
          <Card className="gap-3 border-violet-300 p-5 shadow-none">
            <Logo />
            <h2 className="font-bold">Mau lanjut ngobrol?</h2>
            <p className="text-sm text-slate-700">Daftar gratis untuk lanjut cerita, mencatat perasaan, dan menulis jurnal emosi.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild className="bg-violet-700 hover:bg-violet-800">
                <Link to={`/register?redirect=${redirect}`}>Daftar gratis</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={`/login?redirect=${redirect}`}>Masuk</Link>
              </Button>
            </div>
          </Card>
        )}
        <div ref={endRef} />
      </div>
      <div className="sticky bottom-0 space-y-3 border-t bg-white p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <p className="text-xs text-slate-700">
          Butuh bantuan segera? Hubungi <b>119 ext 8</b> atau <b>112</b>.
        </p>
        {user && (
          <Button variant="outline" className="rounded-full text-violet-800" onClick={() => toast('Terima kasih atas masukanmu!')}>
            <MessageSquare aria-hidden /> Beri Masukan
          </Button>
        )}
        <form onSubmit={send} className="flex gap-2">
          <label htmlFor="lega-input" className="sr-only">
            Tulis pesan untuk Lega
          </label>
          <input
            id="lega-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={guestLocked}
            placeholder={guestLocked ? 'Daftar untuk lanjut ngobrol' : 'Ceritakan perasaanmu...'}
            className="h-12 flex-1 rounded-full border border-[#848ea0] bg-white px-4 text-base outline-none disabled:bg-slate-100"
          />
          <Button
            type="submit"
            size="icon"
            className="size-12 rounded-full bg-violet-700 hover:bg-violet-800"
            disabled={!text.trim() || guestLocked}
            aria-label="Kirim pesan"
          >
            <SendHorizontal aria-hidden />
          </Button>
        </form>
      </div>
    </AppShell>
  )
}
