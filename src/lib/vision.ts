import type { OllamaGenerateResponse } from '@/types/ollama'

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434'
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL ?? 'qwen3-vl:8b'

// /no_think désactive le mode raisonnement de Qwen3-VL — sortie JSON directe
const VISION_PROMPT = `/no_think
You are a Pokémon Trading Card Game card scanner. Carefully read the card in the image and extract the printed information.
Respond with ONLY valid JSON — no text, no markdown, no explanation outside the JSON object.

JSON Schema (respond with exactly this structure):
{
  "name": "exact card name printed at the top of the card",
  "card_number": "number before the slash at bottom-right (e.g. '58' from '58/102'), or null",
  "total_in_set": "number after the slash at bottom-right (e.g. '102' from '58/102'), or null",
  "hp": "HP value as integer, or null if not a Pokemon card",
  "card_type": "Pokemon or Trainer or Energy",
  "confidence": "high if all fields clearly readable, medium if some are guessed, low if image is unclear"
}`

export interface CardVisionResult {
  name: string
  card_number: string | null
  total_in_set: string | null
  hp: number | null
  card_type: 'Pokemon' | 'Trainer' | 'Energy' | string
  confidence: 'high' | 'medium' | 'low'
}

const FALLBACK: CardVisionResult = {
  name: '',
  card_number: null,
  total_in_set: null,
  hp: null,
  card_type: 'Pokemon',
  confidence: 'low',
}

export async function identifyCardFromImage(imageBase64: string): Promise<CardVisionResult> {
  const body = {
    model: OLLAMA_VISION_MODEL,
    prompt: VISION_PROMPT,
    images: [imageBase64],
    stream: false,
    format: 'json',
  }

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  })

  if (!res.ok) {
    throw new Error(`Modèle vision (${OLLAMA_VISION_MODEL}) a répondu ${res.status}`)
  }

  const data = (await res.json()) as OllamaGenerateResponse
  // Nettoyage balises <think> résiduelles (Qwen3)
  const cleaned = data.response.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

  try {
    const result = JSON.parse(cleaned) as CardVisionResult
    return { ...FALLBACK, ...result }
  } catch {
    throw new Error(`Modèle vision a retourné un JSON invalide: ${cleaned.slice(0, 300)}`)
  }
}
