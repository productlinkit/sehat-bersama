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
import { AppShell, BackButton, LanguageToggle, Logo, PageHeader, touchLink } from '@/components/layout'
import { PHONE_RE, useAuth, type AuthError } from '@/lib/auth'
import { findProduct, rupiah } from '@/lib/data'
import { useI18n } from '@/lib/i18n'

type T = ReturnType<typeof useI18n>['t']

const phoneError = (v: string, t: T) =>
  !v
    ? t('Nomor HP wajib diisi.', 'Enter your phone number.')
    : !PHONE_RE.test(v)
      ? t('Nomor HP harus diawali 08 dan berisi 10–13 angka.', 'Phone number must start with 08 and have 10–13 digits.')
      : ''

const authErrorText = (code: string, t: T) =>
  ({
    'invalid-phone': t('Format nomor HP tidak valid.', 'That phone number format isn’t valid.'),
    'wrong-credentials': t('Nomor HP atau kata sandi salah.', 'Phone number or password is incorrect.'),
    'weak-password': t('Kata sandi minimal 8 karakter.', 'Password must be at least 8 characters.'),
  })[code as AuthError] ?? t('Terjadi kesalahan. Coba lagi.', 'Something went wrong. Please try again.')

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
  const { t, tr, lang } = useI18n()
  const product = productFromRedirect(redirect)
  return (
    <AppShell>
      <div className="flex items-center justify-between gap-2 px-3 pt-4 min-[360px]:px-4">
        <BackButton label={t('Kembali ke halaman sebelumnya', 'Back to previous page')} />
        <div className="flex items-center gap-1">
          <LanguageToggle compact />
          <Button asChild variant="ghost" size="sm" className="h-9 rounded-full px-2.5">
            <Link to="/help">
              <HelpCircle aria-hidden /> <span className="max-[339px]:sr-only">{t('Bantuan', 'Help')}</span>
            </Link>
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-md px-5 pt-4 pb-10 min-[360px]:px-6">
        <Logo />
        <h1 className="mt-10 text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
        {product && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
            <ShoppingBag className="size-5 shrink-0 text-teal-800" aria-hidden />
            <p className="text-sm text-teal-900">
              {t('Kamu memilih ', 'You chose ')}
              <b>{tr(product.name)}</b> · {rupiah(product.price, lang)}.{' '}
              {t('Setelah masuk, kamu langsung lanjut ke pembayaran.', 'After signing in, you’ll go straight to payment.')}
            </p>
          </div>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </AppShell>
  )
}

const submitCls = 'h-auto min-h-12 w-full rounded-xl text-base font-semibold whitespace-normal'

export function LoginPage() {
  const { user, login } = useAuth()
  const { t } = useI18n()
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
    phone: phoneError(phone, t),
    password: password ? '' : t('Kata sandi wajib diisi.', 'Enter your password.'),
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ phone: true, password: true })
    if (errors.phone || errors.password) return
    setError('')
    setLoading(true)
    try {
      await login(phone, password)
      toast.success(t('Berhasil masuk', 'Signed in'))
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(authErrorText((err as Error).message, t))
    } finally {
      setLoading(false)
    }
  }

  const carry = new URLSearchParams({ redirect, ...(phone && { phone }) }).toString()

  return (
    <AuthLayout title={t('Masuk ke akunmu', 'Sign in to your account')} subtitle={t('Masuk dengan nomor HP dan kata sandimu.', 'Use your phone number and password.')} redirect={redirect}>
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label={t('Nomor HP', 'Phone number')} hint={t('Format nomor Indonesia, contoh 081234567890', 'Indonesian format, e.g. 081234567890')} error={touched.phone ? errors.phone : ''}>
          {(f) => (
            <Input
              {...f}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="0812..."
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              onBlur={() => setTouched((v) => ({ ...v, phone: true }))}
              className={inputCls}
              required
            />
          )}
        </Field>
        <Field label={t('Kata Sandi', 'Password')} error={touched.password ? errors.password : ''}>
          {(f) => (
            <PasswordInput
              {...f}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((v) => ({ ...v, password: true }))}
              required
            />
          )}
        </Field>
        <div className="text-right">
          <Link to={`/forgot-password?${carry}`} className={touchLink}>
            {t('Lupa kata sandi?', 'Forgot password?')}
          </Link>
        </div>
        <FormError>{error}</FormError>
        <Button type="submit" className={submitCls} disabled={loading}>
          {loading && <Loader2 className="animate-spin" aria-hidden />} {t('Masuk', 'Sign in')}
        </Button>
        <Button asChild variant="outline" className={submitCls}>
          <Link to={`/register?${carry}`}>{t('Belum punya akun? Daftar', 'No account yet? Sign up')}</Link>
        </Button>
      </form>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { user, register } = useAuth()
  const { t } = useI18n()
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
    name: form.name.trim().length >= 2 ? '' : t('Isi nama lengkapmu sesuai identitas.', 'Enter your full name as on your ID.'),
    phone: phoneError(form.phone, t),
    password: form.password.length >= 8 ? '' : t('Kata sandi minimal 8 karakter.', 'Password must be at least 8 characters.'),
    consent: consent ? '' : t('Kamu perlu menyetujui Syarat & Ketentuan dan Kebijakan Privasi.', 'Please accept the Terms & Conditions and Privacy Policy.'),
  }
  const show = (k: keyof typeof errors) => (touched[k] ? errors[k] : '')
  const blur = (k: string) => () => setTouched((v) => ({ ...v, [k]: true }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, phone: true, password: true, consent: true })
    if (Object.values(errors).some(Boolean)) return
    setError('')
    setLoading(true)
    try {
      await register(form.name.trim(), form.phone, form.password)
      toast.success(t('Akun berhasil dibuat', 'Account created'))
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(authErrorText((err as Error).message, t))
    } finally {
      setLoading(false)
    }
  }

  const carry = new URLSearchParams({ redirect, ...(form.phone && { phone: form.phone }) }).toString()

  return (
    <AuthLayout title={t('Buat akun baru', 'Create an account')} subtitle={t('Daftar dengan nomor HP untuk mulai konsultasi.', 'Sign up with your phone number to start consulting.')} redirect={redirect}>
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label={t('Nama lengkap', 'Full name')} error={show('name')}>
          {(f) => (
            <Input
              {...f}
              autoComplete="name"
              placeholder={t('Nama sesuai identitas', 'Name as on your ID')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={blur('name')}
              className={inputCls}
              required
            />
          )}
        </Field>
        <Field label={t('Nomor HP', 'Phone number')} hint={t('Format nomor Indonesia, contoh 081234567890', 'Indonesian format, e.g. 081234567890')} error={show('phone')}>
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
        <Field label={t('Kata Sandi', 'Password')} hint={t('Minimal 8 karakter, gabungan huruf dan angka.', 'At least 8 characters, with letters and numbers.')} error={show('password')}>
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
                setTouched((x) => ({ ...x, consent: true }))
              }}
              aria-invalid={show('consent') ? true : undefined}
              aria-describedby={show('consent') ? 'consent-error' : undefined}
              className="mt-0.5"
            />
            <Label htmlFor="consent" className="block text-sm leading-relaxed font-normal">
              {t('Saya menyetujui ', 'I agree to the ')}
              <Link to="/terms" target="_blank" className="text-primary font-semibold underline">
                {t('Syarat & Ketentuan', 'Terms & Conditions')}
              </Link>
              {t(' dan ', ' and ')}
              <Link to="/privacy-policy" target="_blank" className="text-primary font-semibold underline">
                {t('Kebijakan Privasi', 'Privacy Policy')}
              </Link>
              {t(
                ', termasuk pemrosesan data kesehatan saya sesuai UU PDP No. 27/2022.',
                ', including processing of my health data under Indonesia’s Personal Data Protection Law (No. 27/2022).',
              )}
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
          {loading && <Loader2 className="animate-spin" aria-hidden />} {t('Daftar', 'Sign up')}
        </Button>
        <Button asChild variant="outline" className={submitCls}>
          <Link to={`/login?${carry}`}>{t('Sudah punya akun? Masuk', 'Already have an account? Sign in')}</Link>
        </Button>
      </form>
    </AuthLayout>
  )
}

const DEMO_OTP = '123456'

export function ForgotPasswordPage() {
  const { t } = useI18n()
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
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const steps = { phone: 1, otp: 2, password: 3, done: 3 }

  return (
    <AppShell nav={false}>
      <PageHeader
        title={t('Atur Ulang Kata Sandi', 'Reset Password')}
        subtitle={step !== 'done' ? t(`Langkah ${steps[step]} dari 3`, `Step ${steps[step]} of 3`) : undefined}
        back="/login"
        right={<LanguageToggle compact />}
      />
      <div className="mx-auto max-w-md p-5 min-[360px]:p-6">
        {step === 'phone' && (
          <form
            noValidate
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              const err = phoneError(phone, t)
              setError(err)
              if (!err) {
                setStep('otp')
                setCooldown(60)
              }
            }}
          >
            <p className="text-muted-foreground">
              {t('Masukkan nomor HP yang terdaftar. Kami kirim kode OTP lewat SMS/WhatsApp.', 'Enter your registered phone number. We’ll send a one-time code by SMS/WhatsApp.')}
            </p>
            <Field label={t('Nomor HP', 'Phone number')} hint={t('Contoh 081234567890', 'e.g. 081234567890')} error={error}>
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
              {t('Kirim Kode OTP', 'Send code')}
            </Button>
          </form>
        )}

        {step === 'otp' && (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              if (otp !== DEMO_OTP) return setError(t('Kode OTP salah. Periksa lagi atau kirim ulang kode.', 'That code is incorrect. Check it or send a new one.'))
              setError('')
              setStep('password')
            }}
          >
            <p className="text-muted-foreground">
              {t('Masukkan 6 digit kode yang kami kirim ke ', 'Enter the 6-digit code we sent to ')}
              <b className="text-foreground">{phone}</b>.
            </p>
            <div className="space-y-2">
              <Label htmlFor="otp" className="font-semibold">
                {t('Kode OTP', 'One-time code')}
              </Label>
              <InputOTP
                id="otp"
                maxLength={6}
                value={otp}
                onChange={setOtp}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'otp-error otp-hint' : 'otp-hint'}
                containerClassName="w-full"
              >
                <InputOTPGroup className="w-full">
                  {Array.from({ length: 6 }, (_, i) => (
                    <InputOTPSlot key={i} index={i} className="aspect-square h-auto max-w-12 flex-1 text-lg" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <p id="otp-hint" className="text-muted-foreground text-[13px]">
                {t(`Mode demo: gunakan kode ${DEMO_OTP}.`, `Demo mode: use code ${DEMO_OTP}.`)}
              </p>
              {error && (
                <p id="otp-error" role="alert" className="text-[13px] font-medium text-red-700">
                  {error}
                </p>
              )}
            </div>
            <Button type="submit" className={submitCls} disabled={otp.length < 6}>
              {t('Verifikasi', 'Verify')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-auto min-h-10 w-full whitespace-normal"
              disabled={cooldown > 0}
              onClick={() => {
                setCooldown(60)
                toast.success(t('Kode OTP baru sudah dikirim', 'A new code has been sent'))
              }}
            >
              {cooldown > 0 ? t(`Kirim ulang kode dalam ${cooldown} detik`, `Resend code in ${cooldown}s`) : t('Kirim ulang kode', 'Resend code')}
            </Button>
          </form>
        )}

        {step === 'password' && (
          <form
            noValidate
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              if (pw.next.length < 8) return setError(t('Kata sandi minimal 8 karakter.', 'Password must be at least 8 characters.'))
              if (pw.next !== pw.confirm) return setError(t('Konfirmasi kata sandi belum sama.', 'The passwords don’t match.'))
              setError('')
              setStep('done')
            }}
          >
            <Field label={t('Kata sandi baru', 'New password')} hint={t('Minimal 8 karakter, gabungan huruf dan angka.', 'At least 8 characters, with letters and numbers.')}>
              {(f) => <PasswordInput {...f} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />}
            </Field>
            <Field label={t('Ulangi kata sandi baru', 'Confirm new password')} error={error}>
              {(f) => <PasswordInput {...f} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />}
            </Field>
            <Button type="submit" className={submitCls}>
              {t('Simpan Kata Sandi', 'Save password')}
            </Button>
          </form>
        )}

        {step === 'done' && (
          <div className="space-y-5 text-center" role="status">
            <CheckCircle2 className="text-primary mx-auto size-16" aria-hidden />
            <h2 className="text-xl font-bold">{t('Kata sandi berhasil diganti', 'Password changed')}</h2>
            <p className="text-muted-foreground">{t('Silakan masuk dengan kata sandi barumu.', 'Sign in with your new password.')}</p>
            <Button className={submitCls} onClick={() => navigate(`/login?phone=${phone}`)}>
              {t('Masuk Sekarang', 'Sign in now')}
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
