import type { OllamaGenerateResponse } from '@/types/ollama'

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434'
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL ?? 'qwen3-vl:8b'

// /no_think désactive le mode raisonnement de Qwen3-VL — sortie JSON directe
const VISION_PROMPT = `/no_think
You are a Pokémon Trading Card Game card scanner. Look at the card image carefully.

CRITICAL INSTRUCTIONS:
1. Read the card number at the bottom. It is formatted as "X/Y" or "XXX/YYY". Extract X as card_number and Y as total_in_set. These are always integers. Never return null for card_number if a slash notation is visible.
2. Return ONLY a JSON object. No markdown, no explanation, no text outside the JSON.

JSON Schema:
{
  "name": "exact card name printed at the top",
  "card_number": 58,
  "total_in_set": 102,
  "hp": 330,
  "card_type": "Pokemon",
  "confidence": "high"
}

Rules:
- card_number and total_in_set are INTEGERS (not strings), or null only if truly not visible
- hp is an INTEGER or null if not a Pokémon card
- confidence: "high" all fields clear, "medium" some guessed, "low" image unclear`

export interface CardVisionResult {
  name: string
  card_number: number | string | null
  total_in_set: number | string | null
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
