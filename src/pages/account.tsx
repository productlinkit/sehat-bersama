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
import { AppShell, EmptyState, PageHeader, SectionTitle, TextSizeControl } from '@/components/layout'
import { useAuth } from '@/lib/auth'
import { accessHistory, activePlans, CS_WHATSAPP, faqs, quotas, rupiah, transactions } from '@/lib/data'
import { usePersistentState } from '@/lib/storage'

const menu = [
  { to: '/account/profile', label: 'Profil Saya', icon: User },
  { to: '/account/addresses', label: 'Alamat Tersimpan', icon: MapPin },
  { to: '/account/transactions', label: 'Riwayat Pembelian', icon: CreditCard },
  { to: '/history', label: 'Riwayat Medis', icon: Activity },
  { to: '/account/display', label: 'Tampilan & Ukuran Teks', icon: Type },
  { to: '/account/notifications', label: 'Pengaturan Notifikasi', icon: Bell },
  { to: '/account/security', label: 'Ganti Kata Sandi', icon: KeyRound },
  { to: '/help', label: 'Bantuan & Tanya Jawab', icon: HelpCircle },
  { to: '/terms', label: 'Syarat & Ketentuan', icon: Shield },
  { to: '/privacy-policy', label: 'Kebijakan Privasi', icon: Lock },
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
  const navigate = useNavigate()
  if (!user) return null

  return (
    <AppShell>
      <h1 className="sr-only">Akun</h1>
      <div className="space-y-5 p-4 pt-6 lg:p-8">
        <Card className="flex-row items-center gap-4 p-5 shadow-none">
          <Avatar className="size-16">
            <AvatarFallback className="bg-emerald-100 text-lg font-bold text-teal-800">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-muted-foreground text-sm">{user.phone}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-sm text-teal-800">
              <BadgeCheck className="size-4" aria-hidden /> Terverifikasi
            </span>
          </div>
        </Card>

        <section aria-labelledby="langganan">
          <SectionTitle id="langganan" title="Langganan & Layanan" action={{ label: 'Lihat Paket', to: '/packages' }} />
          <Card className="gap-4 p-5 shadow-none">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Paket aktifmu</h3>
              <span className="text-muted-foreground text-xs">{activePlans.length} paket aktif</span>
            </div>
            {activePlans.map((p, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{p.name}</p>
                  <Pill>Aktif</Pill>
                </div>
                <p className="text-muted-foreground text-sm">
                  Aktif s/d {p.until} · <b className="text-slate-900">sisa {p.daysLeft} hari</b>
                </p>
                <p className="text-muted-foreground pt-1 text-xs font-bold tracking-wide uppercase">Layanan yang bisa diakses</p>
                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm">
                      <span className="bg-primary size-1.5 rounded-full" aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        </section>

        <Card className="gap-4 p-5 shadow-none">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Akumulasi Kuota</h2>
            <span className="text-muted-foreground text-xs">gabungan semua paket</span>
          </div>
          <QuotaList quotas={quotas} />
        </Card>

        <nav aria-label="Pengaturan akun">
          <Card className="gap-0 overflow-hidden py-0 shadow-none">
            <ul className="divide-y">
              {menu.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link to={to} className="flex min-h-14 items-center gap-4 px-5 py-4 hover:bg-slate-50">
                    <Icon className="text-primary size-5" aria-hidden />
                    <span className="flex-1 font-semibold">{label}</span>
                    <ChevronRight className="text-muted-foreground size-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </nav>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12 w-full rounded-2xl border-red-300 bg-red-50 font-semibold text-red-700 hover:bg-red-100 hover:text-red-800">
              <LogOut aria-hidden /> Keluar dari Akun
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keluar dari akun?</DialogTitle>
              <DialogDescription>Riwayat dan paketmu tetap tersimpan. Kamu bisa masuk lagi kapan saja.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => {
                  logout()
                  navigate('/home')
                  toast('Kamu sudah keluar')
                }}
              >
                Keluar
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
  const [form, setForm] = useState({ name: user?.name ?? '', gender: user?.gender ?? '', birthDate: user?.birthDate ?? '' })
  const [error, setError] = useState('')
  return (
    <SubPage title="Profil Saya">
      <Card className="gap-5 p-5 shadow-none">
        <form
          noValidate
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (form.name.trim().length < 2) return setError('Isi nama lengkapmu sesuai identitas.')
            setError('')
            updateUser({ name: form.name.trim(), gender: (form.gender || undefined) as 'P' | 'L' | undefined, birthDate: form.birthDate })
            toast.success('Profil disimpan')
          }}
        >
          <Field label="Nama lengkap" error={error}>
            {(f) => <Input {...f} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />}
          </Field>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">Jenis kelamin</legend>
            <RadioGroup value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })} className="grid grid-cols-2">
              {[
                ['P', 'Perempuan'],
                ['L', 'Laki-laki'],
              ].map(([v, l]) => (
                <Label key={v} className="has-[[data-state=checked]]:border-primary flex h-12 items-center gap-2 rounded-xl border border-[#848ea0] px-3 font-normal">
                  <RadioGroupItem value={v} /> {l}
                </Label>
              ))}
            </RadioGroup>
          </fieldset>
          <Field label="Tanggal lahir">
            {(f) => (
              <Input {...f} type="date" autoComplete="bday" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className={inputCls} />
            )}
          </Field>
          <Button type="submit" className="h-12 w-full rounded-xl">
            Simpan Profil
          </Button>
        </form>
      </Card>
      <Card className="gap-1 bg-emerald-50 p-5 shadow-none">
        <h2 className="font-semibold">Data medis</h2>
        <p className="text-muted-foreground text-sm">
          Riwayat konsultasi, resep, dan catatan medismu tersimpan aman dan bisa kamu lihat di menu Riwayat Medis serta Resep & Dokumen.
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
  const [addresses, setAddresses] = usePersistentState<Address[]>('sb:addresses', [])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ label: '', detail: '' })
  const [errors, setErrors] = useState({ label: '', detail: '' })

  const add = (e: FormEvent) => {
    e.preventDefault()
    const next = {
      label: form.label.trim() ? '' : 'Beri label alamat, misalnya Rumah.',
      detail: form.detail.trim().length >= 10 ? '' : 'Tulis alamat lengkap (jalan, nomor, kota).',
    }
    setErrors(next)
    if (next.label || next.detail) return
    setAddresses((a) => [...a, { id: crypto.randomUUID(), label: form.label.trim(), detail: form.detail.trim() }])
    setForm({ label: '', detail: '' })
    setOpen(false)
    toast.success('Alamat disimpan')
  }

  const dialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">Tambah Alamat</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Alamat</DialogTitle>
          <DialogDescription>Dipakai untuk pengiriman obat dan layanan ke rumah.</DialogDescription>
        </DialogHeader>
        <form id="addr" noValidate onSubmit={add} className="space-y-4">
          <Field label="Label" error={errors.label}>
            {(f) => <Input {...f} placeholder="Rumah, Kantor…" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />}
          </Field>
          <Field label="Alamat lengkap" error={errors.detail}>
            {(f) => <Textarea {...f} autoComplete="street-address" value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />}
          </Field>
        </form>
        <DialogFooter>
          <Button type="submit" form="addr">
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <SubPage title="Alamat Tersimpan">
      {addresses.length === 0 ? (
        <EmptyState
          title="Belum ada alamat tersimpan"
          text="Simpan alamat untuk mempercepat pengiriman obat dan layanan ke rumah."
          action={dialog}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {addresses.map((a) => (
              <li key={a.id}>
                <Card className="flex-row items-start gap-3 p-4 shadow-none">
                  <MapPin className="text-primary mt-0.5 size-5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold">{a.label}</p>
                    <p className="text-muted-foreground text-sm">{a.detail}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-700 hover:text-red-800"
                    aria-label={`Hapus alamat ${a.label}`}
                    onClick={() => setAddresses((xs) => xs.filter((x) => x.id !== a.id))}
                  >
                    Hapus
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
  return (
    <SubPage title="Riwayat Pembelian">
      <h2 className="font-bold">Transaksi</h2>
      <ul className="space-y-3">
        {transactions.map((t, i) => (
          <li key={i}>
            <Card className="flex-row items-center p-4 shadow-none">
              <div className="flex-1">
                <p className="font-semibold">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.date}</p>
              </div>
              <div className="text-right">
                <Pill>Berhasil</Pill>
                <p className="mt-1 text-sm font-semibold">{rupiah(t.amount)}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <h2 className="pt-2 font-bold">Akses Layanan</h2>
      <ul className="space-y-3">
        {accessHistory.map((a, i) => (
          <li key={i}>
            <Card className="gap-1 p-4 shadow-none">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{a.name}</p>
                <Pill tone={a.active ? 'teal' : 'slate'}>{a.active ? 'Aktif' : 'Berakhir'}</Pill>
              </div>
              <p className="text-muted-foreground text-xs">{a.period}</p>
              <p className="text-sm">{a.quota}</p>
            </Card>
          </li>
        ))}
      </ul>
    </SubPage>
  )
}

export function SecurityPage() {
  const [form, setForm] = useState({ old: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({ old: '', next: '', confirm: '' })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next = {
      old: form.old ? '' : 'Isi kata sandi lamamu.',
      next: form.next.length >= 8 ? '' : 'Kata sandi baru minimal 8 karakter.',
      confirm: form.next === form.confirm ? '' : 'Konfirmasi belum sama dengan kata sandi baru.',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    setForm({ old: '', next: '', confirm: '' })
    toast.success('Kata sandi berhasil diganti')
  }
  const rows = [
    ['old', 'Kata sandi lama', 'current-password', undefined],
    ['next', 'Kata sandi baru', 'new-password', 'Minimal 8 karakter, gabungan huruf dan angka.'],
    ['confirm', 'Ulangi kata sandi baru', 'new-password', undefined],
  ] as const
  return (
    <SubPage title="Ganti Kata Sandi">
      <Card className="p-5 shadow-none">
        <form noValidate onSubmit={submit} className="space-y-4">
          {rows.map(([k, l, ac, hint]) => (
            <Field key={k} label={l} hint={hint} error={errors[k]}>
              {(f) => <PasswordInput {...f} autoComplete={ac} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
            </Field>
          ))}
          <Button type="submit" className="h-12 w-full rounded-xl">
            Simpan Kata Sandi Baru
          </Button>
        </form>
      </Card>
      <Card className="gap-1 bg-emerald-50 p-5 shadow-none">
        <h2 className="font-semibold">Tips keamanan</h2>
        <p className="text-muted-foreground text-sm">
          Gunakan minimal 8 karakter dengan kombinasi huruf dan angka. Jangan pakai kata sandi yang sama dengan akun lain.
        </p>
      </Card>
    </SubPage>
  )
}

export function WhatsAppButton() {
  const label = (
    <>
      <MessageCircle aria-hidden /> Hubungi Layanan Pelanggan via WhatsApp
    </>
  )
  const cls = 'mt-2 h-12 rounded-full bg-green-700 px-6 text-white hover:bg-green-800'
  return CS_WHATSAPP ? (
    <Button asChild className={cls}>
      <a href={`https://wa.me/${CS_WHATSAPP}`} target="_blank" rel="noreferrer">
        {label}
      </a>
    </Button>
  ) : (
    <Button className={cls} onClick={() => toast('Nomor WhatsApp layanan pelanggan belum diatur (VITE_CS_WHATSAPP).')}>
      {label}
    </Button>
  )
}

export function HelpPage() {
  return (
    <SubPage title="Bantuan & Tanya Jawab">
      <Card className="px-5 py-1 shadow-none">
        <h2 className="sr-only">Pertanyaan yang sering ditanyakan</h2>
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={String(i)}>
              <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-base text-slate-700">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
      <Card className="items-center gap-2 p-5 text-center shadow-none">
        <h2 className="font-semibold">Masih butuh bantuan?</h2>
        <p className="text-muted-foreground text-sm">Tim kami siap membantu setiap hari, 07.00–22.00 WIB.</p>
        <WhatsAppButton />
      </Card>
      <Card className="gap-3 p-5 shadow-none">
        <h2 className="font-semibold">Ukuran teks</h2>
        <p className="text-muted-foreground text-sm">Perbesar teks kalau tulisan terasa terlalu kecil.</p>
        <TextSizeControl />
      </Card>
      <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        Kondisi darurat? Hubungi <b>112</b> / <b>119</b> atau segera ke IGD terdekat.
      </p>
    </SubPage>
  )
}

export function DisplaySettingsPage() {
  return (
    <SubPage title="Tampilan & Ukuran Teks">
      <Card className="gap-3 p-5 shadow-none">
        <h2 className="font-semibold">Ukuran teks</h2>
        <p className="text-muted-foreground text-sm">Berlaku di semua halaman, termasuk daftar paket dan artikel.</p>
        <TextSizeControl />
        <p className="rounded-xl bg-slate-100 p-3 text-sm">Contoh: 10x Chat Dokter Umum (maks. 30 menit/sesi)</p>
      </Card>
    </SubPage>
  )
}

export function PrivacyPage() {
  const { user } = useAuth()
  return (
    <SubPage title="Kebijakan Privasi">
      <Card className="gap-2 p-5 text-sm leading-relaxed shadow-none">
        <h2 className="text-base font-semibold">Data yang kami kumpulkan</h2>
        <p>Nomor HP, nama, data profil, isi konsultasi, resep, serta catatan perasaan dan jurnal di Lega.</p>
        <h2 className="pt-2 text-base font-semibold">Cara kami melindungi datamu</h2>
        <p>
          Data kesehatanmu terenkripsi dan hanya bisa diakses olehmu serta tenaga medis yang menangani konsultasimu. Kami tidak menjual atau
          membagikan datamu ke pihak ketiga tanpa persetujuanmu, sesuai UU PDP No. 27/2022.
        </p>
        <h2 className="pt-2 text-base font-semibold">Hak kamu</h2>
        <p>Kamu bisa meminta salinan, perbaikan, atau penghapusan datamu kapan saja.</p>
      </Card>
      {user && (
        <Card className="gap-2 border-red-200 p-5 shadow-none">
          <h2 className="font-semibold text-red-700">Hapus Akun & Data</h2>
          <p className="text-muted-foreground text-sm">Ajukan penghapusan akun dan seluruh data terkait. Permintaan diproses maksimal 7 hari kerja.</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-1 border-red-300 text-red-700 hover:text-red-800">
                Ajukan Penghapusan Akun
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus akun dan semua data?</DialogTitle>
                <DialogDescription>Riwayat konsultasi, resep, dan paket aktif akan dihapus permanen dan tidak bisa dikembalikan.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Batal</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={() => toast('Permintaan penghapusan akun sudah kami terima')}>
                    Ya, ajukan penghapusan
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
  return (
    <SubPage title="Syarat & Ketentuan">
      <Card className="gap-3 p-5 text-sm leading-relaxed shadow-none">
        <p>Dengan memakai Sehat Bersama, kamu setuju memberikan informasi yang benar dan memakai layanan sesuai peruntukannya.</p>
        <p>Konsultasi daring tidak menggantikan penanganan gawat darurat. Dalam keadaan darurat, hubungi 112 / 119.</p>
        <p>Paket akses berlaku sesuai masa aktif dan kuota yang tertera, dan tidak dapat diuangkan kembali.</p>
        <p>
          Pemrosesan data pribadimu diatur dalam{' '}
          <Link to="/privacy-policy" className="text-primary font-semibold underline">
            Kebijakan Privasi
          </Link>
          .
        </p>
      </Card>
    </SubPage>
  )
}

export function NotificationSettingsPage() {
  const [prefs, setPrefs] = usePersistentState('sb:notif', { consult: true, promo: false, reminder: true })
  const rows = [
    ['consult', 'Update konsultasi', 'Pesan dokter, resep, dan ringkasan'],
    ['reminder', 'Pengingat', 'Klaim poin harian & masa aktif paket'],
    ['promo', 'Promo & info', 'Penawaran paket dan artikel baru'],
  ] as const
  return (
    <SubPage title="Pengaturan Notifikasi">
      <Card className="gap-0 py-0 shadow-none">
        <ul className="divide-y">
          {rows.map(([k, t, d]) => (
            <li key={k} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1">
                <Label htmlFor={`notif-${k}`} className="font-semibold">
                  {t}
                </Label>
                <p id={`notif-${k}-desc`} className="text-muted-foreground text-sm">
                  {d}
                </p>
              </div>
              <Switch
                id={`notif-${k}`}
                aria-describedby={`notif-${k}-desc`}
                checked={prefs[k]}
                onCheckedChange={(v) => setPrefs({ ...prefs, [k]: v })}
              />
            </li>
          ))}
        </ul>
      </Card>
    </SubPage>
  )
}
