import { getScannedCards } from '@/lib/db'
import CardGrid from '@/components/CardGrid'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  // Vitrine publique : uniquement les cartes marquées "en vente"
  const { cards, total } = getScannedCards({ page: 1, limit: 120, forSale: true })

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 px-4">
        {/* Fond décoratif */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-poke-red/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-poke-yellow/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-poke-yellow/10 border border-poke-yellow/20 text-poke-yellow text-xs font-semibold px-3 py-1.5 rounded-full">
            ✦ Collection Pokémon TCG
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-none">
            <span className="text-poke-yellow">Poké</span>
            <span className="text-white">Scan</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Collection de cartes Pokémon TCG — prix basés sur les marchés réels TCGPlayer & Cardmarket
          </p>
          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{total}</p>
              <p className="text-white/40 text-xs">carte{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Collection ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {cards.length === 0 ? (
          <div className="text-center py-24 text-white/30 space-y-3">
            <div className="text-6xl">◆</div>
            <p className="text-lg font-medium">Aucune carte disponible pour le moment</p>
            <p className="text-sm">Revenez bientôt !</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                Toute la collection
              </h2>
              <span className="text-white/30 text-sm">{total} carte{total !== 1 ? 's' : ''}</span>
            </div>
            <CardGrid cards={cards} />
          </>
        )}
      </section>

      {/* ── Contact ───────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 py-12 px-4">
        <div className="max-w-xl mx-auto text-center space-y-3">
          <p className="text-white/50 text-sm">
            Intéressé par une carte ? Contactez-nous pour négocier et organiser l'envoi.
          </p>
          <a
            href="mailto:contact@pokescan.fr"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-poke-yellow text-black font-bold text-sm rounded-xl hover:bg-yellow-400 transition"
          >
            ✉ Nous contacter
          </a>
        </div>
      </section>
    </div>
  )
}
