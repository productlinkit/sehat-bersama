import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Lock, ShieldCheck, Ticket } from 'lucide-react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IconPaid } from '@/components/icons'
import { AppShell, Logo, PageHeader, touchLink } from '@/components/layout'
import { WhatsAppButton } from '@/pages/account'
import { track } from '@/lib/analytics'
import { findProduct, rupiah } from '@/lib/data'
import { useI18n, type L } from '@/lib/i18n'
import { useLastPaymentMethod, useRewards } from '@/lib/rewards'
import { cn } from '@/lib/utils'

const methods: { id: string; label: string; hint: L }[] = [
  { id: 'qris', label: 'QRIS', hint: { id: 'Bayar dengan aplikasi bank atau dompet digital apa pun', en: 'Pay with any banking or e-wallet app' } },
  { id: 'gopay', label: 'GoPay', hint: { id: 'Diarahkan ke aplikasi Gojek', en: 'Opens the Gojek app' } },
  { id: 'ovo', label: 'OVO', hint: { id: 'Notifikasi dikirim ke aplikasi OVO', en: 'A request is sent to your OVO app' } },
  { id: 'dana', label: 'DANA', hint: { id: 'Diarahkan ke aplikasi DANA', en: 'Opens the DANA app' } },
  { id: 'va-bca', label: 'Virtual Account BCA', hint: { id: 'Nomor VA berlaku 24 jam', en: 'Account number valid for 24 hours' } },
]

const ADMIN_FEE = 0

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border-2', checked ? 'border-primary' : 'border-[#848ea0]')} aria-hidden>
      {checked && <span className="bg-primary size-2.5 rounded-full" />}
    </span>
  )
}

export function CheckoutPage() {
  const { t, tr, lang } = useI18n()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const product = findProduct(params.get('pkg'))
  const [lastMethod, setLastMethod] = useLastPaymentMethod()
  // Pre-select the last-used method (QRIS for first-time buyers) so "Pay" never errors on the happy path.
  const [method, setMethod] = useState(methods.some((m) => m.id === lastMethod) ? lastMethod : 'qris')
  const { ownedVouchers } = useRewards()
  const usable = ownedVouchers.filter((o) => product && o.voucher.appliesTo.includes(product.id))
  const [voucherUid, setVoucherUid] = useState<string>('none')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const groupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (product) track('checkout_view', { id: product.id })
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) return <Navigate to="/packages" replace />

  const voucher = usable.find((o) => o.uid === voucherUid)
  const discount = Math.min(voucher?.voucher.discount ?? 0, product.price)
  const total = product.price - discount + ADMIN_FEE
  const rp = (n: number) => rupiah(n, lang)
  const days = t(`${product.days} hari`, product.days === 1 ? '1 day' : `${product.days} days`)

  const pay = async () => {
    if (!method) {
      setError(t('Pilih metode pembayaran dulu.', 'Choose a payment method first.'))
      // Move focus to the group with the error so keyboard and screen-reader users land on it.
      groupRef.current?.querySelector<HTMLElement>('[role=radio]')?.focus()
      return
    }
    setError('')
    setPaying(true)
    await new Promise((r) => setTimeout(r, 900))
    setLastMethod(method)
    const q = new URLSearchParams({ pkg: product.id, method, ...(voucher && { voucher: voucher.uid }) })
    navigate(`/payment/success?${q}`, { replace: true })
  }

  return (
    <AppShell nav={false}>
      <PageHeader title={t('Pembayaran', 'Payment')} subtitle={t('Langkah terakhir sebelum konsultasi', 'The last step before your consultation')} back={`/packages?selected=${product.id}`} />
      <div className="space-y-5 p-4 lg:p-8">
        <Card className="gap-2 p-4 shadow-none min-[360px]:p-5">
          <h2 className="text-muted-foreground text-sm font-semibold">{t('Ringkasan pesanan', 'Order summary')}</h2>
          <div className="flex flex-wrap items-center justify-between gap-x-3">
            <p className="text-lg font-bold">{tr(product.name)}</p>
            <p className="text-lg font-bold">{rp(product.price)}</p>
          </div>
          <p className="text-muted-foreground text-sm">{t(`Aktif ${days} sejak pembayaran berhasil`, `Active for ${days} after payment`)}</p>
          <Link to={`/packages?selected=${product.id}`} className={cn(touchLink, 'self-start')}>
            {t('Ganti paket', 'Change plan')}
          </Link>
        </Card>

        <section aria-labelledby="metode" className="space-y-3">
          <h2 id="metode" className="text-lg font-bold">
            {t('Metode pembayaran', 'Payment method')}
          </h2>
          {error && (
            <p id="metode-error" role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <RadioGroupPrimitive.Root
            ref={groupRef}
            value={method}
            onValueChange={(v) => {
              setMethod(v)
              setError('')
            }}
            aria-labelledby="metode"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'metode-error' : undefined}
            className="grid gap-2 md:grid-cols-2"
          >
            {methods.map((m) => (
              <RadioGroupPrimitive.Item
                key={m.id}
                value={m.id}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 bg-white p-3 text-left min-[360px]:p-4',
                  method === m.id ? 'border-primary bg-emerald-50' : error ? 'border-red-300' : 'border-slate-200',
                )}
              >
                <RadioDot checked={method === m.id} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                    {m.label}
                    {m.id === lastMethod && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-teal-800">{t('Terakhir dipakai', 'Last used')}</span>
                    )}
                  </span>
                  <span className="text-muted-foreground block text-[13px]">{tr(m.hint)}</span>
                </span>
              </RadioGroupPrimitive.Item>
            ))}
          </RadioGroupPrimitive.Root>
        </section>

        <section aria-labelledby="voucher" className="space-y-3">
          <h2 id="voucher" className="flex items-center gap-2 text-lg font-bold">
            <Ticket className="text-primary size-5" aria-hidden /> Voucher
          </h2>
          {usable.length === 0 ? (
            <p className="text-muted-foreground rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm">
              {t('Belum ada voucher untuk paket ini. ', 'No vouchers for this plan yet. ')}
              <Link to="/reward" className="text-primary font-semibold underline">
                {t('Tukar poin di Hadiah', 'Redeem points in Rewards')}
              </Link>
            </p>
          ) : (
            <RadioGroupPrimitive.Root value={voucherUid} onValueChange={setVoucherUid} aria-labelledby="voucher" className="space-y-2">
              {[{ uid: 'none', label: t('Tanpa voucher', 'No voucher'), hint: '' }, ...usable.map((o) => ({ uid: o.uid, label: tr(o.voucher.title), hint: tr(o.voucher.description) }))].map((o) => (
                <RadioGroupPrimitive.Item
                  key={o.uid}
                  value={o.uid}
                  className={cn('flex w-full items-center gap-3 rounded-xl border-2 bg-white p-3 text-left min-[360px]:p-4', voucherUid === o.uid ? 'border-primary bg-emerald-50' : 'border-slate-200')}
                >
                  <RadioDot checked={voucherUid === o.uid} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{o.label}</span>
                    {o.hint && <span className="text-muted-foreground block text-[13px]">{o.hint}</span>}
                  </span>
                </RadioGroupPrimitive.Item>
              ))}
            </RadioGroupPrimitive.Root>
          )}
        </section>

        <Card className="gap-2 p-4 shadow-none min-[360px]:p-5">
          <div className="flex justify-between gap-3 text-sm">
            <span>{t('Harga paket', 'Plan price')}</span>
            <span>{rp(product.price)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between gap-3 text-sm text-teal-800">
              <span>Voucher</span>
              <span>− {rp(discount)}</span>
            </div>
          )}
          <div className="flex justify-between gap-3 text-sm">
            <span>{t('Biaya admin', 'Admin fee')}</span>
            <span>{ADMIN_FEE ? rp(ADMIN_FEE) : t('Gratis', 'Free')}</span>
          </div>
          <div className="flex justify-between gap-3 border-t pt-2 font-bold">
            <span>Total</span>
            <span>{rp(total)}</span>
          </div>
        </Card>

        <Button className="h-auto min-h-12 w-full rounded-full text-base font-semibold whitespace-normal" onClick={pay} disabled={paying}>
          {paying ? <Loader2 className="animate-spin" aria-hidden /> : <Lock aria-hidden />} {t(`Bayar ${rp(total)}`, `Pay ${rp(total)}`)}
        </Button>
        <p className="text-muted-foreground flex items-center justify-center gap-1 text-center text-[13px]">
          <ShieldCheck className="size-4 shrink-0" aria-hidden /> {t('Pembayaran aman dan terenkripsi', 'Secure, encrypted payment')}
        </p>
        <Card className="items-center gap-1 p-4 text-center shadow-none">
          <p className="font-semibold">{t('Ada kendala saat membayar?', 'Trouble paying?')}</p>
          <WhatsAppButton />
        </Card>
      </div>
    </AppShell>
  )
}

export function PaymentSuccessPage() {
  const { t, tr, lang } = useI18n()
  const [params] = useSearchParams()
  const product = findProduct(params.get('pkg'))
  const method = methods.find((m) => m.id === params.get('method'))
  const voucherUid = params.get('voucher')
  const isLega = product?.id.startsWith('lega')
  const { consume, addPoints } = useRewards()
  const done = useRef(false)

  // Record the purchase once: consume the voucher, award points, log the funnel step.
  useEffect(() => {
    if (done.current || !product) return
    done.current = true
    const key = `sb:paid:${product.id}:${params.toString()}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      /* ignore */
    }
    if (voucherUid) consume(voucherUid)
    const name = typeof product.name === 'string' ? { id: product.name, en: product.name } : product.name
    addPoints({ id: `Pembelian ${name.id}`, en: `Bought ${name.en}` }, 50)
    track('payment_success', { id: product.id, method: method?.id ?? '' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const days = product && t(`${product.days} hari`, product.days === 1 ? '1 day' : `${product.days} days`)

  return (
    <AppShell nav={false}>
      <div className="mx-auto max-w-md space-y-6 p-5 pt-10 text-center min-[360px]:p-6">
        <Logo className="justify-center" />
        <div className="mx-auto grid size-32 place-items-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 text-teal-800 [--icon-fill:#ffffff]">
          <IconPaid className="size-20" />
        </div>
        <div role="status">
          <h1 className="text-2xl font-extrabold">{t('Pembayaran berhasil!', 'Payment successful!')}</h1>
          <p className="text-muted-foreground mt-2">
            {product ? t(`${tr(product.name)} sudah aktif selama ${days}.`, `${tr(product.name)} is now active for ${days}.`) : t('Paketmu sudah aktif.', 'Your plan is active.')}{' '}
            {t('Kamu juga mendapat +50 poin.', 'You also earned +50 points.')}
          </p>
        </div>
        {product && (
          <Card className="gap-2 p-5 text-left shadow-none">
            <div className="flex flex-wrap justify-between gap-x-3 text-sm">
              <span className="text-muted-foreground">{t('Paket', 'Plan')}</span>
              <b>{tr(product.name)}</b>
            </div>
            <div className="flex flex-wrap justify-between gap-x-3 text-sm">
              <span className="text-muted-foreground">{t('Masa aktif', 'Active for')}</span>
              <b>{days}</b>
            </div>
            <div className="flex flex-wrap justify-between gap-x-3 text-sm">
              <span className="text-muted-foreground">{t('Dibayar', 'Paid')}</span>
              <b>{rupiah(product.price, lang)}</b>
            </div>
            {method && (
              <div className="flex flex-wrap justify-between gap-x-3 text-sm">
                <span className="text-muted-foreground">{t('Metode', 'Method')}</span>
                <b>{method.label}</b>
              </div>
            )}
          </Card>
        )}
        <div className="space-y-3">
          <Button asChild className="h-auto min-h-12 w-full rounded-full text-base font-semibold whitespace-normal">
            <Link to={isLega ? '/lega/chat' : '/consultation/start?type=umum'}>
              {isLega ? t('Mulai Cerita dengan Lega', 'Start talking with Lega') : t('Mulai Konsultasi', 'Start consultation')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto min-h-12 w-full rounded-full whitespace-normal">
            <Link to="/account">{t('Lihat Paket Saya', 'View my plans')}</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
