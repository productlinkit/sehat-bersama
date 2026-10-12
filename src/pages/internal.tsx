import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppShell, PageHeader } from '@/components/layout'
import { funnelCounts, resetFunnel } from '@/lib/analytics'
import { useI18n } from '@/lib/i18n'

/** Internal: package-select → payment funnel from locally tracked events. */
export function FunnelPage() {
  const { t, tr } = useI18n()
  const [steps, setSteps] = useState(funnelCounts)
  const first = steps[0]?.count || 0
  return (
    <AppShell nav={false}>
      <PageHeader title={t('Funnel Konversi (internal)', 'Conversion Funnel (internal)')} subtitle={t('Data peristiwa di perangkat ini', 'Events recorded on this device')} back="/home" />
      <div className="space-y-4 p-4 lg:p-8">
        <Card className="overflow-x-auto p-4 shadow-none min-[360px]:p-5">
          <table className="w-full text-sm">
            <caption className="sr-only">{t('Jumlah pengguna per langkah funnel', 'Count per funnel step')}</caption>
            <thead>
              <tr className="text-left">
                <th scope="col" className="py-2 pr-2">{t('Langkah', 'Step')}</th>
                <th scope="col" className="py-2 pr-2 text-right">{t('Jumlah', 'Count')}</th>
                <th scope="col" className="py-2 text-right">{t('Dari langkah pertama', 'Of first step')}</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s) => (
                <tr key={s.event} className="border-t">
                  <th scope="row" className="py-2 pr-2 text-left font-medium">{tr(s.label)}</th>
                  <td className="py-2 text-right">{s.count}</td>
                  <td className="py-2 text-right">{first ? `${Math.round((s.count / first) * 100)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Button
          variant="outline"
          onClick={() => {
            resetFunnel()
            setSteps(funnelCounts())
          }}
        >
          {t('Atur ulang data', 'Reset data')}
        </Button>
      </div>
    </AppShell>
  )
}
