import { Link } from 'react-router-dom'
import { CalendarCheck, Lock, Star, Stethoscope, Ticket, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
import { AppShell, PageHeader } from '@/components/layout'
import { voucherCatalogue, type Voucher } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { useRewards } from '@/lib/rewards'
import { todayKey, usePersistentState } from '@/lib/storage'
import { cn } from '@/lib/utils'

export function RewardPage() {
  const { t, tr, locale, date } = useI18n()
  const { history, total, tier, nextTier, addPoints, redeem, ownedVouchers } = useRewards()
  const [lastCheckIn, setLastCheckIn] = usePersistentState<string | null>('sb:checkin', null)
  const claimed = lastCheckIn === todayKey()
  const n = (v: number) => v.toLocaleString(locale)

  const claim = () => {
    setLastCheckIn(todayKey())
    addPoints({ id: 'Klaim poin harian', en: 'Daily points claimed' }, 15)
    toast.success(t('+15 poin ditambahkan!', '+15 points added!'))
  }

  return (
    <AppShell>
      <PageHeader title={t('Hadiah & Poin', 'Rewards & Points')} back="/home" />
      <div className="space-y-6 p-4 lg:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="gap-3 p-4 shadow-none min-[360px]:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-muted-foreground text-sm">{t('Total poinmu', 'Your points')}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2">
                  <Star className="text-primary size-6" aria-hidden />
                  <span className="text-4xl font-extrabold">{n(total)}</span>
                  <span className="text-muted-foreground">{t('poin', 'points')}</span>
                </p>
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-900">{t(`Tingkat ${tr(tier.name)}`, `${tr(tier.name)} tier`)}</span>
            </div>
            {nextTier ? (
              <>
                <div className="text-muted-foreground flex flex-wrap justify-between gap-x-2 text-xs">
                  <span>{t(`${n(nextTier.min - total)} poin lagi menuju ${tr(nextTier.name)}`, `${n(nextTier.min - total)} more points to ${tr(nextTier.name)}`)}</span>
                  <span className="font-semibold text-slate-900">{t(`${n(nextTier.min)} poin`, `${n(nextTier.min)} points`)}</span>
                </div>
                <Progress
                  value={(total / nextTier.min) * 100}
                  aria-label={t(`${total} dari ${nextTier.min} poin menuju tingkat ${tr(nextTier.name)}`, `${total} of ${nextTier.min} points towards ${tr(nextTier.name)} tier`)}
                  className="h-2 bg-slate-200 [&>div]:bg-violet-700"
                />
              </>
            ) : (
              <p className="text-sm font-semibold text-violet-900">{t('Kamu sudah di tingkat tertinggi.', 'You’re at the highest tier.')}</p>
            )}
          </Card>

          <Card className="flex-row flex-wrap items-center gap-3 p-4 shadow-none">
            <span className="text-primary grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50">
              <CalendarCheck className="size-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 basis-32">
              <h2 className="font-bold">{t('Klaim Poin Harian', 'Daily Points')}</h2>
              <p className="text-muted-foreground text-xs">{t('Dapatkan +15 poin setiap hari', 'Get +15 points every day')}</p>
            </div>
            <Button className="rounded-full" disabled={claimed} onClick={claim}>
              {claimed ? t('Sudah diklaim', 'Claimed') : t('+15 Poin', '+15 Points')}
            </Button>
          </Card>
        </div>

        <section aria-labelledby="tukar" className="space-y-3">
          <h2 id="tukar" className="text-lg font-bold">
            {t('Tukarkan Poin', 'Redeem Points')}
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {voucherCatalogue.map((v) => (
              <li key={v.id}>
                <VoucherOffer voucher={v} total={total} onRedeem={() => redeem(v)} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="voucher-saya" className="space-y-3">
          <h2 id="voucher-saya" className="text-lg font-bold">
            {t('Voucher Saya', 'My Vouchers')}
          </h2>
          {ownedVouchers.length === 0 ? (
            <p className="text-muted-foreground rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm">
              {t(
                'Voucher yang kamu tukar akan muncul di sini dan bisa langsung dipakai saat pembayaran paket.',
                'Vouchers you redeem appear here and can be used straight away when paying for a plan.',
              )}
            </p>
          ) : (
            <ul className="grid gap-2 md:grid-cols-2">
              {ownedVouchers.map((o) => (
                <li key={o.uid}>
                  <Card className="flex-row flex-wrap items-center gap-3 border-emerald-300 p-4 shadow-none">
                    <Ticket className="text-primary size-6 shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1 basis-32">
                      <p className="font-semibold">{tr(o.voucher.title)}</p>
                      <p className="text-muted-foreground text-[13px]">{tr(o.voucher.description)}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link to={`/packages?selected=${o.voucher.appliesTo[0]}`} aria-label={t(`Pakai ${tr(o.voucher.title)}`, `Use ${tr(o.voucher.title)}`)}>
                        {t('Pakai', 'Use')}
                      </Link>
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="cara" className="space-y-2">
          <h2 id="cara" className="text-lg font-bold">
            {t('Cara Mendapatkan Poin', 'How to Earn Points')}
          </h2>
          <ul className="grid gap-2 md:grid-cols-2">
            {[
              { icon: Stethoscope, label: t('Selesaikan konsultasi dokter', 'Complete a doctor consultation'), pts: t('+100 poin', '+100 points') },
              { icon: Ticket, label: t('Beli paket', 'Buy a plan'), pts: t('+50 poin', '+50 points') },
              { icon: CalendarCheck, label: t('Klaim poin harian', 'Claim daily points'), pts: t('+15 poin', '+15 points') },
              { icon: UserPlus, label: t('Ajak teman', 'Invite a friend'), pts: t('+500 poin (segera hadir)', '+500 points (coming soon)') },
            ].map(({ icon: Icon, label, pts }) => (
              <li key={label} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border bg-white p-3">
                <Icon className="text-primary size-5 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 text-sm font-semibold">{label}</span>
                <span className="text-sm font-bold text-teal-800">{pts}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="riwayat-poin" className="space-y-2">
          <h2 id="riwayat-poin" className="text-lg font-bold">
            {t('Riwayat Poin', 'Points History')}
          </h2>
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl border bg-white p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{tr(h.label)}</p>
                  <p className="text-muted-foreground text-xs">{date(h.at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={cn('shrink-0 font-bold', h.points >= 0 ? 'text-teal-800' : 'text-slate-700')}>
                  {h.points >= 0 ? `+${h.points}` : `−${Math.abs(h.points)}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  )
}

function VoucherOffer({ voucher: v, total, onRedeem }: { voucher: Voucher; total: number; onRedeem: () => boolean }) {
  const { t, tr, locale } = useI18n()
  const soon = v.appliesTo.length === 0
  const short = v.cost - total
  const cost = v.cost.toLocaleString(locale)
  return (
    <Card className={cn('h-full gap-3 p-4 shadow-none', soon && 'bg-slate-50')}>
      <div className="flex flex-wrap items-start gap-3">
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', soon ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-teal-800')}>
          {soon ? <Lock className="size-5" aria-hidden /> : <Ticket className="size-5" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1 basis-36">
          <p className="font-semibold">{tr(v.title)}</p>
          <p className="text-muted-foreground text-[13px]">{tr(v.description)}</p>
          <p className="mt-1 text-sm font-bold text-teal-800">{t(`${cost} poin`, `${cost} points`)}</p>
        </div>
        {soon ? (
          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800">{t('Segera hadir', 'Coming soon')}</span>
        ) : short > 0 ? null : (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full" aria-label={t(`Tukar ${tr(v.title)}`, `Redeem ${tr(v.title)}`)}>
                {t('Tukar', 'Redeem')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="pr-10">
                <DialogTitle>{t(`Tukar ${cost} poin?`, `Redeem ${cost} points?`)}</DialogTitle>
                <DialogDescription>
                  {t(
                    `Kamu mendapat voucher ${tr(v.title)} (${tr(v.description).toLowerCase()}). Poin yang sudah ditukar tidak bisa dikembalikan.`,
                    `You’ll get a ${tr(v.title)} voucher (${tr(v.description).toLowerCase()}). Redeemed points can’t be returned.`,
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{t('Batal', 'Cancel')}</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    onClick={() => {
                      if (onRedeem()) toast.success(t(`Voucher ${tr(v.title)} masuk ke Voucher Saya`, `${tr(v.title)} voucher added to My Vouchers`))
                    }}
                  >
                    {t('Ya, tukar', 'Yes, redeem')}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {short > 0 && (
        <div className="space-y-1">
          <Progress
            value={(total / v.cost) * 100}
            aria-label={t(`${total} dari ${v.cost} poin untuk ${tr(v.title)}`, `${total} of ${v.cost} points for ${tr(v.title)}`)}
            className="h-1.5 bg-slate-200 [&>div]:bg-teal-700"
          />
          <p className="text-muted-foreground text-xs">
            {t(`Kumpulkan ${short.toLocaleString(locale)} poin lagi untuk menukar voucher ini.`, `Collect ${short.toLocaleString(locale)} more points to redeem this voucher.`)}
          </p>
        </div>
      )}
    </Card>
  )
}
