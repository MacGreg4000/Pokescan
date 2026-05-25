import { getAdminStats, getScannedCards } from '@/lib/db'
import StatsBar from '@/components/StatsBar'
import AdminTable from '@/components/AdminTable'
import RefreshOnScan from '@/components/RefreshOnScan'
import HowToScan from '@/components/HowToScan'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const stats = getAdminStats()
  const { cards } = getScannedCards({ page: 1, limit: 1000 })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard Admin</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Gérez votre collection — {stats.total_scanned} carte{stats.total_scanned !== 1 ? 's' : ''} scannée{stats.total_scanned !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Scanner */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-poke-yellow">+</span> Ajouter des cartes
        </h2>
        <RefreshOnScan />
        <HowToScan />
      </section>

      {/* Gestion */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-poke-yellow">≡</span> Gérer la collection
        </h2>
        <AdminTable initialCards={cards} />
      </section>
    </div>
  )
}
