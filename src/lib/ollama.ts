import type { OllamaGenerateRequest, OllamaGenerateResponse, ScanJSON } from '@/types/ollama'

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen3:8b'

// /no_think disables Qwen3's chain-of-thought mode — keeps output lean and JSON-only
const SYSTEM_PROMPT = `/no_think
You are a Pokémon TCG pricing assistant. You MUST respond with ONLY valid JSON — no text before or after the JSON object.

STRICT RULES:
1. You MUST NOT invent prices. All price values MUST come ONLY from the "Real price data" section below.
2. If a price field is null or missing in "Real price data", you MUST use the string "Sans valeur" (not 0, not null).
3. The confidence field reflects how reliable the provided price data is — never your own estimate.
4. Do not add any explanation, commentary, or markdown outside the JSON.

JSON Schema (respond with exactly this structure):
{
  "name": "string",
  "set": "string",
  "condition": "string",
  "price_usd": number | "Sans valeur",
  "price_eur": number | "Sans valeur",
  "source": "string",
  "confidence": "high" | "medium" | "low" | "none",
  "notes": "string"
}`

const SAFE_FALLBACK: ScanJSON = {
  name: '',
  set: '',
  condition: '',
  price_usd: 'Sans valeur',
  price_eur: 'Sans valeur',
  source: 'none',
  confidence: 'none',
  notes: 'Données indisponibles',
}

/**
 * Traduit un nom de carte Pokémon dans une autre langue vers l'anglais.
 * Utilise Ollama pour les traductions FR/JP/ES/DE → EN.
 * Retourne null si déjà en anglais ou en cas d'échec.
 */
export async function translateToEnglishName(name: string): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `/no_think\nWhat is the official English Pokémon TCG card name for the card called "${name}"? Reply with ONLY the English name (e.g. "Charizard ex"), nothing else.`,
        stream: false,
      }),
      signal: AbortSignal.timeout(20_000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as OllamaGenerateResponse
    const cleaned = data.response
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```[\s\S]*?```/g, '')
      .trim()
      .replace(/^["']|["']$/g, '') // enlever éventuelles guillemets
    // Sanity : nom court, différent de l'original
    if (!cleaned || cleaned.length > 60 || cleaned.toLowerCase() === name.toLowerCase()) return null
    return cleaned
  } catch {
    return null
  }
}

export async function generateScanJSON(params: {
  name: string
  set: string
  condition: string
  priceUSD: number | null
  priceEUR: number | null
  source: string
}): Promise<ScanJSON> {
  const { name, set, condition, priceUSD, priceEUR, source } = params

  const userPrompt = `Card to analyze:
- Name: ${name}
- Set: ${set}
- Condition: ${condition}

Real price data (use ONLY these values):
- price_usd: ${priceUSD !== null ? priceUSD : 'null (use "Sans valeur")'}
- price_eur: ${priceEUR !== null ? priceEUR : 'null (use "Sans valeur")'}
- source: ${source}

Respond with a single JSON object matching the schema. Do not add any text outside the JSON.`

  const body: OllamaGenerateRequest = {
    model: OLLAMA_MODEL,
    prompt: `${SYSTEM_PROMPT}\n\n${userPrompt}`,
    stream: false,
    format: 'json',
  }

  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      throw new Error(`Ollama responded ${res.status}`)
    }

    const data = (await res.json()) as OllamaGenerateResponse
    // Strip any residual <think>...</think> blocks (Qwen3 safety net)
    const cleaned = data.response.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
    const parsed = JSON.parse(cleaned) as Partial<ScanJSON>

    return {
      name: parsed.name ?? name,
      set: parsed.set ?? set,
      condition: parsed.condition ?? condition,
      price_usd: priceUSD !== null ? (priceUSD) : 'Sans valeur',
      price_eur: priceEUR !== null ? (priceEUR) : 'Sans valeur',
      source: parsed.source ?? source,
      confidence: parsed.confidence ?? (priceUSD !== null ? 'high' : 'none'),
      notes: parsed.notes ?? '',
    }
  } catch {
    return {
      ...SAFE_FALLBACK,
      name,
      set,
      condition,
      price_usd: priceUSD !== null ? priceUSD : 'Sans valeur',
      price_eur: priceEUR !== null ? priceEUR : 'Sans valeur',
      source,
    }
  }
}
