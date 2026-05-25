export interface TCGPrices {
  low?: number | null
  mid?: number | null
  high?: number | null
  market?: number | null
  directLow?: number | null
}

export interface CardMarketPrices {
  averageSellPrice?: number | null
  lowPrice?: number | null
  trendPrice?: number | null
}

export interface PokemonTCGCard {
  id: string
  name: string
  number: string
  hp?: string
  rarity?: string
  images: { small: string; large: string }
  set: { id: string; name: string; series: string }
  tcgplayer?: {
    prices?: {
      normal?: TCGPrices
      holofoil?: TCGPrices
      reverseHolofoil?: TCGPrices
    }
  }
  cardmarket?: { prices?: CardMarketPrices }
}

export interface PokemonTCGSet {
  id: string
  name: string
  series: string
  total: number
  releaseDate: string
}

export interface PokemonTCGCardsResponse {
  data: PokemonTCGCard[]
  totalCount: number
  page: number
  pageSize: number
  count: number
}

export interface PokemonTCGSetsResponse {
  data: PokemonTCGSet[]
}
