import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, Columns3, Sparkles } from 'lucide-react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DoctorsOnline } from '@/components/doctors'
import { AppShell, IconBadge, PageHeader, TextSizeButton } from '@/components/layout'
import { track } from '@/lib/analytics'
import { AI_COPILOT_EXPLAINER, compareRows, legaPass, packages, recommendationFor, rupiah, type Package } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

function SelectedMark({ selected }: { selected: boolean }) {
  const { t } = useI18n()
  return selected ? (
    <span className="bg-primary inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white">
      <Check className="size-3.5" aria-hidden /> {t('Dipilih', 'Selected')}
    </span>
  ) : (
    <span className="size-6 shrink-0 rounded-full border-2 border-[#848ea0] bg-white" aria-hidden />
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
  const { t, tr, lang } = useI18n()
  const price = rupiah(pkg.price, lang)
  const days = t(`${pkg.days} hari`, pkg.days === 1 ? '1 day' : `${pkg.days} days`)
  const perDay = pkg.days > 1 ? t(`≈ ${rupiah(pkg.price / pkg.days, lang)}/hari`, `≈ ${rupiah(pkg.price / pkg.days, lang)}/day`) : t('per hari', 'per day')
  return (
    <div className={cn('relative rounded-2xl border-2 bg-white transition', selected ? 'border-primary bg-emerald-50 shadow-md' : 'border-slate-200')}>
      {(pkg.popular || recommended) && (
        <div className="absolute -top-3 right-4 left-4 flex flex-wrap gap-1.5">
          {recommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-700 px-2.5 py-0.5 text-xs font-bold text-white">
              <Sparkles className="size-3" aria-hidden /> {t('Rekomendasi untukmu', 'Recommended for you')}
            </span>
          )}
          {pkg.popular && <span className="rounded-full bg-teal-800 px-2.5 py-0.5 text-xs font-bold text-white">{t('Paling Populer', 'Most Popular')}</span>}
        </div>
      )}
      <RadioGroupPrimitive.Item
        value={pkg.id}
        aria-label={`${pkg.name}, ${price} ${t('untuk', 'for')} ${days}${pkg.popular ? t(', paling populer', ', most popular') : ''}${recommended ? t(', rekomendasi untukmu', ', recommended for you') : ''}`}
        className="flex w-full gap-3 rounded-2xl p-3 pt-5 text-left min-[360px]:gap-4 min-[360px]:p-4 min-[360px]:pt-5"
      >
        <IconBadge icon={pkg.icon} tone={pkg.tone} className="size-12 rounded-2xl min-[360px]:size-16" />
        <span className="min-w-0 flex-1 space-y-2">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block text-base font-bold">{pkg.name}</span>
              <span className="text-muted-foreground block text-[13px]">
                {days} · {t('1 nomor HP', '1 phone number')}
              </span>
            </span>
            <SelectedMark selected={selected} />
          </span>
          <span className="block">
            <span className="text-primary text-xl font-extrabold">{price}</span> <span className="text-muted-foreground text-[13px]">{perDay}</span>
          </span>
          <span className="block space-y-1">
            {pkg.features.map((f) => (
              <span key={f.id} className="flex items-start gap-2 text-sm">
                <Check className="text-primary mt-0.5 size-4 shrink-0" aria-hidden /> <span className="min-w-0">{tr(f)}</span>
              </span>
            ))}
          </span>
        </span>
      </RadioGroupPrimitive.Item>
      <div className="px-3 pb-3 text-right min-[360px]:px-4">
        <Button type="button" variant="link" className="h-auto min-h-6 p-1 text-sm whitespace-normal" onClick={(e) => onDetails(e.currentTarget)}>
          {t(`Lihat detail ${pkg.name}`, `See ${pkg.name} details`)}
        </Button>
      </div>
    </div>
  )
}

export function PackagesPage() {
  const { t, tr, lang } = useI18n()
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
      <PageHeader title={t('Pilih Paket', 'Choose a Plan')} subtitle={t('Bayar sekali, pakai selama masa aktif.', 'Pay once, use it for the whole period.')} back right={<TextSizeButton />} />
      <div className="space-y-5 p-4 lg:p-8">
        {rec && (
          <div className="flex gap-3 rounded-2xl border border-violet-300 bg-violet-50 p-4" role="note">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-violet-700" aria-hidden />
            <p className="min-w-0 text-sm text-violet-950">
              <b>{t('Rekomendasi untukmu:', 'Recommended for you:')}</b> {tr(rec.reason)}{' '}
              {t('Paketnya sudah kami pilihkan, kamu tetap bisa ganti.', 'We’ve selected it for you; you can still change it.')}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">{t(`${packages.length + 1} pilihan paket`, `${packages.length + 1} plan options`)}</h2>
          <Button ref={compareTrigger} variant="outline" className="rounded-full" onClick={() => setCompareOpen(true)}>
            <Columns3 aria-hidden /> {t('Bandingkan paket', 'Compare plans')}
          </Button>
        </div>

        <RadioGroupPrimitive.Root value={selected} onValueChange={select} aria-label={t('Pilih paket', 'Choose a plan')} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
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

          <div className={cn('rounded-2xl border-2 bg-violet-50 p-3 min-[360px]:p-4', legaSelected ? 'border-violet-700 shadow-md' : 'border-violet-200')}>
            <div className="flex items-start gap-3 min-[360px]:gap-4">
              <IconBadge icon={LegaIcon} tone="violet" className="size-12 rounded-2xl bg-white min-[360px]:size-16" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold" id="lega-pass">
                  Lega Pass
                </p>
                <p className="text-muted-foreground text-[13px]">{t('Akses Lega, teman cerita AI, sesuai durasi pilihanmu.', 'Access to Lega, your AI companion, for the length you choose.')}</p>
                <ul className="mt-2 space-y-1">
                  {legaPass.features.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 shrink-0 text-violet-700" aria-hidden /> {tr(f)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* auto-fit: options wrap to a new row instead of overflowing on narrow screens / large text */}
            <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(6.25rem,1fr))] gap-2" role="group" aria-labelledby="lega-pass">
              {legaPass.options.map((o) => (
                <RadioGroupPrimitive.Item
                  key={o.id}
                  value={o.id}
                  aria-label={`${tr(o.name)}, ${rupiah(o.price, lang)}${rec?.id === o.id ? t(', rekomendasi untukmu', ', recommended for you') : ''}`}
                  className={cn('relative rounded-xl border-2 bg-white px-2.5 py-2 text-left', selected === o.id ? 'border-violet-700 bg-violet-100' : 'border-violet-200')}
                >
                  {selected === o.id && <Check className="absolute top-2 right-2 size-4 text-violet-800" aria-hidden />}
                  <span className="block text-xs text-violet-900">{tr(o.label)}</span>
                  <span className="block text-sm font-bold whitespace-nowrap text-violet-900">{rupiah(o.price, lang)}</span>
                  {rec?.id === o.id && <span className="block text-xs font-semibold text-violet-800">{t('Rekomendasi', 'Recommended')}</span>}
                </RadioGroupPrimitive.Item>
              ))}
            </div>
          </div>
        </RadioGroupPrimitive.Root>

        <div className="grid gap-3 md:grid-cols-2">
          <DoctorsOnline />
          <details className="group rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between gap-2 font-semibold">
              {t('Apa itu AI Co-Pilot?', 'What is AI Co-Pilot?')}
              <ChevronDown className="size-5 shrink-0 transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-2 text-sm">{tr(AI_COPILOT_EXPLAINER)}</p>
          </details>
        </div>
      </div>

      <div className="sticky bottom-0 z-30 border-t bg-white p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <Button disabled={!selected} className="h-auto min-h-12 w-full rounded-full text-base font-semibold whitespace-normal" onClick={() => navigate(`/checkout?pkg=${selected}`)}>
          {selected ? t('Lanjut ke Pembayaran', 'Continue to payment') : t('Pilih paket dulu', 'Choose a plan first')} <ArrowRight aria-hidden />
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
              <SheetHeader className="pr-14">
                <SheetTitle>{details.name}</SheetTitle>
                <SheetDescription>
                  {t(
                    `${rupiah(details.price, lang)} · aktif ${details.days} hari sejak pembayaran · berlaku untuk 1 nomor HP`,
                    `${rupiah(details.price, lang)} · active for ${details.days} ${details.days === 1 ? 'day' : 'days'} from payment · for 1 phone number`,
                  )}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <ul className="space-y-2">
                  {details.features.map((f) => (
                    <li key={f.id} className="flex items-start gap-2">
                      <Check className="text-primary mt-0.5 size-5 shrink-0" aria-hidden /> {tr(f)}
                    </li>
                  ))}
                </ul>
                <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{tr(AI_COPILOT_EXPLAINER)}</p>
                <p className="text-muted-foreground text-sm">
                  {t('Kuota yang tidak terpakai hangus saat masa aktif berakhir. Pembayaran tidak dapat dikembalikan.', 'Unused quota expires at the end of the period. Payments are non-refundable.')}
                </p>
              </div>
              <SheetFooter>
                <Button
                  className="h-auto min-h-12 rounded-full whitespace-normal"
                  onClick={() => {
                    select(details.id)
                    setDetails(null)
                  }}
                >
                  {t(`Pilih ${details.name}`, `Choose ${details.name}`)}
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
          <SheetHeader className="pr-14">
            <SheetTitle>{t('Bandingkan paket', 'Compare plans')}</SheetTitle>
            <SheetDescription>{t('Geser ke samping untuk melihat semua paket.', 'Scroll sideways to see every plan.')}</SheetDescription>
          </SheetHeader>
          <div className="overflow-x-auto px-4 pb-6" tabIndex={0} role="region" aria-label={t('Tabel perbandingan paket', 'Plan comparison table')}>
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">{t('Perbandingan isi paket Sehat Bersama', 'What each Sehat Bersama plan includes')}</caption>
              <thead>
                <tr>
                  <th scope="col" className="p-2 text-left">
                    {t('Fitur', 'Feature')}
                  </th>
                  {packages.map((p) => (
                    <th key={p.id} scope="col" className="p-2 text-center align-bottom">
                      {p.popular && <span className="mb-1 block text-xs font-bold text-teal-800">{t('Paling Populer', 'Most Popular')}</span>}
                      {p.name}
                      <span className="text-primary block font-bold">{rupiah(p.price, lang)}</span>
                      <span className="text-muted-foreground block text-xs font-normal">{t(`${p.days} hari`, p.days === 1 ? '1 day' : `${p.days} days`)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((r) => (
                  <tr key={r.key} className="border-t">
                    <th scope="row" className="p-2 text-left font-medium">
                      {tr(r.label)}
                    </th>
                    {packages.map((p) => (
                      <td key={p.id} className="p-2 text-center">
                        {p.compare[r.key] === '✓' ? (
                          <>
                            <Check className="text-primary mx-auto size-4" aria-hidden />
                            <span className="sr-only">{t('Termasuk', 'Included')}</span>
                          </>
                        ) : p.compare[r.key] === '—' ? (
                          <>
                            <span aria-hidden>—</span>
                            <span className="sr-only">{t('Tidak termasuk', 'Not included')}</span>
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
                    {t('Pilih', 'Choose')}
                  </th>
                  {packages.map((p) => (
                    <td key={p.id} className="p-2 text-center">
                      <Button
                        size="sm"
                        variant={selected === p.id ? 'default' : 'outline'}
                        aria-label={t(`Pilih ${p.name}`, `Choose ${p.name}`)}
                        aria-pressed={selected === p.id}
                        onClick={() => {
                          select(p.id)
                          setCompareOpen(false)
                        }}
                      >
                        {selected === p.id ? t('Dipilih', 'Selected') : t('Pilih', 'Choose')}
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
