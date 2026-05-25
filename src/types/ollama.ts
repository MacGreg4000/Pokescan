export interface OllamaGenerateRequest {
  model: string
  prompt: string
  stream: false
  format: 'json'
}

export interface OllamaGenerateResponse {
  model: string
  response: string
  done: boolean
}

export interface ScanJSON {
  name: string
  set: string
  condition: string
  price_usd: number | 'Sans valeur'
  price_eur: number | 'Sans valeur'
  source: string
  confidence: 'high' | 'medium' | 'low' | 'none'
  notes: string
}
