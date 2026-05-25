import type { ScanJSON } from './ollama'
import type { PokemonTCGCard } from './pokemontcg'

export type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'

export interface CardScanned {
  id: number
  name: string
  set_id: string
  condition: CardCondition
  price_usd: number | null
  price_eur: number | null
  scanned_at: string
  image_url: string | null
  source: string | null
  confidence: string | null
  notes: string | null
  for_sale: number  // 1 = en vente, 0 = masqué de la vitrine
}

export interface SetCache {
  id: string
  name: string
  series: string
  total: number
  cached_at: string
}

export interface AdminStats {
  total_scanned: number
  avg_price_usd: number | null
  avg_price_eur: number | null
  last_scan: string | null
  sets_count: number
}

export interface ScanResult {
  card: CardScanned
  scan: ScanJSON
  raw_card: PokemonTCGCard | null
}
