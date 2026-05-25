'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { CardScanned } from '@/types/card'
import { CONDITION_LABELS } from '@/lib/conditions'
import EditCardModal from './EditCardModal'

export default function AdminTable({ initialCards }: { initialCards: CardScanned[] }) {
  const [cards, setCards] = useState<CardScanned[]>(initialCards)
  const [search, setSearch] = useState('')
  const [editCard, setEditCard] = useState<CardScanned | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = search
    ? cards.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.set_id.toLowerCase().includes(search.toLowerCase())
      )
    : cards

  function handleSaved(updated: CardScanned) {
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCards(prev => prev.filter(c => c.id !== id))
        setConfirmDelete(null)
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Search bar */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Filtrer par nom ou extension…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-poke-dark border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-poke-yellow/60 transition"
        />
        <span className="text-white/40 text-sm shrink-0">
          {filtered.length} / {cards.length} carte{cards.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-poke-navy/80">
              <th className="text-left px-4 py-3 text-white/50 font-medium w-10"></th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Carte</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Extension</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">État</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Prix USD</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Prix EUR</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Vitrine</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Scanné le</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-12 text-white/30">Aucun résultat</td>
              </tr>
            )}
            {filtered.map(card => {
              const cond = CONDITION_LABELS[card.condition as keyof typeof CONDITION_LABELS]
              const isConfirming = confirmDelete === card.id

              return (
                <tr key={card.id} className={`border-b border-white/5 transition ${isConfirming ? 'bg-red-500/10' : 'hover:bg-white/5'}`}>
                  {/* Thumbnail */}
                  <td className="px-4 py-2">
                    {card.image_url && (
                      <div className="relative w-8 h-11 rounded overflow-hidden bg-poke-dark shrink-0">
                        <Image src={card.image_url} alt={card.name} fill className="object-contain p-0.5" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{card.name}</td>
                  <td className="px-4 py-3 text-white/60">{card.set_id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cond?.badgeColor ?? 'bg-white/10 text-white/60'}`}>
                      {card.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/80">
                    {card.price_usd !== null ? `$${card.price_usd.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-white/80">
                    {card.price_eur !== null ? `€${card.price_eur.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${card.for_sale ? 'text-green-400' : 'text-white/30'}`}>
                      {card.for_sale ? '✓ Visible' : '— Masqué'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {new Date(card.scanned_at + (card.scanned_at.includes('Z') ? '' : 'Z')).toLocaleDateString('fr-FR')}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    {isConfirming ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(card.id)}
                          disabled={deleting}
                          className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition font-medium"
                        >
                          {deleting ? '…' : 'Suppr.'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs px-2 py-1 rounded bg-white/10 text-white/60 hover:bg-white/20 transition"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditCard(card)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-poke-yellow/20 hover:text-poke-yellow text-white/60 transition"
                          title="Modifier"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmDelete(card.id)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition"
                          title="Supprimer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editCard && (
        <EditCardModal
          card={editCard}
          onClose={() => setEditCard(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
