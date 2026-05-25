import type { AdminStats } from '@/types/card'

interface StatTileProps {
  label: string
  value: string
  icon: string
}

function StatTile({ label, value, icon }: StatTileProps) {
  return (
    <div className="bg-poke-navy/60 border border-white/10 rounded-xl p-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-white/50 text-xs font-medium">{label}</p>
        <p className="text-white font-bold text-lg">{value}</p>
      </div>
    </div>
  )
}

export default function StatsBar({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatTile
        icon="🃏"
        label="Cartes scannées"
        value={stats.total_scanned.toString()}
      />
      <StatTile
        icon="💵"
        label="Prix moyen (USD)"
        value={stats.avg_price_usd !== null ? `$${stats.avg_price_usd.toFixed(2)}` : '—'}
      />
      <StatTile
        icon="💶"
        label="Prix moyen (EUR)"
        value={stats.avg_price_eur !== null ? `€${stats.avg_price_eur.toFixed(2)}` : '—'}
      />
      <StatTile
        icon="📦"
        label="Extensions"
        value={stats.sets_count.toString()}
      />
    </div>
  )
}
