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
import { findProduct, voucherCatalogue, type Voucher } from '@/lib/data'
import { useRewards } from '@/lib/rewards'
import { todayKey, usePersistentState } from '@/lib/storage'
import { cn } from '@/lib/utils'

export function RewardPage() {
  const { history, total, tier, nextTier, addPoints, redeem, ownedVouchers } = useRewards()
  const [lastCheckIn, setLastCheckIn] = usePersistentState<string | null>('sb:checkin', null)
  const claimed = lastCheckIn === todayKey()

  const claim = () => {
    setLastCheckIn(todayKey())
    addPoints('Klaim poin harian', 15)
    toast.success('+15 poin ditambahkan!')
  }

  return (
    <AppShell>
      <PageHeader title="Hadiah & Poin" back="/home" />
      <div className="space-y-6 p-4 lg:p-8">
        <Card className="gap-3 p-5 shadow-none">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total poinmu</p>
              <p className="mt-1 flex items-center gap-2">
                <Star className="text-primary size-6" aria-hidden />
                <span className="text-4xl font-extrabold">{total.toLocaleString('id-ID')}</span>
                <span className="text-muted-foreground">poin</span>
              </p>
            </div>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-900">Tingkat {tier.name}</span>
          </div>
          {nextTier ? (
            <>
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>
                  {(nextTier.min - total).toLocaleString('id-ID')} poin lagi menuju {nextTier.name}
                </span>
                <span className="font-semibold text-slate-900">{nextTier.min.toLocaleString('id-ID')} poin</span>
              </div>
              <Progress
                value={(total / nextTier.min) * 100}
                aria-label={`${total} dari ${nextTier.min} poin menuju tingkat ${nextTier.name}`}
                className="h-2 bg-slate-200 [&>div]:bg-violet-700"
              />
            </>
          ) : (
            <p className="text-sm font-semibold text-violet-900">Kamu sudah di tingkat tertinggi.</p>
          )}
        </Card>

        <Card className="flex-row items-center gap-3 p-4 shadow-none">
          <span className="text-primary grid size-12 place-items-center rounded-xl bg-emerald-50">
            <CalendarCheck className="size-6" aria-hidden />
          </span>
          <div className="flex-1">
            <h2 className="font-bold">Klaim Poin Harian</h2>
            <p className="text-muted-foreground text-xs">Dapatkan +15 poin setiap hari</p>
          </div>
          <Button className="rounded-full" disabled={claimed} onClick={claim}>
            {claimed ? 'Sudah diklaim' : '+15 Poin'}
          </Button>
        </Card>

        <section aria-labelledby="tukar" className="space-y-3">
          <h2 id="tukar" className="text-lg font-bold">
            Tukarkan Poin
          </h2>
          <ul className="space-y-3">
            {voucherCatalogue.map((v) => (
              <li key={v.id}>
                <VoucherOffer voucher={v} total={total} onRedeem={() => redeem(v)} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="voucher-saya" className="space-y-3">
          <h2 id="voucher-saya" className="text-lg font-bold">
            Voucher Saya
          </h2>
          {ownedVouchers.length === 0 ? (
            <p className="text-muted-foreground rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm">
              Voucher yang kamu tukar akan muncul di sini dan bisa langsung dipakai saat pembayaran paket.
            </p>
          ) : (
            <ul className="space-y-2">
              {ownedVouchers.map((o) => (
                <li key={o.uid}>
                  <Card className="flex-row items-center gap-3 border-emerald-300 p-4 shadow-none">
                    <Ticket className="text-primary size-6 shrink-0" aria-hidden />
                    <div className="flex-1">
                      <p className="font-semibold">{o.voucher.title}</p>
                      <p className="text-muted-foreground text-[13px]">{o.voucher.description}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link to={`/packages?selected=${o.voucher.appliesTo[0]}`} aria-label={`Pakai ${o.voucher.title}`}>
                        Pakai
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
            Cara Mendapatkan Poin
          </h2>
          <ul className="space-y-2">
            {[
              { icon: Stethoscope, label: 'Selesaikan konsultasi dokter', pts: '+100 poin' },
              { icon: Ticket, label: 'Beli paket', pts: '+50 poin' },
              { icon: CalendarCheck, label: 'Klaim poin harian', pts: '+15 poin' },
              { icon: UserPlus, label: 'Ajak teman', pts: '+500 poin (segera hadir)' },
            ].map(({ icon: Icon, label, pts }) => (
              <li key={label} className="flex items-center gap-3 rounded-xl border bg-white p-3">
                <Icon className="text-primary size-5" aria-hidden />
                <span className="flex-1 text-sm font-semibold">{label}</span>
                <span className="text-sm font-bold text-teal-800">{pts}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="riwayat-poin" className="space-y-2">
          <h2 id="riwayat-poin" className="text-lg font-bold">
            Riwayat Poin
          </h2>
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li key={i} className="flex items-center rounded-xl border bg-white p-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{h.label}</p>
                  <p className="text-muted-foreground text-xs">{h.time}</p>
                </div>
                <span className={cn('font-bold', h.points >= 0 ? 'text-teal-800' : 'text-slate-700')}>
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
  const soon = v.appliesTo.length === 0
  const short = v.cost - total
  const product = findProduct(v.appliesTo[0] ?? null)
  return (
    <Card className={cn('gap-3 p-4 shadow-none', soon && 'bg-slate-50')}>
      <div className="flex items-start gap-3">
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', soon ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-teal-800')}>
          {soon ? <Lock className="size-5" aria-hidden /> : <Ticket className="size-5" aria-hidden />}
        </span>
        <div className="flex-1">
          <p className="font-semibold">{v.title}</p>
          <p className="text-muted-foreground text-[13px]">{v.description}</p>
          <p className="mt-1 text-sm font-bold text-teal-800">{v.cost.toLocaleString('id-ID')} poin</p>
        </div>
        {soon ? (
          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800">Segera hadir</span>
        ) : short > 0 ? null : (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full" aria-label={`Tukar ${v.title}`}>
                Tukar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tukar {v.cost.toLocaleString('id-ID')} poin?</DialogTitle>
                <DialogDescription>
                  Kamu mendapat voucher {v.title}
                  {product ? ` untuk ${v.description.replace('Untuk ', '')}` : ''}. Poin yang sudah ditukar tidak bisa dikembalikan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Batal</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    onClick={() => {
                      if (onRedeem()) toast.success(`Voucher ${v.title} masuk ke Voucher Saya`)
                    }}
                  >
                    Ya, tukar
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
            aria-label={`${total} dari ${v.cost} poin untuk ${v.title}`}
            className="h-1.5 bg-slate-200 [&>div]:bg-teal-700"
          />
          <p className="text-muted-foreground text-xs">Kumpulkan {short.toLocaleString('id-ID')} poin lagi untuk menukar voucher ini.</p>
        </div>
      )}
    </Card>
  )
}
