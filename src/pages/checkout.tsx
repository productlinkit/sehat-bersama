import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Lock, ShieldCheck, Ticket } from 'lucide-react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IconPaid } from '@/components/icons'
import { AppShell, Logo, PageHeader } from '@/components/layout'
import { WhatsAppButton } from '@/pages/account'
import { track } from '@/lib/analytics'
import { findProduct, rupiah } from '@/lib/data'
import { useLastPaymentMethod, useRewards } from '@/lib/rewards'
import { cn } from '@/lib/utils'

const methods = [
  { id: 'qris', label: 'QRIS', hint: 'Bayar dengan aplikasi bank atau dompet digital apa pun' },
  { id: 'gopay', label: 'GoPay', hint: 'Diarahkan ke aplikasi Gojek' },
  { id: 'ovo', label: 'OVO', hint: 'Notifikasi dikirim ke aplikasi OVO' },
  { id: 'dana', label: 'DANA', hint: 'Diarahkan ke aplikasi DANA' },
  { id: 'va-bca', label: 'Virtual Account BCA', hint: 'Nomor VA berlaku 24 jam' },
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
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const product = findProduct(params.get('pkg'))
  const [lastMethod, setLastMethod] = useLastPaymentMethod()
  // Pre-select the last-used method (QRIS for first-time buyers) so "Bayar" never errors on the happy path.
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

  const pay = async () => {
    if (!method) {
      setError('Pilih metode pembayaran dulu.')
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
      <PageHeader title="Pembayaran" subtitle="Langkah terakhir sebelum konsultasi" back={`/packages?selected=${product.id}`} />
      <div className="space-y-5 p-4 lg:p-8">
        <Card className="gap-2 p-5 shadow-none">
          <h2 className="text-muted-foreground text-sm font-semibold">Ringkasan pesanan</h2>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">{product.name}</p>
            <p className="text-lg font-bold">{rupiah(product.price)}</p>
          </div>
          <p className="text-muted-foreground text-sm">Aktif {product.days} hari sejak pembayaran berhasil</p>
          <Link to={`/packages?selected=${product.id}`} className="text-primary self-start rounded text-sm font-semibold">
            Ganti paket
          </Link>
        </Card>

        <section aria-labelledby="metode" className="space-y-3">
          <h2 id="metode" className="text-lg font-bold">
            Metode pembayaran
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
            className="space-y-2"
          >
            {methods.map((m) => (
              <RadioGroupPrimitive.Item
                key={m.id}
                value={m.id}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 bg-white p-4 text-left',
                  method === m.id ? 'border-primary bg-emerald-50' : error ? 'border-red-300' : 'border-slate-200',
                )}
              >
                <RadioDot checked={method === m.id} />
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-semibold">
                    {m.label}
                    {m.id === lastMethod && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-teal-800">Terakhir dipakai</span>
                    )}
                  </span>
                  <span className="text-muted-foreground block text-[13px]">{m.hint}</span>
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
              Belum ada voucher untuk paket ini.{' '}
              <Link to="/reward" className="text-primary font-semibold underline">
                Tukar poin di Hadiah
              </Link>
            </p>
          ) : (
            <RadioGroupPrimitive.Root value={voucherUid} onValueChange={setVoucherUid} aria-labelledby="voucher" className="space-y-2">
              {[{ uid: 'none', label: 'Tanpa voucher', hint: '' }, ...usable.map((o) => ({ uid: o.uid, label: o.voucher.title, hint: o.voucher.description }))].map(
                (o) => (
                  <RadioGroupPrimitive.Item
                    key={o.uid}
                    value={o.uid}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border-2 bg-white p-4 text-left',
                      voucherUid === o.uid ? 'border-primary bg-emerald-50' : 'border-slate-200',
                    )}
                  >
                    <RadioDot checked={voucherUid === o.uid} />
                    <span className="flex-1">
                      <span className="block font-semibold">{o.label}</span>
                      {o.hint && <span className="text-muted-foreground block text-[13px]">{o.hint}</span>}
                    </span>
                  </RadioGroupPrimitive.Item>
                ),
              )}
            </RadioGroupPrimitive.Root>
          )}
        </section>

        <Card className="gap-2 p-5 shadow-none">
          <div className="flex justify-between text-sm">
            <span>Harga paket</span>
            <span>{rupiah(product.price)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-teal-800">
              <span>Voucher</span>
              <span>− {rupiah(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Biaya admin</span>
            <span>{ADMIN_FEE ? rupiah(ADMIN_FEE) : 'Gratis'}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>Total</span>
            <span>{rupiah(total)}</span>
          </div>
        </Card>

        <Button className="h-12 w-full rounded-full text-base font-semibold" onClick={pay} disabled={paying}>
          {paying ? <Loader2 className="animate-spin" aria-hidden /> : <Lock aria-hidden />} Bayar {rupiah(total)}
        </Button>
        <p className="text-muted-foreground flex items-center justify-center gap-1 text-[13px]">
          <ShieldCheck className="size-4" aria-hidden /> Pembayaran aman dan terenkripsi
        </p>
        <Card className="items-center gap-1 p-4 text-center shadow-none">
          <p className="font-semibold">Ada kendala saat membayar?</p>
          <WhatsAppButton />
        </Card>
      </div>
    </AppShell>
  )
}

export function PaymentSuccessPage() {
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
    addPoints(`Pembelian ${product.name}`, 50)
    track('payment_success', { id: product.id, method: method?.id ?? '' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppShell nav={false}>
      <div className="mx-auto max-w-md space-y-6 p-6 pt-10 text-center">
        <Logo className="justify-center" />
        <div className="mx-auto grid size-32 place-items-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 text-teal-800 [--icon-fill:#ffffff]">
          <IconPaid className="size-20" />
        </div>
        <div role="status">
          <h1 className="text-2xl font-extrabold">Pembayaran berhasil!</h1>
          <p className="text-muted-foreground mt-2">
            {product ? `${product.name} sudah aktif selama ${product.days} hari.` : 'Paketmu sudah aktif.'} Kamu juga mendapat +50 poin.
          </p>
        </div>
        {product && (
          <Card className="gap-2 p-5 text-left shadow-none">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paket</span>
              <b>{product.name}</b>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Masa aktif</span>
              <b>{product.days} hari</b>
            </div>
            {method && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Metode</span>
                <b>{method.label}</b>
              </div>
            )}
          </Card>
        )}
        <div className="space-y-3">
          <Button asChild className="h-12 w-full rounded-full text-base font-semibold">
            <Link to={isLega ? '/lega/chat' : '/consultation/start?type=umum'}>{isLega ? 'Mulai Cerita dengan Lega' : 'Mulai Konsultasi'}</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full rounded-full">
            <Link to="/account">Lihat Paket Saya</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
