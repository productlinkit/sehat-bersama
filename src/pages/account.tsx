import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  BadgeCheck,
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  KeyRound,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Shield,
  Type,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Pill, QuotaList } from '@/components/cards'
import { Field, PasswordInput, inputCls } from '@/components/form'
import { AppShell, EmptyState, LanguageControl, PageHeader, SectionTitle, TextSizeControl } from '@/components/layout'
import { useAuth } from '@/lib/auth'
import { accessHistory, activePlans, CS_WHATSAPP, faqs, quotas, rupiah, transactions } from '@/lib/data'
import { useI18n, type L } from '@/lib/i18n'
import { usePersistentState } from '@/lib/storage'

const menu: { to: string; label: L; icon: typeof User }[] = [
  { to: '/account/profile', label: { id: 'Profil Saya', en: 'My Profile' }, icon: User },
  { to: '/account/addresses', label: { id: 'Alamat Tersimpan', en: 'Saved Addresses' }, icon: MapPin },
  { to: '/account/transactions', label: { id: 'Riwayat Pembelian', en: 'Purchase History' }, icon: CreditCard },
  { to: '/history', label: { id: 'Riwayat Medis', en: 'Medical History' }, icon: Activity },
  { to: '/account/display', label: { id: 'Tampilan & Bahasa', en: 'Display & Language' }, icon: Type },
  { to: '/account/notifications', label: { id: 'Pengaturan Notifikasi', en: 'Notification Settings' }, icon: Bell },
  { to: '/account/security', label: { id: 'Ganti Kata Sandi', en: 'Change Password' }, icon: KeyRound },
  { to: '/help', label: { id: 'Bantuan & Tanya Jawab', en: 'Help & FAQ' }, icon: HelpCircle },
  { to: '/terms', label: { id: 'Syarat & Ketentuan', en: 'Terms & Conditions' }, icon: Shield },
  { to: '/privacy-policy', label: { id: 'Kebijakan Privasi', en: 'Privacy Policy' }, icon: Lock },
]

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export function AccountPage() {
  const { user, logout } = useAuth()
  const { t, tr, date } = useI18n()
  const navigate = useNavigate()
  if (!user) return null

  return (
    <AppShell>
      <h1 className="sr-only">{t('Akun', 'Account')}</h1>
      <div className="space-y-5 p-4 pt-6 lg:p-8">
        <Card className="flex-row flex-wrap items-center gap-4 p-4 shadow-none min-[360px]:p-5">
          <Avatar className="size-14 min-[360px]:size-16">
            <AvatarFallback className="bg-emerald-100 text-lg font-bold text-teal-800">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-muted-foreground text-sm">{user.phone}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-sm text-teal-800">
              <BadgeCheck className="size-4" aria-hidden /> {t('Terverifikasi', 'Verified')}
            </span>
          </div>
        </Card>

        <section aria-labelledby="langganan">
          <SectionTitle id="langganan" title={t('Langganan & Layanan', 'Plans & Services')} action={{ label: t('Lihat Paket', 'See plans'), to: '/packages' }} />
          <Card className="gap-4 p-4 shadow-none min-[360px]:p-5">
            <div className="flex flex-wrap items-center justify-between gap-x-2">
              <h3 className="font-bold">{t('Paket aktifmu', 'Your active plans')}</h3>
              <span className="text-muted-foreground text-xs">{t(`${activePlans.length} paket aktif`, `${activePlans.length} active`)}</span>
            </div>
            {activePlans.map((p, i) => (
              <div key={i} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">{p.name}</p>
                  <Pill>{t('Aktif', 'Active')}</Pill>
                </div>
                <p className="text-muted-foreground text-sm">
                  {t('Aktif s/d ', 'Active until ')}
                  {date(p.until)} · <b className="text-slate-900">{t(`sisa ${p.daysLeft} hari`, `${p.daysLeft} days left`)}</b>
                </p>
                <p className="text-muted-foreground pt-1 text-xs font-bold tracking-wide uppercase">{t('Layanan yang bisa diakses', 'Included services')}</p>
                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm">
                      <span className="bg-primary size-1.5 shrink-0 rounded-full" aria-hidden /> {tr(f)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        </section>

        <Card className="gap-4 p-4 shadow-none min-[360px]:p-5">
          <div className="flex flex-wrap items-center justify-between gap-x-2">
            <h2 className="font-bold">{t('Akumulasi Kuota', 'Total Quota')}</h2>
            <span className="text-muted-foreground text-xs">{t('gabungan semua paket', 'across all plans')}</span>
          </div>
          <QuotaList quotas={quotas} />
        </Card>

        <nav aria-label={t('Pengaturan akun', 'Account settings')}>
          <Card className="gap-0 overflow-hidden py-0 shadow-none">
            <ul className="divide-y">
              {menu.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link to={to} className="flex min-h-14 items-center gap-4 px-4 py-4 hover:bg-slate-50 min-[360px]:px-5">
                    <Icon className="text-primary size-5 shrink-0" aria-hidden />
                    <span className="min-w-0 flex-1 font-semibold">{tr(label)}</span>
                    <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </nav>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12 w-full rounded-2xl border-red-300 bg-red-50 font-semibold text-red-700 hover:bg-red-100 hover:text-red-800">
              <LogOut aria-hidden /> {t('Keluar dari Akun', 'Sign out')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="pr-10">
              <DialogTitle>{t('Keluar dari akun?', 'Sign out?')}</DialogTitle>
              <DialogDescription>
                {t('Riwayat dan paketmu tetap tersimpan. Kamu bisa masuk lagi kapan saja.', 'Your history and plans stay saved. You can sign back in any time.')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t('Batal', 'Cancel')}</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => {
                  logout()
                  navigate('/home')
                  toast(t('Kamu sudah keluar', 'You’ve signed out'))
                }}
              >
                {t('Keluar', 'Sign out')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}

/** Sub-page frame. Public pages (help, terms, privacy) fall back to browser history for guests. */
function SubPage({ title, children, back }: { title: string; children: ReactNode; back?: string | true }) {
  const { user } = useAuth()
  return (
    <AppShell>
      <PageHeader title={title} back={back ?? (user ? '/account' : true)} />
      <div className="space-y-4 p-4 lg:p-8">{children}</div>
    </AppShell>
  )
}

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { t } = useI18n()
  const [form, setForm] = useState({ name: user?.name ?? '', gender: user?.gender ?? '', birthDate: user?.birthDate ?? '' })
  const [error, setError] = useState('')
  return (
    <SubPage title={t('Profil Saya', 'My Profile')}>
      <Card className="gap-5 p-4 shadow-none min-[360px]:p-5">
        <form
          noValidate
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (form.name.trim().length < 2) return setError(t('Isi nama lengkapmu sesuai identitas.', 'Enter your full name as on your ID.'))
            setError('')
            updateUser({ name: form.name.trim(), gender: (form.gender || undefined) as 'P' | 'L' | undefined, birthDate: form.birthDate })
            toast.success(t('Profil disimpan', 'Profile saved'))
          }}
        >
          <Field label={t('Nama lengkap', 'Full name')} error={error}>
            {(f) => <Input {...f} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />}
          </Field>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">{t('Jenis kelamin', 'Sex')}</legend>
            <RadioGroup value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })} className="grid grid-cols-1 min-[360px]:grid-cols-2">
              {[
                ['P', t('Perempuan', 'Female')],
                ['L', t('Laki-laki', 'Male')],
              ].map(([v, l]) => (
                <Label key={v} className="has-[[data-state=checked]]:border-primary flex min-h-12 items-center gap-2 rounded-xl border border-[#848ea0] px-3 font-normal">
                  <RadioGroupItem value={v} /> {l}
                </Label>
              ))}
            </RadioGroup>
          </fieldset>
          <Field label={t('Tanggal lahir', 'Date of birth')}>
            {(f) => <Input {...f} type="date" autoComplete="bday" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className={inputCls} />}
          </Field>
          <Button type="submit" className="h-12 w-full rounded-xl">
            {t('Simpan Profil', 'Save profile')}
          </Button>
        </form>
      </Card>
      <Card className="gap-1 bg-emerald-50 p-4 shadow-none min-[360px]:p-5">
        <h2 className="font-semibold">{t('Data medis', 'Medical data')}</h2>
        <p className="text-muted-foreground text-sm">
          {t(
            'Riwayat konsultasi, resep, dan catatan medismu tersimpan aman dan bisa kamu lihat di menu Riwayat Medis serta Resep & Dokumen.',
            'Your consultation history, prescriptions and medical notes are stored securely. Find them under Medical History and Prescriptions & Documents.',
          )}
        </p>
      </Card>
    </SubPage>
  )
}

interface Address {
  id: string
  label: string
  detail: string
}

export function AddressesPage() {
  const { t } = useI18n()
  const [addresses, setAddresses] = usePersistentState<Address[]>('sb:addresses', [])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ label: '', detail: '' })
  const [errors, setErrors] = useState({ label: '', detail: '' })

  const add = (e: FormEvent) => {
    e.preventDefault()
    const next = {
      label: form.label.trim() ? '' : t('Beri label alamat, misalnya Rumah.', 'Give the address a label, e.g. Home.'),
      detail: form.detail.trim().length >= 10 ? '' : t('Tulis alamat lengkap (jalan, nomor, kota).', 'Enter the full address (street, number, city).'),
    }
    setErrors(next)
    if (next.label || next.detail) return
    setAddresses((a) => [...a, { id: crypto.randomUUID(), label: form.label.trim(), detail: form.detail.trim() }])
    setForm({ label: '', detail: '' })
    setOpen(false)
    toast.success(t('Alamat disimpan', 'Address saved'))
  }

  const dialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">{t('Tambah Alamat', 'Add address')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="pr-10">
          <DialogTitle>{t('Tambah Alamat', 'Add address')}</DialogTitle>
          <DialogDescription>{t('Dipakai untuk pengiriman obat dan layanan ke rumah.', 'Used for medicine delivery and home services.')}</DialogDescription>
        </DialogHeader>
        <form id="addr" noValidate onSubmit={add} className="space-y-4">
          <Field label={t('Label', 'Label')} error={errors.label}>
            {(f) => <Input {...f} placeholder={t('Rumah, Kantor…', 'Home, Office…')} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />}
          </Field>
          <Field label={t('Alamat lengkap', 'Full address')} error={errors.detail}>
            {(f) => <Textarea {...f} autoComplete="street-address" value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />}
          </Field>
        </form>
        <DialogFooter>
          <Button type="submit" form="addr">
            {t('Simpan', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <SubPage title={t('Alamat Tersimpan', 'Saved Addresses')}>
      {addresses.length === 0 ? (
        <EmptyState
          title={t('Belum ada alamat tersimpan', 'No saved addresses yet')}
          text={t('Simpan alamat untuk mempercepat pengiriman obat dan layanan ke rumah.', 'Save an address to speed up medicine delivery and home services.')}
          action={dialog}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {addresses.map((a) => (
              <li key={a.id}>
                <Card className="flex-row items-start gap-3 p-4 shadow-none">
                  <MapPin className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{a.label}</p>
                    <p className="text-muted-foreground text-sm">{a.detail}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-red-700 hover:text-red-800"
                    aria-label={t(`Hapus alamat ${a.label}`, `Delete address ${a.label}`)}
                    onClick={() => setAddresses((xs) => xs.filter((x) => x.id !== a.id))}
                  >
                    {t('Hapus', 'Delete')}
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
          {dialog}
        </>
      )}
    </SubPage>
  )
}

export function TransactionsPage() {
  const { t, lang, date } = useI18n()
  return (
    <SubPage title={t('Riwayat Pembelian', 'Purchase History')}>
      <h2 className="font-bold">{t('Transaksi', 'Transactions')}</h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {transactions.map((x, i) => (
          <li key={i}>
            <Card className="flex-row flex-wrap items-center gap-3 p-4 shadow-none">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{x.name}</p>
                <p className="text-muted-foreground text-xs">{date(x.date)}</p>
              </div>
              <div className="text-right">
                <Pill>{t('Berhasil', 'Paid')}</Pill>
                <p className="mt-1 text-sm font-semibold">{rupiah(x.amount, lang)}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <h2 className="pt-2 font-bold">{t('Akses Layanan', 'Service Access')}</h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {accessHistory.map((a, i) => (
          <li key={i}>
            <Card className="h-full gap-1 p-4 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{a.name}</p>
                <Pill tone={a.active ? 'teal' : 'slate'}>{a.active ? t('Aktif', 'Active') : t('Berakhir', 'Ended')}</Pill>
              </div>
              <p className="text-muted-foreground text-xs">
                {date(a.from)} – {date(a.to)}
              </p>
              <p className="text-sm">
                {t(`Kuota chat: ${a.total - a.used} tersisa dari ${a.total}`, `Chat quota: ${a.total - a.used} of ${a.total} left`)}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </SubPage>
  )
}

export function SecurityPage() {
  const { t } = useI18n()
  const [form, setForm] = useState({ old: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({ old: '', next: '', confirm: '' })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next = {
      old: form.old ? '' : t('Isi kata sandi lamamu.', 'Enter your current password.'),
      next: form.next.length >= 8 ? '' : t('Kata sandi baru minimal 8 karakter.', 'New password must be at least 8 characters.'),
      confirm: form.next === form.confirm ? '' : t('Konfirmasi belum sama dengan kata sandi baru.', 'This doesn’t match the new password.'),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    setForm({ old: '', next: '', confirm: '' })
    toast.success(t('Kata sandi berhasil diganti', 'Password changed'))
  }
  const rows = [
    ['old', t('Kata sandi lama', 'Current password'), 'current-password', undefined],
    ['next', t('Kata sandi baru', 'New password'), 'new-password', t('Minimal 8 karakter, gabungan huruf dan angka.', 'At least 8 characters, with letters and numbers.')],
    ['confirm', t('Ulangi kata sandi baru', 'Confirm new password'), 'new-password', undefined],
  ] as const
  return (
    <SubPage title={t('Ganti Kata Sandi', 'Change Password')}>
      <Card className="p-4 shadow-none min-[360px]:p-5">
        <form noValidate onSubmit={submit} className="space-y-4">
          {rows.map(([k, l, ac, hint]) => (
            <Field key={k} label={l} hint={hint} error={errors[k]}>
              {(f) => <PasswordInput {...f} autoComplete={ac} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
            </Field>
          ))}
          <Button type="submit" className="h-auto min-h-12 w-full rounded-xl whitespace-normal">
            {t('Simpan Kata Sandi Baru', 'Save new password')}
          </Button>
        </form>
      </Card>
      <Card className="gap-1 bg-emerald-50 p-4 shadow-none min-[360px]:p-5">
        <h2 className="font-semibold">{t('Tips keamanan', 'Security tips')}</h2>
        <p className="text-muted-foreground text-sm">
          {t(
            'Gunakan minimal 8 karakter dengan kombinasi huruf dan angka. Jangan pakai kata sandi yang sama dengan akun lain.',
            'Use at least 8 characters mixing letters and numbers. Don’t reuse a password from another account.',
          )}
        </p>
      </Card>
    </SubPage>
  )
}

export function WhatsAppButton() {
  const { t } = useI18n()
  const label = (
    <>
      <MessageCircle aria-hidden /> {t('Hubungi Layanan Pelanggan via WhatsApp', 'Contact support on WhatsApp')}
    </>
  )
  // Wraps onto two lines on narrow screens instead of overflowing.
  const cls = 'mt-2 h-auto min-h-12 max-w-full rounded-full bg-green-700 px-5 py-2 text-center whitespace-normal text-white hover:bg-green-800'
  return CS_WHATSAPP ? (
    <Button asChild className={cls}>
      <a href={`https://wa.me/${CS_WHATSAPP}`} target="_blank" rel="noreferrer">
        {label}
      </a>
    </Button>
  ) : (
    <Button className={cls} onClick={() => toast(t('Nomor WhatsApp layanan pelanggan belum diatur (VITE_CS_WHATSAPP).', 'Support WhatsApp number is not set (VITE_CS_WHATSAPP).'))}>
      {label}
    </Button>
  )
}

export function HelpPage() {
  const { t, tr } = useI18n()
  return (
    <SubPage title={t('Bantuan & Tanya Jawab', 'Help & FAQ')}>
      <Card className="px-4 py-1 shadow-none min-[360px]:px-5">
        <h2 className="sr-only">{t('Pertanyaan yang sering ditanyakan', 'Frequently asked questions')}</h2>
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={String(i)}>
              <AccordionTrigger className="text-left text-base font-semibold">{tr(f.q)}</AccordionTrigger>
              <AccordionContent className="text-base text-slate-700">{tr(f.a)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
      <Card className="items-center gap-2 p-4 text-center shadow-none min-[360px]:p-5">
        <h2 className="font-semibold">{t('Masih butuh bantuan?', 'Still need help?')}</h2>
        <p className="text-muted-foreground text-sm">{t('Tim kami siap membantu setiap hari, 07.00–22.00 WIB.', 'Our team is available every day, 07:00–22:00 WIB.')}</p>
        <WhatsAppButton />
      </Card>
      <Card className="gap-3 p-4 shadow-none min-[360px]:p-5">
        <h2 className="font-semibold">{t('Bahasa', 'Language')}</h2>
        <LanguageControl />
      </Card>
      <Card className="gap-3 p-4 shadow-none min-[360px]:p-5">
        <h2 className="font-semibold">{t('Ukuran teks', 'Text size')}</h2>
        <p className="text-muted-foreground text-sm">{t('Perbesar teks kalau tulisan terasa terlalu kecil.', 'Make text bigger if it feels too small.')}</p>
        <TextSizeControl />
      </Card>
      <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {t('Kondisi darurat? Hubungi ', 'Emergency? Call ')}
        <b>112</b> / <b>119</b>
        {t(' atau segera ke IGD terdekat.', ' or go to the nearest emergency department.')}
      </p>
    </SubPage>
  )
}

export function DisplaySettingsPage() {
  const { t } = useI18n()
  return (
    <SubPage title={t('Tampilan & Bahasa', 'Display & Language')}>
      <Card className="gap-3 p-4 shadow-none min-[360px]:p-5">
        <h2 className="font-semibold">{t('Bahasa', 'Language')}</h2>
        <p className="text-muted-foreground text-sm">{t('Berlaku di semua halaman.', 'Applies to every page.')}</p>
        <LanguageControl />
      </Card>
      <Card className="gap-3 p-4 shadow-none min-[360px]:p-5">
        <h2 className="font-semibold">{t('Ukuran teks', 'Text size')}</h2>
        <p className="text-muted-foreground text-sm">{t('Berlaku di semua halaman, termasuk daftar paket dan artikel.', 'Applies everywhere, including plans and articles.')}</p>
        <TextSizeControl />
        <p className="rounded-xl bg-slate-100 p-3 text-sm">
          {t('Contoh: 10x Chat Dokter Umum (maks. 30 menit/sesi)', 'Example: 10x general doctor chat (max. 30 min/session)')}
        </p>
      </Card>
    </SubPage>
  )
}

export function PrivacyPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  return (
    <SubPage title={t('Kebijakan Privasi', 'Privacy Policy')}>
      <Card className="gap-2 p-4 text-sm leading-relaxed shadow-none min-[360px]:p-5">
        <h2 className="text-base font-semibold">{t('Data yang kami kumpulkan', 'Data we collect')}</h2>
        <p>
          {t(
            'Nomor HP, nama, data profil, isi konsultasi, resep, serta catatan perasaan dan jurnal di Lega.',
            'Phone number, name, profile details, consultation content, prescriptions, and mood notes and journal entries in Lega.',
          )}
        </p>
        <h2 className="pt-2 text-base font-semibold">{t('Cara kami melindungi datamu', 'How we protect your data')}</h2>
        <p>
          {t(
            'Data kesehatanmu terenkripsi dan hanya bisa diakses olehmu serta tenaga medis yang menangani konsultasimu. Kami tidak menjual atau membagikan datamu ke pihak ketiga tanpa persetujuanmu, sesuai UU PDP No. 27/2022.',
            'Your health data is encrypted and only you and the medical staff handling your consultation can access it. We never sell or share your data with third parties without your consent, in line with Indonesia’s Personal Data Protection Law (No. 27/2022).',
          )}
        </p>
        <h2 className="pt-2 text-base font-semibold">{t('Hak kamu', 'Your rights')}</h2>
        <p>{t('Kamu bisa meminta salinan, perbaikan, atau penghapusan datamu kapan saja.', 'You can ask for a copy, correction or deletion of your data at any time.')}</p>
      </Card>
      {user && (
        <Card className="gap-2 border-red-200 p-4 shadow-none min-[360px]:p-5">
          <h2 className="font-semibold text-red-700">{t('Hapus Akun & Data', 'Delete Account & Data')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('Ajukan penghapusan akun dan seluruh data terkait. Permintaan diproses maksimal 7 hari kerja.', 'Request deletion of your account and all related data. Requests are processed within 7 working days.')}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-1 h-auto min-h-10 border-red-300 whitespace-normal text-red-700 hover:text-red-800">
                {t('Ajukan Penghapusan Akun', 'Request account deletion')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="pr-10">
                <DialogTitle>{t('Hapus akun dan semua data?', 'Delete your account and all data?')}</DialogTitle>
                <DialogDescription>
                  {t(
                    'Riwayat konsultasi, resep, dan paket aktif akan dihapus permanen dan tidak bisa dikembalikan.',
                    'Consultation history, prescriptions and active plans will be permanently deleted and can’t be restored.',
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{t('Batal', 'Cancel')}</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={() => toast(t('Permintaan penghapusan akun sudah kami terima', 'We’ve received your deletion request'))}>
                    {t('Ya, ajukan penghapusan', 'Yes, request deletion')}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      )}
    </SubPage>
  )
}

export function TermsPage() {
  const { t } = useI18n()
  return (
    <SubPage title={t('Syarat & Ketentuan', 'Terms & Conditions')}>
      <Card className="gap-3 p-4 text-sm leading-relaxed shadow-none min-[360px]:p-5">
        <p>
          {t(
            'Dengan memakai Sehat Bersama, kamu setuju memberikan informasi yang benar dan memakai layanan sesuai peruntukannya.',
            'By using Sehat Bersama, you agree to give accurate information and use the services as intended.',
          )}
        </p>
        <p>
          {t(
            'Konsultasi daring tidak menggantikan penanganan gawat darurat. Dalam keadaan darurat, hubungi 112 / 119.',
            'Online consultations do not replace emergency care. In an emergency, call 112 / 119.',
          )}
        </p>
        <p>
          {t(
            'Paket akses berlaku sesuai masa aktif dan kuota yang tertera, dan tidak dapat diuangkan kembali.',
            'Plans are valid for the stated period and quota, and cannot be refunded.',
          )}
        </p>
        <p>
          {t('Pemrosesan data pribadimu diatur dalam ', 'How we process your personal data is set out in our ')}
          <Link to="/privacy-policy" className="text-primary font-semibold underline">
            {t('Kebijakan Privasi', 'Privacy Policy')}
          </Link>
          .
        </p>
      </Card>
    </SubPage>
  )
}

export function NotificationSettingsPage() {
  const { t } = useI18n()
  const [prefs, setPrefs] = usePersistentState('sb:notif', { consult: true, promo: false, reminder: true })
  const rows = [
    ['consult', t('Update konsultasi', 'Consultation updates'), t('Pesan dokter, resep, dan ringkasan', 'Doctor messages, prescriptions and summaries')],
    ['reminder', t('Pengingat', 'Reminders'), t('Klaim poin harian & masa aktif paket', 'Daily points and plan expiry')],
    ['promo', t('Promo & info', 'Offers & news'), t('Penawaran paket dan artikel baru', 'Plan offers and new articles')],
  ] as const
  return (
    <SubPage title={t('Pengaturan Notifikasi', 'Notification Settings')}>
      <Card className="gap-0 py-0 shadow-none">
        <ul className="divide-y">
          {rows.map(([k, title, desc]) => (
            <li key={k} className="flex items-center gap-4 px-4 py-4 min-[360px]:px-5">
              <div className="min-w-0 flex-1">
                <Label htmlFor={`notif-${k}`} className="font-semibold">
                  {title}
                </Label>
                <p id={`notif-${k}-desc`} className="text-muted-foreground text-sm">
                  {desc}
                </p>
              </div>
              <Switch id={`notif-${k}`} aria-describedby={`notif-${k}-desc`} checked={prefs[k]} onCheckedChange={(v) => setPrefs({ ...prefs, [k]: v })} />
            </li>
          ))}
        </ul>
      </Card>
    </SubPage>
  )
}
