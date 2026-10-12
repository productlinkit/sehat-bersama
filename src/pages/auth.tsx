import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, HelpCircle, Loader2, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { Field, FormError, PasswordInput, inputCls } from '@/components/form'
import { AppShell, BackButton, Logo, PageHeader } from '@/components/layout'
import { PHONE_RE, useAuth } from '@/lib/auth'
import { findProduct, rupiah } from '@/lib/data'

const phoneError = (v: string) =>
  !v ? 'Nomor HP wajib diisi.' : !PHONE_RE.test(v) ? 'Nomor HP harus diawali 08 dan berisi 10–13 angka.' : ''

/** Pulls the chosen package out of a redirect like /checkout?pkg=harian. */
function productFromRedirect(redirect: string) {
  try {
    const url = new URL(redirect, window.location.origin)
    return url.pathname === '/checkout' ? findProduct(url.searchParams.get('pkg')) : undefined
  } catch {
    return undefined
  }
}

function AuthLayout({ title, subtitle, redirect, children }: { title: string; subtitle: string; redirect: string; children: ReactNode }) {
  const product = productFromRedirect(redirect)
  return (
    <AppShell>
      <div className="flex items-center justify-between px-4 pt-4">
        <BackButton label="Kembali ke halaman sebelumnya" />
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link to="/help">
            <HelpCircle aria-hidden /> Bantuan
          </Link>
        </Button>
      </div>
      <div className="mx-auto max-w-md px-6 pt-4 pb-10">
        <Logo />
        <h1 className="mt-10 text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
        {product && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
            <ShoppingBag className="size-5 shrink-0 text-teal-800" aria-hidden />
            <p className="text-sm text-teal-900">
              Kamu memilih <b>{product.name}</b> · {rupiah(product.price)}. Setelah masuk, kamu langsung lanjut ke pembayaran.
            </p>
          </div>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </AppShell>
  )
}

const submitCls = 'h-12 w-full rounded-xl text-base font-semibold'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/home'
  const [phone, setPhone] = useState(params.get('phone') ?? '')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ phone: false, password: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={redirect} replace />

  const errors = {
    phone: phoneError(phone),
    password: password ? '' : 'Kata sandi wajib diisi.',
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ phone: true, password: true })
    if (errors.phone || errors.password) return
    setError('')
    setLoading(true)
    try {
      await login(phone, password)
      toast.success('Berhasil masuk')
      navigate(redirect, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const carry = new URLSearchParams({ redirect, ...(phone && { phone }) }).toString()

  return (
    <AuthLayout title="Masuk ke akunmu" subtitle="Masuk dengan nomor HP dan kata sandimu." redirect={redirect}>
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label="Nomor HP" hint="Format nomor Indonesia, contoh 081234567890" error={touched.phone ? errors.phone : ''}>
          {(f) => (
            <Input
              {...f}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="0812..."
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              className={inputCls}
              required
            />
          )}
        </Field>
        <Field label="Kata Sandi" error={touched.password ? errors.password : ''}>
          {(f) => (
            <PasswordInput
              {...f}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              required
            />
          )}
        </Field>
        <div className="text-right">
          <Link to={`/forgot-password?${carry}`} className="text-primary rounded px-1 text-sm font-semibold">
            Lupa kata sandi?
          </Link>
        </div>
        <FormError>{error}</FormError>
        <Button type="submit" className={submitCls} disabled={loading}>
          {loading && <Loader2 className="animate-spin" aria-hidden />} Masuk
        </Button>
        <Button asChild variant="outline" className={submitCls}>
          <Link to={`/register?${carry}`}>Belum punya akun? Daftar</Link>
        </Button>
      </form>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/home'
  const [form, setForm] = useState({ name: '', phone: params.get('phone') ?? '', password: '' })
  const [consent, setConsent] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={redirect} replace />

  const errors = {
    name: form.name.trim().length >= 2 ? '' : 'Isi nama lengkapmu sesuai identitas.',
    phone: phoneError(form.phone),
    password: form.password.length >= 8 ? '' : 'Kata sandi minimal 8 karakter.',
    consent: consent ? '' : 'Kamu perlu menyetujui Syarat & Ketentuan dan Kebijakan Privasi.',
  }
  const show = (k: keyof typeof errors) => (touched[k] ? errors[k] : '')
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, phone: true, password: true, consent: true })
    if (Object.values(errors).some(Boolean)) return
    setError('')
    setLoading(true)
    try {
      await register(form.name.trim(), form.phone, form.password)
      toast.success('Akun berhasil dibuat')
      navigate(redirect, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const carry = new URLSearchParams({ redirect, ...(form.phone && { phone: form.phone }) }).toString()

  return (
    <AuthLayout title="Buat akun baru" subtitle="Daftar dengan nomor HP untuk mulai konsultasi." redirect={redirect}>
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label="Nama lengkap" error={show('name')}>
          {(f) => (
            <Input
              {...f}
              autoComplete="name"
              placeholder="Nama sesuai identitas"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={blur('name')}
              className={inputCls}
              required
            />
          )}
        </Field>
        <Field label="Nomor HP" hint="Format nomor Indonesia, contoh 081234567890" error={show('phone')}>
          {(f) => (
            <Input
              {...f}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="0812..."
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
              onBlur={blur('phone')}
              className={inputCls}
              required
            />
          )}
        </Field>
        <Field label="Kata Sandi" hint="Minimal 8 karakter, gabungan huruf dan angka." error={show('password')}>
          {(f) => (
            <PasswordInput
              {...f}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onBlur={blur('password')}
              required
            />
          )}
        </Field>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(v) => {
                setConsent(v === true)
                setTouched((t) => ({ ...t, consent: true }))
              }}
              aria-invalid={show('consent') ? true : undefined}
              aria-describedby={show('consent') ? 'consent-error' : undefined}
              className="mt-0.5 size-5"
            />
            <Label htmlFor="consent" className="block text-sm leading-relaxed font-normal">
              Saya menyetujui{' '}
              <Link to="/terms" target="_blank" className="text-primary font-semibold underline">
                Syarat & Ketentuan
              </Link>{' '}
              dan{' '}
              <Link to="/privacy-policy" target="_blank" className="text-primary font-semibold underline">
                Kebijakan Privasi
              </Link>
              , termasuk pemrosesan data kesehatan saya sesuai UU PDP No. 27/2022.
            </Label>
          </div>
          {show('consent') && (
            <p id="consent-error" role="alert" className="text-[13px] font-medium text-red-700">
              {errors.consent}
            </p>
          )}
        </div>
        <FormError>{error}</FormError>
        <Button type="submit" className={submitCls} disabled={loading}>
          {loading && <Loader2 className="animate-spin" aria-hidden />} Daftar
        </Button>
        <Button asChild variant="outline" className={submitCls}>
          <Link to={`/login?${carry}`}>Sudah punya akun? Masuk</Link>
        </Button>
      </form>
    </AuthLayout>
  )
}

const DEMO_OTP = '123456'

export function ForgotPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [step, setStep] = useState<'phone' | 'otp' | 'password' | 'done'>('phone')
  const [phone, setPhone] = useState(params.get('phone') ?? '')
  const [otp, setOtp] = useState('')
  const [pw, setPw] = useState({ next: '', confirm: '' })
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const steps = { phone: 1, otp: 2, password: 3, done: 3 }

  return (
    <AppShell nav={false}>
      <PageHeader title="Atur Ulang Kata Sandi" subtitle={step !== 'done' ? `Langkah ${steps[step]} dari 3` : undefined} back="/login" />
      <div className="mx-auto max-w-md p-6">
        {step === 'phone' && (
          <form
            noValidate
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              const err = phoneError(phone)
              setError(err)
              if (!err) {
                setStep('otp')
                setCooldown(60)
              }
            }}
          >
            <p className="text-muted-foreground">Masukkan nomor HP yang terdaftar. Kami kirim kode OTP lewat SMS/WhatsApp.</p>
            <Field label="Nomor HP" hint="Contoh 081234567890" error={error}>
              {(f) => (
                <Input
                  {...f}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="0812..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className={inputCls}
                />
              )}
            </Field>
            <Button type="submit" className={submitCls}>
              Kirim Kode OTP
            </Button>
          </form>
        )}

        {step === 'otp' && (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              if (otp !== DEMO_OTP) return setError('Kode OTP salah. Periksa lagi atau kirim ulang kode.')
              setError('')
              setStep('password')
            }}
          >
            <p className="text-muted-foreground">
              Masukkan 6 digit kode yang kami kirim ke <b className="text-foreground">{phone}</b>.
            </p>
            <div className="space-y-2">
              <Label htmlFor="otp" className="font-semibold">
                Kode OTP
              </Label>
              <InputOTP
                id="otp"
                maxLength={6}
                value={otp}
                onChange={setOtp}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'otp-error otp-hint' : 'otp-hint'}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }, (_, i) => (
                    <InputOTPSlot key={i} index={i} className="size-12 text-lg" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <p id="otp-hint" className="text-muted-foreground text-[13px]">
                Mode demo: gunakan kode {DEMO_OTP}.
              </p>
              {error && (
                <p id="otp-error" role="alert" className="text-[13px] font-medium text-red-700">
                  {error}
                </p>
              )}
            </div>
            <Button type="submit" className={submitCls} disabled={otp.length < 6}>
              Verifikasi
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={cooldown > 0}
              onClick={() => {
                setCooldown(60)
                toast.success('Kode OTP baru sudah dikirim')
              }}
            >
              {cooldown > 0 ? `Kirim ulang kode dalam ${cooldown} detik` : 'Kirim ulang kode'}
            </Button>
          </form>
        )}

        {step === 'password' && (
          <form
            noValidate
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              if (pw.next.length < 8) return setError('Kata sandi minimal 8 karakter.')
              if (pw.next !== pw.confirm) return setError('Konfirmasi kata sandi belum sama.')
              setError('')
              setStep('done')
            }}
          >
            <Field label="Kata sandi baru" hint="Minimal 8 karakter, gabungan huruf dan angka.">
              {(f) => <PasswordInput {...f} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />}
            </Field>
            <Field label="Ulangi kata sandi baru" error={error}>
              {(f) => <PasswordInput {...f} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />}
            </Field>
            <Button type="submit" className={submitCls}>
              Simpan Kata Sandi
            </Button>
          </form>
        )}

        {step === 'done' && (
          <div className="space-y-5 text-center" role="status">
            <CheckCircle2 className="text-primary mx-auto size-16" aria-hidden />
            <h2 className="text-xl font-bold">Kata sandi berhasil diganti</h2>
            <p className="text-muted-foreground">Silakan masuk dengan kata sandi barumu.</p>
            <Button className={submitCls} onClick={() => navigate(`/login?phone=${phone}`)}>
              Masuk Sekarang
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
