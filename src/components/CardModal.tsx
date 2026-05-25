'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import type { CardScanned } from '@/types/card'
import { CONDITION_LABELS } from '@/lib/conditions'

interface CardModalProps {
  card: CardScanned
  onClose: () => void
}

export default function CardModal({ card, onClose }: CardModalProps) {
  // Fermer avec Échap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const cond = CONDITION_LABELS[card.condition as keyof typeof CONDITION_LABELS]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-poke-navy border border-white/15 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/70 hover:text-white transition text-lg leading-none"
          aria-label="Fermer"
        >
          ×
        </button>

        {/* Image de la carte */}
        <div className="relative bg-gradient-to-b from-poke-dark via-poke-dark to-poke-navy h-52 flex items-center justify-center overflow-hidden">
          {card.image_url ? (
            <Image
              src={card.image_url}
              alt={card.name}
              fill
              className="object-contain p-3"
              sizes="384px"
            />
          ) : (
            <span className="text-white/10 text-7xl select-none">◆</span>
          )}
        </div>

        {/* Contenu */}
        <div className="p-5 space-y-4">
          {/* Nom + extension */}
          <div>
            <h2 className="text-2xl font-black text-white leading-tight">{card.name}</h2>
            <p className="text-white/40 text-sm mt-0.5">{card.set_id}</p>
          </div>

          {/* État de la carte */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cond?.badgeColor ?? 'bg-white/10 text-white/60'}`}>
              {card.condition}
            </span>
            {cond && (
              <span className="text-white/60 text-sm">
                {cond.en} — <span className="text-white/80 font-medium">{cond.fr}</span>
              </span>
            )}
          </div>

          {/* Séparateur */}
          <div className="border-t border-white/10" />

          {/* Prix */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Prix du marché</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-white/40 mb-1">🇺🇸 TCGPlayer</p>
                <p className="text-xl font-black text-white">
                  {card.price_usd !== null ? `$${card.price_usd.toFixed(2)}` : '—'}
                </p>
                <p className="text-white/30 text-xs mt-0.5">Marché américain</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-white/40 mb-1">🇪🇺 Cardmarket</p>
                <p className="text-xl font-black text-white">
                  {card.price_eur !== null ? `€${card.price_eur.toFixed(2)}` : '—'}
                </p>
                <p className="text-white/30 text-xs mt-0.5">Marché européen</p>
              </div>
            </div>
            <p className="text-white/25 text-xs leading-relaxed">
              ℹ️ TCGPlayer (USD) et Cardmarket (EUR) sont deux marchés indépendants avec des acheteurs et des vendeurs différents — un écart de prix entre les deux est tout à fait normal.
            </p>
          </div>

          {/* Source & confiance */}
          {(card.source || card.confidence) && (
            <div className="flex items-center justify-between text-xs">
              {card.source && <span className="text-white/25">{card.source}</span>}
              {card.confidence && (
                <span className={`px-2 py-0.5 rounded-full font-medium ${
                  card.confidence === 'high'   ? 'bg-green-500/20 text-green-400' :
                  card.confidence === 'medium' ? 'bg-poke-yellow/20 text-poke-yellow' :
                                                 'bg-white/10 text-white/40'
                }`}>
                  Confiance : {card.confidence}
                </span>
              )}
            </div>
          )}

          {/* Notes */}
          {card.notes && (
            <p className="text-white/35 text-xs italic border-t border-white/10 pt-3">
              {card.notes}
            </p>
          )}

          {/* Date */}
          <p className="text-white/20 text-xs">
            Scanné le {new Date(card.scanned_at + (card.scanned_at.includes('Z') ? '' : 'Z')).toLocaleString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  )
}
