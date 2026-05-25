'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { CardScanned } from '@/types/card'
import { CONDITION_LABELS, CONDITIONS, type Condition } from '@/lib/conditions'

interface EditCardModalProps {
  card: CardScanned
  onClose: () => void
  onSaved: (updated: CardScanned) => void
}

export default function EditCardModal({ card, onClose, onSaved }: EditCardModalProps) {
  const [condition, setCondition] = useState<Condition>(card.condition as Condition)
  const [notes, setNotes] = useState(card.notes ?? '')
  const [forSale, setForSale] = useState(card.for_sale === 1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          condition,
          notes: notes.trim() || null,
          for_sale: forSale ? 1 : 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erreur'); return }
      onSaved(data as CardScanned)
      onClose()
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-poke-navy border border-white/15 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/70 hover:text-white transition text-lg leading-none"
        >×</button>

        {/* Header */}
        <div className="flex gap-3 items-center p-5 border-b border-white/10">
          {card.image_url && (
            <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-poke-dark">
              <Image src={card.image_url} alt={card.name} fill className="object-contain p-1" />
            </div>
          )}
          <div>
            <h2 className="font-bold text-white text-lg leading-tight">{card.name}</h2>
            <p className="text-white/40 text-sm">{card.set_id}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="p-5 space-y-4">
          {/* Condition */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">État de la carte</label>
            <select
              value={condition}
              onChange={e => setCondition(e.target.value as Condition)}
              className="w-full bg-poke-dark border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-poke-yellow/60 transition"
            >
              {CONDITIONS.map(c => {
                const lbl = CONDITION_LABELS[c]
                return <option key={c} value={c}>{c} — {lbl.en} ({lbl.fr})</option>
              })}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes sur l'état, particularités, etc."
              className="w-full bg-poke-dark border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-poke-yellow/60 transition resize-none"
            />
          </div>

          {/* For sale toggle */}
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <div>
              <p className="text-white text-sm font-medium">Visible sur la vitrine</p>
              <p className="text-white/40 text-xs mt-0.5">Désactiver pour masquer cette carte du public</p>
            </div>
            <button
              type="button"
              onClick={() => setForSale(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${forSale ? 'bg-green-500' : 'bg-white/20'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${forSale ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Prices (read-only info) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <p className="text-white/40">🇺🇸 TCGPlayer</p>
              <p className="text-white font-bold mt-0.5">
                {card.price_usd !== null ? `$${card.price_usd.toFixed(2)}` : '—'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <p className="text-white/40">🇪🇺 Cardmarket</p>
              <p className="text-white font-bold mt-0.5">
                {card.price_eur !== null ? `€${card.price_eur.toFixed(2)}` : '—'}
              </p>
            </div>
          </div>
          <p className="text-white/25 text-xs -mt-2">Les prix viennent de pokemontcg.io et ne sont pas modifiables ici.</p>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 hover:text-white text-sm font-medium transition"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-poke-yellow text-black font-bold text-sm hover:bg-yellow-400 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {saving ? <><span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />Sauvegarde…</> : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
