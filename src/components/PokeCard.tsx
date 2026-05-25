'use client'

import Image from 'next/image'
import { useState } from 'react'
import PriceBadge from './PriceBadge'
import CardModal from './CardModal'
import { CONDITION_LABELS } from '@/lib/conditions'
import type { CardScanned } from '@/types/card'

interface PokeCardProps {
  card: CardScanned
}

export default function PokeCard({ card }: PokeCardProps) {
  const [hovered, setHovered] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const cond = CONDITION_LABELS[card.condition as keyof typeof CONDITION_LABELS]

  return (
    <>
      <article
        onClick={() => setShowModal(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-poke-navy shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-poke-yellow/20 hover:shadow-2xl cursor-pointer"
        title={`Voir les détails de ${card.name}`}
      >
        {/* Holographic shimmer overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            background:
              'linear-gradient(135deg, transparent 30%, rgba(255,203,5,0.25) 48%, rgba(238,21,21,0.15) 52%, transparent 70%)',
            backgroundSize: '200% 200%',
            animation: hovered ? 'shimmer 1.8s linear infinite' : 'none',
          }}
        />

        {/* Card image */}
        <div className="relative aspect-[2.5/3.5] w-full bg-poke-dark/50 overflow-hidden">
          {card.image_url ? (
            <Image
              src={card.image_url}
              alt={card.name}
              fill
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/20 text-4xl select-none">
              ◆
            </div>
          )}
        </div>

        {/* Card info */}
        <div className="relative z-20 p-3">
          <h3 className="font-bold text-white truncate text-sm">{card.name}</h3>
          <div className="flex items-center justify-between mt-0.5 gap-1">
            <span className="text-white/50 text-xs truncate">{card.set_id}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 font-semibold ${cond?.badgeColor ?? 'bg-white/10 text-white/60'}`}>
              {card.condition}
            </span>
          </div>
          <PriceBadge priceUSD={card.price_usd} priceEUR={card.price_eur} />
        </div>

        {/* "Voir détails" hint on hover */}
        <div className="absolute inset-0 z-30 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="text-xs bg-black/60 text-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
            Voir détails
          </span>
        </div>
      </article>

      {showModal && <CardModal card={card} onClose={() => setShowModal(false)} />}
    </>
  )
}
