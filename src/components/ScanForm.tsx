'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { ScanResult, SetCache } from '@/types/card'
import PriceBadge from './PriceBadge'
import { CONDITION_LABELS, CONDITIONS, type Condition } from '@/lib/conditions'

// ── Détection HEIC (par extension ou MIME) ─────────────────────────────────
function isHeic(file: File): boolean {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'heic' || ext === 'heif'
}

// ── Filtre image élargi (inclut les extensions connues si MIME vide) ────────
function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'avif', 'bmp', 'tiff'].includes(ext ?? '')
}

// ── Resize helper (côté client, avant envoi) ───────────────────────────────
async function resizeImage(file: File, maxPx = 1024): Promise<Blob> {
  let source: Blob = file

  // Convertir HEIC → JPEG avant le canvas (Chrome/Firefox ne décodent pas HEIC)
  if (isHeic(file)) {
    const heic2any = (await import('heic2any')).default
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.88 })
    source = Array.isArray(converted) ? converted[0] : converted
  }

  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(source)
    img.onload = () => {
      let { width, height } = img
      if (width > height) {
        if (width > maxPx) { height = Math.round((height * maxPx) / width); width = maxPx }
      } else {
        if (height > maxPx) { width = Math.round((width * maxPx) / height); height = maxPx }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error('Canvas toBlob échoué'))),
        'image/jpeg',
        0.88
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Chargement image échoué')) }
    img.src = url
  })
}

// ── Sélecteur d'état (partagé) ─────────────────────────────────────────────
function ConditionPicker({ value, onChange }: { value: Condition; onChange: (v: Condition) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as Condition)}
      className="w-full bg-poke-dark border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-poke-yellow/60 transition"
    >
      {CONDITIONS.map(c => {
        const lbl = CONDITION_LABELS[c]
        return (
          <option key={c} value={c}>
            {c} — {lbl.en} ({lbl.fr})
          </option>
        )
      })}
    </select>
  )
}

// ── Résultat de scan (partagé) ─────────────────────────────────────────────
function ScanResultCard({ result }: { result: ScanResult }) {
  return (
    <div className="flex gap-3 items-start">
      {result.card.image_url && (
        <div className="relative w-14 h-20 shrink-0 rounded-lg overflow-hidden bg-poke-dark">
          <Image
            src={result.card.image_url}
            alt={result.card.name}
            fill
            className="object-contain p-1"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm truncate">{result.card.name}</p>
        <p className="text-white/50 text-xs">{result.scan.set}</p>
        <PriceBadge priceUSD={result.card.price_usd} priceEUR={result.card.price_eur} />
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
            result.scan.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
            result.scan.confidence === 'medium' ? 'bg-poke-yellow/20 text-poke-yellow' :
            'bg-white/10 text-white/40'
          }`}>
            {result.scan.confidence}
          </span>
          <span className="text-white/30 text-xs">{result.scan.source}</span>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// ── Onglet PHOTO ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

interface QueueItem {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'processing' | 'done' | 'error'
  result?: ScanResult
  error?: string
}

function QueueRow({ item, onRemove }: { item: QueueItem; onRemove: (id: string) => void }) {
  const cfg = {
    pending:    { label: 'En attente',    cls: 'border-white/10 bg-white/5' },
    processing: { label: 'Scan en cours…', cls: 'border-poke-yellow/30 bg-poke-yellow/5' },
    done:       { label: 'Terminé ✓',     cls: 'border-green-500/20 bg-green-500/5' },
    error:      { label: 'Erreur ✕',      cls: 'border-red-500/20 bg-red-500/5' },
  }[item.status]

  return (
    <div className={`rounded-xl border p-3 transition ${cfg.cls}`}>
      <div className="flex gap-3 items-start">
        {/* Miniature */}
        <div className="relative w-10 h-14 shrink-0 rounded overflow-hidden bg-poke-dark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
          {item.status === 'processing' && (
            <div className="absolute inset-0 bg-poke-dark/60 flex items-center justify-center">
              <span className="w-4 h-4 border-2 border-white/30 border-t-poke-yellow rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/50 text-xs truncate">{item.file.name}</span>
            <span className={`text-xs shrink-0 font-medium ${
              item.status === 'done' ? 'text-green-400' :
              item.status === 'error' ? 'text-red-400' :
              item.status === 'processing' ? 'text-poke-yellow' :
              'text-white/30'
            }`}>{cfg.label}</span>
          </div>
          {item.status === 'done' && item.result && <ScanResultCard result={item.result} />}
          {item.status === 'error' && (
            <p className="text-red-300 text-xs leading-relaxed">{item.error}</p>
          )}
        </div>

        {/* Supprimer (seulement si en attente) */}
        {item.status === 'pending' && (
          <button
            onClick={() => onRemove(item.id)}
            className="text-white/20 hover:text-white/60 text-lg leading-none shrink-0 transition"
            title="Retirer"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

function VisionTab({ onNewCard }: { onNewCard?: () => void }) {
  const [condition, setCondition] = useState<Condition>('NM')
  const conditionRef = useRef<Condition>('NM')
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [processing, setProcessing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const processingRef = useRef(false)

  function handleConditionChange(v: Condition) {
    conditionRef.current = v
    setCondition(v)
  }

  function removeItem(id: string) {
    setQueue(prev => {
      const item = prev.find(i => i.id === id)
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      return prev.filter(i => i.id !== id)
    })
  }

  function clearFinished() {
    setQueue(prev => {
      prev.filter(i => i.status === 'done' || i.status === 'error')
          .forEach(i => URL.revokeObjectURL(i.previewUrl))
      return prev.filter(i => i.status === 'pending' || i.status === 'processing')
    })
  }

  // Traite une liste d'items directement (évite les stale closures)
  async function processItems(items: QueueItem[]) {
    if (processingRef.current) return
    processingRef.current = true
    setProcessing(true)

    for (const item of items) {
      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i))
      try {
        const resized = await resizeImage(item.file, 1024)
        const fd = new FormData()
        fd.append('image', resized, item.file.name)
        fd.append('condition', conditionRef.current)

        const res = await fetch('/api/scan/vision', { method: 'POST', body: fd })
        const data = await res.json()

        if (!res.ok) {
          setQueue(prev => prev.map(i =>
            i.id === item.id ? { ...i, status: 'error', error: data.detail ?? data.error ?? 'Erreur inconnue' } : i
          ))
        } else {
          setQueue(prev => prev.map(i =>
            i.id === item.id ? { ...i, status: 'done', result: data as ScanResult } : i
          ))
          onNewCard?.()
        }
      } catch (err) {
        setQueue(prev => prev.map(i =>
          i.id === item.id ? { ...i, status: 'error', error: String(err) } : i
        ))
      }
    }

    processingRef.current = false
    setProcessing(false)
  }

  // Ajoute les fichiers à la file ET démarre le scan automatiquement
  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: QueueItem[] = Array.from(files)
      .filter(isImageFile)
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending' as const,
      }))
    if (newItems.length === 0) return
    setQueue(prev => [...prev, ...newItems])
    // Auto-démarrage immédiat
    processItems(newItems)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNewCard])

  const processing_ = queue.filter(i => i.status === 'processing').length
  const doneCount   = queue.filter(i => i.status === 'done').length
  const errorCount  = queue.filter(i => i.status === 'error').length

  return (
    <div className="space-y-4">
      {/* Sélecteur d'état */}
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1">État des cartes</label>
        <ConditionPicker value={condition} onChange={handleConditionChange} />
      </div>

      {/* Zone de dépôt */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-poke-yellow bg-poke-yellow/10 scale-[1.01]'
            : processing
            ? 'border-poke-yellow/40 bg-poke-yellow/5'
            : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/8'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = '' }}
        />
        {processing ? (
          <>
            <div className="flex justify-center mb-2">
              <span className="w-8 h-8 border-4 border-white/20 border-t-poke-yellow rounded-full animate-spin" />
            </div>
            <p className="text-poke-yellow text-sm font-medium">Scan en cours… ({processing_} carte{processing_ > 1 ? 's' : ''})</p>
            <p className="text-white/30 text-xs mt-1">Vous pouvez ajouter d'autres photos</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-2">📷</div>
            <p className="text-white/70 text-sm font-medium">
              Glissez vos photos ici ou{' '}
              <span className="text-poke-yellow underline underline-offset-2">cliquez pour choisir</span>
            </p>
            <p className="text-white/30 text-xs mt-1">
              JPG · PNG · HEIC · WEBP — plusieurs fichiers acceptés
            </p>
            <p className="text-white/20 text-xs mt-0.5">
              Le scan démarre automatiquement après sélection
            </p>
          </>
        )}
      </div>

      {/* File d'attente */}
      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>
              {queue.length} photo{queue.length > 1 ? 's' : ''}
              {doneCount > 0 && <span className="text-green-400 ml-2">· {doneCount} ✓</span>}
              {errorCount > 0 && <span className="text-red-400 ml-2">· {errorCount} erreur{errorCount > 1 ? 's' : ''}</span>}
            </span>
            {(doneCount + errorCount) > 0 && !processing && (
              <button onClick={clearFinished} className="hover:text-white/60 transition">
                Effacer les terminées
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {queue.map(item => (
              <QueueRow key={item.id} item={item} onRemove={removeItem} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// ── Onglet MANUEL ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

function ManualTab({ sets, onNewCard }: { sets: SetCache[]; onNewCard?: () => void }) {
  const [name, setName] = useState('')
  const [setId, setSetId] = useState('')
  const [condition, setCondition] = useState<Condition>('NM')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), setId: setId || undefined, condition }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Erreur inconnue')
      else { setResult(data as ScanResult); onNewCard?.() }
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">Nom de la carte</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ex: Pikachu"
            required
            className="w-full bg-poke-dark border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-poke-yellow/60 focus:ring-1 focus:ring-poke-yellow/30 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">Extension</label>
          <select
            value={setId}
            onChange={e => setSetId(e.target.value)}
            className="w-full bg-poke-dark border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-poke-yellow/60 transition"
          >
            <option value="">Toutes extensions</option>
            {sets.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.series})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">État</label>
          <ConditionPicker value={condition} onChange={setCondition} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full py-3 rounded-xl font-bold text-sm bg-poke-red text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyse en cours…</>
        ) : 'Scanner & Valoriser'}
      </button>

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {result && (
        <div className="bg-poke-navy/80 border border-poke-yellow/30 rounded-2xl p-4">
          <ScanResultCard result={result} />
        </div>
      )}
    </form>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// ── Composant principal ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

export default function ScanForm({ onNewCard }: { onNewCard?: () => void }) {
  const [tab, setTab] = useState<'vision' | 'manual'>('vision')
  const [sets, setSets] = useState<SetCache[]>([])

  useEffect(() => {
    fetch('/api/sets')
      .then(r => r.json())
      .then((data: SetCache[]) => setSets(data))
      .catch(() => {})
  }, [])

  return (
    <div className="bg-poke-navy/60 border border-white/10 rounded-2xl p-6 space-y-5 backdrop-blur-sm">
      {/* En-tête + onglets */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-poke-yellow flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Scanner une carte
        </h2>

        <div className="flex gap-1 bg-poke-dark/80 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setTab('vision')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              tab === 'vision' ? 'bg-poke-red text-white shadow' : 'text-white/50 hover:text-white'
            }`}
          >
            📷 Photos
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              tab === 'manual' ? 'bg-poke-red text-white shadow' : 'text-white/50 hover:text-white'
            }`}
          >
            ⌨️ Manuel
          </button>
        </div>
      </div>

      {tab === 'vision' ? (
        <VisionTab onNewCard={onNewCard} />
      ) : (
        <ManualTab sets={sets} onNewCard={onNewCard} />
      )}
    </div>
  )
}
