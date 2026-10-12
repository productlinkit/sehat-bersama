import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check, MessageCircle, MessageSquare, Phone, SendHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field } from '@/components/form'
import { IconSparkHeart } from '@/components/icons'
import { AppShell, Logo, PageHeader } from '@/components/layout'
import { useAuth } from '@/lib/auth'
import { moods, type MoodKey } from '@/lib/data'
import { useI18n, type L } from '@/lib/i18n'
import { todayKey, usePersistentState } from '@/lib/storage'
import { cn } from '@/lib/utils'

/** The last 7 days, oldest first, as YYYY-MM-DD keys with a Date for labelling. */
function lastSevenDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { key: d.toISOString().slice(0, 10), day: d }
  })
}

const moodScore: Record<MoodKey, number> = { energik: 5, senang: 4, biasa: 3, bingung: 2, sedih: 1 }
const moodOf = (k: MoodKey) => moods.find((m) => m.key === k)!

interface JournalEntry {
  id: string
  title: string
  body: string
  mood: MoodKey
  /** ISO date, formatted per language at render time. */
  at: string
}

/** Sub-brand bridge: Lega is purple, but always signed as part of the teal Sehat Bersama family. */
function LegaByline() {
  const { t } = useI18n()
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white px-2 py-0.5 text-xs font-semibold text-teal-800">
      <img src="/logo.svg" alt="" className="size-4 shrink-0" /> {t('bagian dari Sehat Bersama', 'part of Sehat Bersama')}
    </span>
  )
}

function EmergencyNote() {
  const { t } = useI18n()
  return (
    <aside aria-label={t('Bantuan darurat', 'Emergency help')} className="flex gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950">
      <Phone className="mt-0.5 size-5 shrink-0 text-teal-800" aria-hidden />
      <p className="min-w-0">
        {t('Lega bukan pengganti layanan darurat. Kalau kamu butuh bantuan segera, hubungi ', 'Lega is not an emergency service. If you need help right now, call ')}
        <b>119 ext 8</b> {t('(layanan kesehatan jiwa Kemenkes) atau ', '(Ministry of Health mental health line) or ')}
        <b>112</b>.
      </p>
    </aside>
  )
}

/** Five equal columns that scale with the screen, so it fits a 280px phone at any text size. */
function MoodPicker({ value, onPick }: { value?: MoodKey; onPick: (m: MoodKey) => void }) {
  const { t, tr } = useI18n()
  return (
    <div role="group" aria-label={t('Pilih perasaanmu hari ini', 'How do you feel today?')} className="grid grid-cols-5 gap-1">
      {moods.map((m) => (
        <button key={m.key} type="button" aria-pressed={value === m.key} onClick={() => onPick(m.key)} className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl p-1">
          <span
            className={cn(
              'grid aspect-square w-full max-w-12 place-items-center rounded-full bg-violet-50 text-violet-800 transition [--icon-fill:#ddd6fe]',
              value === m.key && 'bg-white ring-[3px] ring-violet-700 [--icon-fill:#c4b5fd]',
            )}
            aria-hidden
          >
            <m.icon className="size-3/4" />
          </span>
          <span className={cn('max-w-full text-center text-xs leading-tight [overflow-wrap:anywhere]', value === m.key ? 'font-bold text-violet-800' : 'text-slate-700')}>{tr(m.label)}</span>
        </button>
      ))}
    </div>
  )
}

export function LegaPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  return (
    <AppShell>
      <PageHeader title="Lega" subtitle={t('Ruang tenang untuk bercerita, mencatat, dan menata perasaan.', 'A calm space to talk, reflect and sort out your feelings.')} back="/home" />
      <div className="space-y-5 p-4 lg:p-8">
        <LegaByline />
        {user ? <LegaDashboard /> : <LegaGuestPreview />}
        <Button asChild className="h-auto min-h-14 w-full rounded-full bg-violet-700 text-base font-semibold whitespace-normal hover:bg-violet-800">
          <Link to="/lega/chat">
            <MessageCircle aria-hidden /> {user ? t('Ngobrol dengan Lega', 'Talk with Lega') : t('Coba 1 pesan gratis', 'Try one free message')}
          </Link>
        </Button>
        <EmergencyNote />
      </div>
    </AppShell>
  )
}

/** Guests see what Lega offers, with a working mood picker that invites sign-up. */
function LegaGuestPreview() {
  const { t, tr } = useI18n()
  const [picked, setPicked] = useState<MoodKey>()
  return (
    <>
      <Card className="items-center gap-3 border-violet-200 bg-violet-50 p-5 text-center shadow-none min-[360px]:p-6">
        <IconSparkHeart className="size-14 text-violet-800 [--icon-fill:#c4b5fd]" />
        <h2 className="text-lg font-bold">{t('Teman cerita AI 24/7', 'Your 24/7 AI companion')}</h2>
        <p className="text-sm text-slate-700">
          {t(
            'Ceritakan perasaanmu, catat perasaan harian, dan tulis jurnal emosi. Kamu bisa coba 1 pesan tanpa daftar.',
            'Share how you feel, track your mood each day and keep a feelings journal. Try one message without signing up.',
          )}
        </p>
      </Card>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="gap-4 p-4 shadow-none min-[360px]:p-5">
          <div>
            <h2 className="text-lg font-bold">{t('Cek Perasaan Harian', 'Daily Mood Check')}</h2>
            <p className="text-muted-foreground text-sm">{t('Bagaimana perasaanmu hari ini?', 'How are you feeling today?')}</p>
          </div>
          <MoodPicker value={picked} onPick={setPicked} />
          {picked && (
            <div role="status" className="rounded-2xl bg-violet-50 p-4 text-sm text-violet-950">
              {t(`Terima kasih sudah jujur dengan perasaanmu (${tr(moodOf(picked).label)}). `, `Thanks for being honest about how you feel (${tr(moodOf(picked).label)}). `)}
              <Link to="/register?redirect=%2Flega" className="font-semibold text-violet-800 underline">
                {t('Daftar gratis', 'Sign up free')}
              </Link>{' '}
              {t('untuk menyimpan catatan perasaan, melihat hari beruntun, dan ringkasan mingguan.', 'to save your moods, see your streak and get a weekly summary.')}
            </div>
          )}
        </Card>
        <WeeklySummary checkins={{}} sample />
      </div>
    </>
  )
}

function LegaDashboard() {
  const { t, tr, date } = useI18n()
  const [checkins, setCheckins] = usePersistentState<Record<string, MoodKey>>('sb:lega:checkins', {})
  const [journal, setJournal] = usePersistentState<JournalEntry[]>('sb:lega:journal-v2', [])
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ title: '', body: '' })
  const [errors, setErrors] = useState({ title: '', body: '' })
  const week = lastSevenDays()
  const today = checkins[todayKey()]
  const weekday = (d: Date, long?: boolean) => date(d.toISOString(), { weekday: long ? 'long' : 'short' })

  let streak = 0
  for (let i = week.length - 1; i >= 0 && checkins[week[i].key]; i--) streak++

  const weekMoods = week.map((d) => checkins[d.key]).filter(Boolean) as MoodKey[]

  const saveEntry = (e: FormEvent) => {
    e.preventDefault()
    const next = {
      title: draft.title.trim() ? '' : t('Beri judul singkat.', 'Add a short title.'),
      body: draft.body.trim() ? '' : t('Tulis sedikit tentang perasaanmu.', 'Write a little about how you feel.'),
    }
    setErrors(next)
    if (next.title || next.body) return
    setJournal((j) => [{ id: crypto.randomUUID(), ...draft, mood: today ?? 'biasa', at: new Date().toISOString() }, ...j])
    setDraft({ title: '', body: '' })
    setOpen(false)
  }

  const journalDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-violet-700 hover:bg-violet-800">{t('+ Tulis jurnal', '+ Write entry')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="pr-10">
          <DialogTitle>{t('Tulis Jurnal', 'New Journal Entry')}</DialogTitle>
          <DialogDescription>{t('Hanya kamu yang bisa membaca jurnal ini.', 'Only you can read your journal.')}</DialogDescription>
        </DialogHeader>
        <form id="journal" noValidate onSubmit={saveEntry} className="space-y-3">
          <Field label={t('Judul', 'Title')} error={errors.title}>
            {(f) => <Input {...f} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />}
          </Field>
          <Field label={t('Apa yang kamu rasakan?', 'How are you feeling?')} error={errors.body}>
            {(f) => <Textarea {...f} rows={5} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />}
          </Field>
        </form>
        <DialogFooter>
          <Button type="submit" form="journal" className="bg-violet-700 hover:bg-violet-800">
            {t('Simpan', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="gap-4 p-4 shadow-none min-[360px]:p-5">
          <div>
            <h2 className="text-lg font-bold">{t('Cek Perasaan Harian', 'Daily Mood Check')}</h2>
            <p className="text-muted-foreground text-sm">{t('Bagaimana perasaanmu hari ini?', 'How are you feeling today?')}</p>
          </div>
          <MoodPicker
            value={today}
            onPick={(m) => {
              setCheckins({ ...checkins, [todayKey()]: m })
              if (!today) toast.success(t('Perasaanmu hari ini tersimpan', 'Today’s mood saved'))
            }}
          />
          <div className="space-y-2 rounded-2xl bg-violet-50 p-3 text-center min-[360px]:p-4">
            <p className="text-xs font-bold tracking-wide text-violet-800">{t(`${streak} HARI BERUNTUN`, `${streak}-DAY STREAK`)}</p>
            <ol className="grid grid-cols-7 gap-1" aria-label={t('Catatan perasaan 7 hari terakhir', 'Moods over the last 7 days')}>
              {week.map((d) => (
                <li key={d.key} className="flex min-w-0 flex-col items-center gap-1">
                  <span className={cn('grid aspect-square w-full max-w-7 place-items-center rounded-full border-2 border-violet-700', checkins[d.key] && 'bg-violet-700 text-white')} aria-hidden>
                    {checkins[d.key] && <Check className="size-3.5" />}
                  </span>
                  <span className="max-w-full truncate text-xs text-slate-700" aria-hidden>
                    {weekday(d.day)}
                  </span>
                  <span className="sr-only">
                    {weekday(d.day, true)}: {checkins[d.key] ? tr(moodOf(checkins[d.key]).label) : t('belum dicatat', 'not recorded')}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Card>

        <WeeklySummary checkins={checkins} sample={weekMoods.length === 0} />
      </div>

      <section className="space-y-3" aria-labelledby="jurnal">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="jurnal" className="text-lg font-bold">
            {t('Jurnal Emosi', 'Feelings Journal')}
          </h2>
          {journalDialog}
        </div>
        {journal.length === 0 && (
          <p className="text-muted-foreground rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm">
            {t('Belum ada catatan. Tulis apa yang kamu rasakan hari ini.', 'No entries yet. Write about how you feel today.')}
          </p>
        )}
        <ul className="grid gap-3 md:grid-cols-2">
          {journal.map((j) => {
            const M = moodOf(j.mood).icon
            return (
              <li key={j.id}>
                <Card className="h-full gap-1 border-violet-200 bg-violet-50 p-4 shadow-none">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold [overflow-wrap:anywhere]">{j.title}</h3>
                      <p className="text-muted-foreground text-xs">{date(j.at, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <span role="img" aria-label={t(`Perasaan: ${tr(moodOf(j.mood).label)}`, `Mood: ${tr(moodOf(j.mood).label)}`)} className="shrink-0 text-violet-800 [--icon-fill:#ddd6fe]">
                      <M className="size-7" />
                    </span>
                    <button
                      type="button"
                      aria-label={t(`Hapus jurnal ${j.title}`, `Delete entry ${j.title}`)}
                      onClick={() => setJournal((xs) => xs.filter((x) => x.id !== j.id))}
                      className="text-muted-foreground grid size-8 shrink-0 place-items-center rounded-full hover:bg-violet-100"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap [overflow-wrap:anywhere]">{j.body}</p>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}

/** Weekly mood chart. With no data it shows a labelled sample so the card never looks empty. */
function WeeklySummary({ checkins, sample }: { checkins: Record<string, MoodKey>; sample?: boolean }) {
  const { t, tr, date } = useI18n()
  const week = lastSevenDays()
  const sampleMoods: MoodKey[] = ['biasa', 'senang', 'bingung', 'senang', 'energik', 'biasa', 'senang']
  const data = week.map((d, i) => (sample ? sampleMoods[i] : checkins[d.key]))
  const real = week.map((d) => checkins[d.key]).filter(Boolean) as MoodKey[]
  const counts = real.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m]: (acc[m] ?? 0) + 1 }), {})
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return (
    <Card className="gap-4 p-4 shadow-none min-[360px]:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 basis-40">
          <h2 className="text-lg font-bold">{t('Ringkasan Mingguan', 'Weekly Summary')}</h2>
          <p className="text-muted-foreground text-sm">
            {sample
              ? t('Begini ringkasanmu nanti terlihat. Catat perasaanmu hari ini untuk mulai.', 'This is what your summary will look like. Record today’s mood to get started.')
              : t(
                  `Minggu ini kamu mencatat ${real.length} hari. Perasaan paling sering: ${tr(moodOf(top[0] as MoodKey).label)} (${top[1]} hari).`,
                  `You recorded ${real.length} ${real.length === 1 ? 'day' : 'days'} this week. Most common mood: ${tr(moodOf(top[0] as MoodKey).label)} (${top[1]} ${top[1] === 1 ? 'day' : 'days'}).`,
                )}
          </p>
        </div>
        {sample && (
          <span className="shrink-0 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">{t('Contoh', 'Example')}</span>
        )}
      </div>
      <div className="grid h-40 grid-cols-7 items-end gap-1.5 min-[360px]:gap-3" aria-hidden>
        {week.map((d, i) => {
          const m = data[i]
          const Icon = m ? moodOf(m).icon : null
          return (
            <div key={d.key} className="flex min-w-0 flex-col items-center gap-1">
              {Icon && <Icon className="aspect-square w-full max-w-6 text-violet-800 [--icon-fill:#ddd6fe]" />}
              <div className={cn('w-full rounded-t-md', m ? (sample ? 'bg-violet-300' : 'bg-violet-700') : 'bg-violet-100')} style={{ height: m ? `${moodScore[m] * 18}px` : '10px' }} />
              <span className="max-w-full truncate text-xs text-slate-700">{date(d.day.toISOString(), { weekday: 'short' })}</span>
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
  text: L | string
}

// Placeholder replies; wire this to a real model endpoint later.
const legaReplies: L[] = [
  {
    id: 'Terima kasih sudah mau bercerita. Aku di sini mendengarkan. Bisa ceritakan lebih lanjut apa yang paling kamu rasakan sekarang?',
    en: 'Thank you for sharing. I’m here and listening. Can you tell me more about what you’re feeling most right now?',
  },
  {
    id: 'Perasaan itu valid, dan wajar kalau terasa berat. Apa yang biasanya membantumu merasa sedikit lebih tenang?',
    en: 'That feeling is valid, and it’s understandable that it feels heavy. What usually helps you feel a little calmer?',
  },
  {
    id: 'Coba tarik napas perlahan sejenak. Kalau mau, kita bisa urai satu per satu hal yang sedang memenuhi pikiranmu.',
    en: 'Try taking a slow breath for a moment. If you like, we can go through what’s on your mind one thing at a time.',
  },
]

const GUEST_LIMIT = 1

export function LegaChatPage() {
  const { user } = useAuth()
  const { t, tr } = useI18n()
  const location = useLocation()
  const [messages, setMessages] = usePersistentState<ChatMsg[]>(user ? 'sb:lega:chat-v2' : 'sb:lega:guest-chat-v2', [])
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
        subtitle={user ? t('Teman cerita AI · bagian dari Sehat Bersama', 'AI companion · part of Sehat Bersama') : t('Mode tamu · 1 pesan gratis', 'Guest mode · 1 free message')}
        back="/lega"
        right={
          user && (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to="/lega">{t('Jurnal', 'Journal')}</Link>
            </Button>
          )
        }
      />
      <div className="flex-1 space-y-3 bg-violet-50 p-3 min-[360px]:p-4" role="log" aria-label={t('Percakapan dengan Lega', 'Conversation with Lega')} aria-live="polite">
        {messages.length === 0 && <p className="pt-16 text-center text-slate-700">{t('Mulai ceritakan perasaanmu. Lega siap mendengarkan.', 'Start by sharing how you feel. Lega is ready to listen.')}</p>}
        {messages.map((m) => (
          <div key={m.id} className={cn('flex', m.from === 'me' && 'justify-end')}>
            <p
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap [overflow-wrap:anywhere] min-[360px]:max-w-[78%]',
                m.from === 'me' ? 'rounded-br-sm bg-violet-700 text-white' : 'rounded-bl-sm border bg-white',
              )}
            >
              <span className="sr-only">{m.from === 'me' ? t('Kamu: ', 'You: ') : 'Lega: '}</span>
              {tr(m.text)}
            </p>
          </div>
        ))}
        {typing && <p className="text-sm text-slate-700 italic">{t('Lega sedang mengetik…', 'Lega is typing…')}</p>}
        {guestLocked && !typing && (
          <Card className="gap-3 border-violet-300 p-4 shadow-none min-[360px]:p-5">
            <Logo />
            <h2 className="font-bold">{t('Mau lanjut ngobrol?', 'Want to keep talking?')}</h2>
            <p className="text-sm text-slate-700">
              {t('Daftar gratis untuk lanjut cerita, mencatat perasaan, dan menulis jurnal emosi.', 'Sign up free to keep talking, track your moods and keep a feelings journal.')}
            </p>
            <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
              <Button asChild className="bg-violet-700 hover:bg-violet-800">
                <Link to={`/register?redirect=${redirect}`}>{t('Daftar gratis', 'Sign up free')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={`/login?redirect=${redirect}`}>{t('Masuk', 'Sign in')}</Link>
              </Button>
            </div>
          </Card>
        )}
        <div ref={endRef} />
      </div>
      <div className="sticky bottom-0 space-y-3 border-t bg-white p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <p className="text-xs text-slate-700">
          {t('Butuh bantuan segera? Hubungi ', 'Need help right now? Call ')}
          <b>119 ext 8</b>
          {t(' atau ', ' or ')}
          <b>112</b>.
        </p>
        {user && (
          <Button variant="outline" className="rounded-full text-violet-800" onClick={() => toast(t('Terima kasih atas masukanmu!', 'Thanks for your feedback!'))}>
            <MessageSquare aria-hidden /> {t('Beri Masukan', 'Feedback')}
          </Button>
        )}
        <form onSubmit={send} className="flex gap-2">
          <label htmlFor="lega-input" className="sr-only">
            {t('Tulis pesan untuk Lega', 'Write a message to Lega')}
          </label>
          <input
            id="lega-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={guestLocked}
            placeholder={guestLocked ? t('Daftar untuk lanjut ngobrol', 'Sign up to keep talking') : t('Ceritakan perasaanmu...', 'Share how you feel...')}
            className="h-12 w-0 min-w-0 flex-1 rounded-full border border-[#848ea0] bg-white px-4 text-base outline-none disabled:bg-slate-100"
          />
          <Button type="submit" size="icon" className="size-12 shrink-0 rounded-full bg-violet-700 hover:bg-violet-800" disabled={!text.trim() || guestLocked} aria-label={t('Kirim pesan', 'Send message')}>
            <SendHorizontal aria-hidden />
          </Button>
        </form>
      </div>
    </AppShell>
  )
}
