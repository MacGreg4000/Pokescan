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
  // Utilise /api/chat (multimodal) — qwen3-vl répond mieux qu'avec /api/generate
  const body = {
    model: OLLAMA_VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: VISION_PROMPT,
        images: [imageBase64],
      },
    ],
    stream: false,
    format: 'json',
  }

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000), // vision peut être lent
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Modèle vision (${OLLAMA_VISION_MODEL}) a répondu ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json() as Record<string, unknown>
  console.log('[vision] réponse Ollama brute:', JSON.stringify(data).slice(0, 600))

  // /api/chat → data.message.content
  const raw: string =
    (data?.message as Record<string, unknown>)?.content as string
    ?? (data as unknown as OllamaGenerateResponse)?.response   // fallback /api/generate
    ?? ''

  // Supprimer <think>…</think> et blocs markdown
  const cleaned = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```(?:json)?\s*/gi, '')
    .replace(/```/g, '')
    .trim()

  // Extraire le premier { … } même si du texte entoure le JSON
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[0] : cleaned

  try {
    const result = JSON.parse(jsonStr) as CardVisionResult
    return { ...FALLBACK, ...result }
  } catch {
    console.error('[vision] JSON invalide — raw:', raw.slice(0, 500))
    throw new Error(`Modèle vision a retourné un JSON invalide: ${raw.slice(0, 200)}`)
  }
}
