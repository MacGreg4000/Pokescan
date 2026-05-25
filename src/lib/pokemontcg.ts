import type {
  PokemonTCGCard,
  PokemonTCGSet,
  PokemonTCGCardsResponse,
  PokemonTCGSetsResponse,
} from '@/types/pokemontcg'

const BASE = 'https://api.pokemontcg.io/v2'

async function apiFetch<T>(path: string): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (process.env.POKEMONTCG_API_KEY) {
    headers['X-Api-Key'] = process.env.POKEMONTCG_API_KEY
  }
  const res = await fetch(`${BASE}${path}`, { headers, next: { revalidate: 3600 } })
  if (!res.ok) {
    throw new Error(`pokemontcg.io ${path} → ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function searchCards(
  name: string,
  setId?: string
): Promise<PokemonTCGCard[]> {
  try {
    let query = `name:"${encodeURIComponent(name)}"`
    if (setId) query += ` set.id:${encodeURIComponent(setId)}`
    const data = await apiFetch<PokemonTCGCardsResponse>(
      `/cards?q=${query}&pageSize=10`
    )
    return data.data ?? []
  } catch {
    return []
  }
}

/**
 * Recherche par nom + numéro de carte (issu de la reconnaissance visuelle).
 * Plus précis que searchCards car le numéro élimine les homonymes entre sets.
 */
export async function searchByNameAndNumber(
  name: string,
  cardNumber: string | null
): Promise<PokemonTCGCard[]> {
  try {
    let query = `name:"${encodeURIComponent(name)}"`
    if (cardNumber) query += ` number:"${encodeURIComponent(cardNumber)}"`
    const data = await apiFetch<PokemonTCGCardsResponse>(
      `/cards?q=${query}&pageSize=5`
    )
    return data.data ?? []
  } catch {
    // Fallback: chercher uniquement par nom si la recherche combinée échoue
    return searchCards(name)
  }
}

/**
 * Recherche par numéro de carte — méthode principale (indépendante de la langue).
 * Utilise total_in_set pour cibler le bon set, puis filtre par HP.
 */
export async function searchByNumber(
  cardNumber: string | number,
  hp?: number | null,
  totalInSet?: number | null
): Promise<PokemonTCGCard[]> {
  try {
    // Normaliser le numéro : "056" → "56", 56 → "56"
    const num = String(cardNumber).replace(/^0+/, '') || String(cardNumber)

    let query = `number:"${encodeURIComponent(num)}"`
    // total_in_set permet de cibler le bon set (ex: 24 cartes → set très spécifique)
    if (totalInSet) query += ` set.total:${totalInSet}`

    const data = await apiFetch<PokemonTCGCardsResponse>(
      `/cards?q=${query}&pageSize=30`
    )
    const cards = data.data ?? []
    if (cards.length === 0) return []
    if (!hp || cards.length === 1) return cards

    // Filtrer par HP (très discriminant : Charizard EX 330 HP est unique)
    const byHp = cards.filter(c => parseInt(c.hp ?? '0') === hp)
    return byHp.length > 0 ? byHp : cards
  } catch {
    return []
  }
}

export async function getSets(): Promise<PokemonTCGSet[]> {
  const data = await apiFetch<PokemonTCGSetsResponse>('/sets?orderBy=-releaseDate')
  return data.data ?? []
}

export function extractPriceUSD(card: PokemonTCGCard): number | null {
  const prices = card.tcgplayer?.prices
  if (!prices) return null
  return (
    prices.holofoil?.market ??
    prices.normal?.market ??
    prices.reverseHolofoil?.market ??
    prices.holofoil?.mid ??
    prices.normal?.mid ??
    null
  )
}

export function extractPriceEUR(card: PokemonTCGCard): number | null {
  const prices = card.cardmarket?.prices
  if (!prices) return null
  return prices.averageSellPrice ?? prices.trendPrice ?? prices.lowPrice ?? null
}
