import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppShell, PageHeader } from '@/components/layout'
import { funnelCounts, resetFunnel } from '@/lib/analytics'

/** Internal: package-select → payment funnel from locally tracked events. */
export function FunnelPage() {
  const [steps, setSteps] = useState(funnelCounts)
  const first = steps[0]?.count || 0
  return (
    <AppShell nav={false}>
      <PageHeader title="Funnel Konversi (internal)" subtitle="Data peristiwa di perangkat ini" back="/home" />
      <div className="space-y-4 p-4 lg:p-8">
        <Card className="p-5 shadow-none">
          <table className="w-full text-sm">
            <caption className="sr-only">Jumlah pengguna per langkah funnel</caption>
            <thead>
              <tr className="text-left">
                <th scope="col" className="py-2">Langkah</th>
                <th scope="col" className="py-2 text-right">Jumlah</th>
                <th scope="col" className="py-2 text-right">Dari langkah pertama</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s) => (
                <tr key={s.event} className="border-t">
                  <th scope="row" className="py-2 text-left font-medium">{s.label}</th>
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
          Atur ulang data
        </Button>
      </div>
    </AppShell>
  )
}
