import { ChevronRight, Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { doctors } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const online = doctors.filter((d) => d.online)

export function OnlineDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex size-2.5', className)} aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />
      <span className="relative inline-flex size-2.5 rounded-full bg-emerald-600" />
    </span>
  )
}

export function DoctorList() {
  const { tr, t } = useI18n()
  return (
    <ul className="space-y-2">
      {doctors.map((d) => (
        <li key={d.name} className="flex items-center gap-3 rounded-xl border bg-white p-3">
          <Avatar className="size-11">
            <AvatarFallback className="bg-emerald-100 font-semibold text-teal-800">{d.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{d.name}</p>
            <p className="text-muted-foreground text-sm">
              {tr(d.specialty)} · {t(`${d.years} th pengalaman`, `${d.years} yrs experience`)} ·{' '}
              <Star className="inline size-3.5 fill-amber-400 text-amber-500" aria-hidden />
              <span className="sr-only">{t('penilaian', 'rating')}</span> {d.rating}
            </p>
          </div>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              d.online ? 'bg-emerald-100 text-teal-800' : 'bg-slate-100 text-slate-700',
            )}
          >
            {d.online ? t('Aktif', 'Available') : t('Tidak aktif', 'Away')}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** "Dokter online sekarang" indicator that opens a bottom-sheet doctor preview. */
export function DoctorsOnline({ className }: { className?: string }) {
  const { t } = useI18n()
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn('flex w-full flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-left min-[360px]:flex-nowrap', className)}
        >
          <span className="flex -space-x-2" aria-hidden>
            {online.slice(0, 3).map((d) => (
              <span key={d.name} className="grid size-9 place-items-center rounded-full border-2 border-white bg-white text-xs font-bold text-teal-800">
                {d.initials}
              </span>
            ))}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-semibold text-teal-900">
              <OnlineDot /> {t(`${online.length} dokter siap sekarang`, `${online.length} doctors available now`)}
            </span>
            <span className="text-muted-foreground block text-sm">{t('Rata-rata dokter membalas dalam 3 menit', 'Doctors reply in about 3 minutes')}</span>
          </span>
          <ChevronRight className="size-5 text-teal-800" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-h-[85dvh] max-w-md overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>{t('Dokter yang siap melayani', 'Doctors ready to help')}</SheetTitle>
          <SheetDescription>{t('Dokter umum dan dokter anak berizin STR. Status diperbarui setiap menit.', 'Licensed general practitioners and paediatricians. Status updates every minute.')}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <DoctorList />
        </div>
      </SheetContent>
    </Sheet>
  )
}
