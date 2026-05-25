import PokeCard from './PokeCard'
import type { CardScanned } from '@/types/card'

interface CardGridProps {
  cards: CardScanned[]
}

export default function CardGrid({ cards }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white/30">
        <span className="text-6xl mb-4">◆</span>
        <p className="text-lg font-medium">Aucune carte scannée pour l&apos;instant</p>
        <p className="text-sm mt-1">Utilisez le formulaire ci-dessus pour scanner votre première carte</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <PokeCard key={card.id} card={card} />
      ))}
    </div>
  )
}
