import { pointHistory, tiers, voucherCatalogue, type Voucher } from './data'
import { usePersistentState } from './storage'

export interface PointEntry {
  label: string
  time: string
  points: number
}

export interface OwnedVoucher {
  uid: string
  voucherId: string
}

const stamp = () => new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

/** Points, tiers and redeemed vouchers (mock; persisted in localStorage). */
export function useRewards() {
  const [history, setHistory] = usePersistentState<PointEntry[]>('sb:points-v2', pointHistory)
  const [owned, setOwned] = usePersistentState<OwnedVoucher[]>('sb:vouchers', [])

  const total = history.reduce((sum, h) => sum + h.points, 0)
  const tier = [...tiers].reverse().find((t) => total >= t.min)!
  const nextTier = tiers.find((t) => t.min > total)

  const addPoints = (label: string, points: number) => setHistory((h) => [{ label, time: stamp(), points }, ...h])

  const redeem = (v: Voucher) => {
    if (total < v.cost || v.appliesTo.length === 0) return false
    addPoints(`Tukar voucher ${v.title}`, -v.cost)
    setOwned((o) => [...o, { uid: crypto.randomUUID(), voucherId: v.id }])
    return true
  }

  const consume = (uid: string) => setOwned((o) => o.filter((x) => x.uid !== uid))

  const ownedVouchers = owned
    .map((o) => ({ ...o, voucher: voucherCatalogue.find((v) => v.id === o.voucherId)! }))
    .filter((o) => o.voucher)

  return { history, total, tier, nextTier, addPoints, redeem, consume, ownedVouchers }
}

/** Last payment method used, so checkout can pre-select it (QRIS by default). */
export function useLastPaymentMethod() {
  return usePersistentState<string>('sb:last-method', 'qris')
}
