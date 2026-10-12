import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, Columns3, Sparkles } from 'lucide-react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DoctorsOnline } from '@/components/doctors'
import { AppShell, IconBadge, PageHeader, TextSizeButton } from '@/components/layout'
import { track } from '@/lib/analytics'
import {
  AI_COPILOT_EXPLAINER,
  compareRows,
  legaPass,
  packages,
  recommendationFor,
  rupiah,
  type Package,
} from '@/lib/data'
import { cn } from '@/lib/utils'

const perDay = (price: number, days: number) => (days > 1 ? `≈ ${rupiah(price / days)}/hari` : 'per hari')

function SelectedMark({ selected }: { selected: boolean }) {
  return selected ? (
    <span className="bg-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white">
      <Check className="size-3.5" aria-hidden /> Dipilih
    </span>
  ) : (
    <span className="size-6 rounded-full border-2 border-[#848ea0] bg-white" aria-hidden />
  )
}

function PackageCard({
  pkg,
  selected,
  recommended,
  onDetails,
}: {
  pkg: Package
  selected: boolean
  recommended: boolean
  onDetails: (trigger: HTMLElement) => void
}) {
  return (
    <div className={cn('relative rounded-2xl border-2 bg-white transition', selected ? 'border-primary bg-emerald-50 shadow-md' : 'border-slate-200')}>
      {(pkg.popular || recommended) && (
        <div className="absolute -top-3 left-4 flex gap-1.5">
          {recommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-700 px-2.5 py-0.5 text-xs font-bold text-white">
              <Sparkles className="size-3" aria-hidden /> Rekomendasi untukmu
            </span>
          )}
          {pkg.popular && <span className="rounded-full bg-teal-800 px-2.5 py-0.5 text-xs font-bold text-white">Paling Populer</span>}
        </div>
      )}
      <RadioGroupPrimitive.Item
        value={pkg.id}
        aria-label={`${pkg.name}, ${rupiah(pkg.price)} untuk ${pkg.days} hari${pkg.popular ? ', paling populer' : ''}${recommended ? ', rekomendasi untukmu' : ''}`}
        className="flex w-full gap-4 rounded-2xl p-4 pt-5 text-left"
      >
        <IconBadge icon={pkg.icon} tone={pkg.tone} className="size-16 rounded-2xl" />
        <span className="min-w-0 flex-1 space-y-2">
          <span className="flex items-start justify-between gap-2">
            <span>
              <span className="block text-base font-bold">{pkg.name}</span>
              <span className="text-muted-foreground block text-[13px]">{pkg.days} hari · 1 nomor HP</span>
            </span>
            <SelectedMark selected={selected} />
          </span>
          <span className="block">
            <span className="text-primary text-xl font-extrabold">{rupiah(pkg.price)}</span>{' '}
            <span className="text-muted-foreground text-[13px]">{perDay(pkg.price, pkg.days)}</span>
          </span>
          <span className="block space-y-1">
            {pkg.features.map((f) => (
              <span key={f} className="flex items-start gap-2 text-sm">
                <Check className="text-primary mt-0.5 size-4 shrink-0" aria-hidden /> {f}
              </span>
            ))}
          </span>
        </span>
      </RadioGroupPrimitive.Item>
      <div className="px-4 pb-3 text-right">
        <Button type="button" variant="link" className="h-auto p-1 text-sm" onClick={(e) => onDetails(e.currentTarget)}>
          Lihat detail {pkg.name}
        </Button>
      </div>
    </div>
  )
}

export function PackagesPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const rec = recommendationFor[params.get('for') ?? '']
  const [selected, setSelected] = useState<string>(params.get('selected') ?? rec?.id ?? '')
  const [details, setDetails] = useState<Package | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)
  // Sheets opened programmatically return focus to the control that opened them (WCAG 2.4.3).
  const compareTrigger = useRef<HTMLButtonElement>(null)
  const detailsTrigger = useRef<HTMLElement | null>(null)
  const legaSelected = legaPass.options.find((o) => o.id === selected)
  const LegaIcon = legaPass.icon

  useEffect(() => {
    track('package_view', params.get('for') ? { for: params.get('for')! } : undefined)
  }, [params])

  const select = (id: string) => {
    setSelected(id)
    track('package_select', { id })
  }

  return (
    <AppShell wide nav={false}>
      <PageHeader title="Pilih Paket" subtitle="Bayar sekali, pakai selama masa aktif." back right={<TextSizeButton />} />
      <div className="space-y-5 p-4 lg:p-8">
        {rec && (
          <div className="flex gap-3 rounded-2xl border border-violet-300 bg-violet-50 p-4" role="note">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-violet-700" aria-hidden />
            <p className="text-sm text-violet-950">
              <b>Rekomendasi untukmu:</b> {rec.reason} Paketnya sudah kami pilihkan, kamu tetap bisa ganti.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold">{packages.length + 1} pilihan paket</h2>
          <Button ref={compareTrigger} variant="outline" className="rounded-full" onClick={() => setCompareOpen(true)}>
            <Columns3 aria-hidden /> Bandingkan paket
          </Button>
        </div>

        <RadioGroupPrimitive.Root value={selected} onValueChange={select} aria-label="Pilih paket" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {packages.map((p) => (
              <PackageCard
                key={p.id}
                pkg={p}
                selected={selected === p.id}
                recommended={rec?.id === p.id}
                onDetails={(el) => {
                  detailsTrigger.current = el
                  setDetails(p)
                }}
              />
            ))}
          </div>

          <div className={cn('rounded-2xl border-2 bg-violet-50 p-4', legaSelected ? 'border-violet-700 shadow-md' : 'border-violet-200')}>
            <div className="flex items-start gap-4">
              <IconBadge icon={LegaIcon} tone="violet" className="size-16 rounded-2xl bg-white" />
              <div className="flex-1">
                <p className="text-base font-bold" id="lega-pass">
                  Lega Pass
                </p>
                <p className="text-muted-foreground text-[13px]">Akses Lega, teman cerita AI, sesuai durasi pilihanmu.</p>
                <ul className="mt-2 space-y-1">
                  {legaPass.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-violet-700" aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-labelledby="lega-pass">
              {legaPass.options.map((o) => (
                <RadioGroupPrimitive.Item
                  key={o.id}
                  value={o.id}
                  aria-label={`${o.name}, ${rupiah(o.price)}${rec?.id === o.id ? ', rekomendasi untukmu' : ''}`}
                  className={cn(
                    'relative rounded-xl border-2 bg-white px-2.5 py-2 text-left',
                    selected === o.id ? 'border-violet-700 bg-violet-100' : 'border-violet-200',
                  )}
                >
                  {selected === o.id && <Check className="absolute top-2 right-2 size-4 text-violet-800" aria-hidden />}
                  <span className="block text-xs text-violet-900">{o.label}</span>
                  <span className="block text-sm font-bold whitespace-nowrap text-violet-900">{rupiah(o.price)}</span>
                  {rec?.id === o.id && <span className="block text-xs font-semibold text-violet-800">Rekomendasi</span>}
                </RadioGroupPrimitive.Item>
              ))}
            </div>
          </div>
        </RadioGroupPrimitive.Root>

        <div className="grid gap-3 lg:grid-cols-2">
          <DoctorsOnline />
          <details className="group rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold">
              Apa itu AI Co-Pilot?
              <ChevronDown className="size-5 transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-2 text-sm">{AI_COPILOT_EXPLAINER}</p>
          </details>
        </div>
      </div>

      <div className="sticky bottom-0 z-30 border-t bg-white p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <Button
          disabled={!selected}
          className="h-12 w-full rounded-full text-base font-semibold"
          onClick={() => navigate(`/checkout?pkg=${selected}`)}
        >
          {selected ? 'Lanjut ke Pembayaran' : 'Pilih paket dulu'} <ArrowRight aria-hidden />
        </Button>
      </div>

      {/* Package details bottom sheet */}
      <Sheet open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[85dvh] max-w-md overflow-y-auto rounded-t-3xl"
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            detailsTrigger.current?.focus()
          }}
        >
          {details && (
            <>
              <SheetHeader>
                <SheetTitle>{details.name}</SheetTitle>
                <SheetDescription>
                  {rupiah(details.price)} · aktif {details.days} hari sejak pembayaran · berlaku untuk 1 nomor HP
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <ul className="space-y-2">
                  {details.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="text-primary mt-0.5 size-5 shrink-0" aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
                <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{AI_COPILOT_EXPLAINER}</p>
                <p className="text-muted-foreground text-sm">Kuota yang tidak terpakai hangus saat masa aktif berakhir. Pembayaran tidak dapat dikembalikan.</p>
              </div>
              <SheetFooter>
                <Button
                  className="h-12 rounded-full"
                  onClick={() => {
                    select(details.id)
                    setDetails(null)
                  }}
                >
                  Pilih {details.name}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Side-by-side comparison */}
      <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[90dvh] max-w-3xl overflow-y-auto rounded-t-3xl"
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            compareTrigger.current?.focus()
          }}
        >
          <SheetHeader>
            <SheetTitle>Bandingkan paket</SheetTitle>
            <SheetDescription>Geser ke samping untuk melihat semua paket.</SheetDescription>
          </SheetHeader>
          <div className="overflow-x-auto px-4 pb-6" tabIndex={0} role="region" aria-label="Tabel perbandingan paket">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">Perbandingan isi paket Sehat Bersama</caption>
              <thead>
                <tr>
                  <th scope="col" className="p-2 text-left">
                    Fitur
                  </th>
                  {packages.map((p) => (
                    <th key={p.id} scope="col" className="p-2 text-center align-bottom">
                      {p.popular && <span className="mb-1 block text-xs font-bold text-teal-800">Paling Populer</span>}
                      {p.name}
                      <span className="text-primary block font-bold">{rupiah(p.price)}</span>
                      <span className="text-muted-foreground block text-xs font-normal">{p.days} hari</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((r) => (
                  <tr key={r.key} className="border-t">
                    <th scope="row" className="p-2 text-left font-medium">
                      {r.label}
                    </th>
                    {packages.map((p) => (
                      <td key={p.id} className="p-2 text-center">
                        {p.compare[r.key] === '✓' ? (
                          <>
                            <Check className="text-primary mx-auto size-4" aria-hidden />
                            <span className="sr-only">Termasuk</span>
                          </>
                        ) : p.compare[r.key] === '—' ? (
                          <>
                            <span aria-hidden>—</span>
                            <span className="sr-only">Tidak termasuk</span>
                          </>
                        ) : (
                          p.compare[r.key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t">
                  <th scope="row" className="p-2 text-left font-medium">
                    Pilih
                  </th>
                  {packages.map((p) => (
                    <td key={p.id} className="p-2 text-center">
                      <Button
                        size="sm"
                        variant={selected === p.id ? 'default' : 'outline'}
                        aria-label={`Pilih ${p.name}`}
                        aria-pressed={selected === p.id}
                        onClick={() => {
                          select(p.id)
                          setCompareOpen(false)
                        }}
                      >
                        {selected === p.id ? 'Dipilih' : 'Pilih'}
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  )
}
