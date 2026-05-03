// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// LLM Service — IMA Router (primary) → Z.AI (fallback).
// Uses OpenAI-compatible /v1/chat/completions via IMA Router for speed.
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_MODE = process.env.MOCK_MODE === 'true';
const IMA_ROUTER_BASE = 'https://api.imarouter.com';

async function callImaRouter(system: string, user: string): Promise<string> {
  const key = process.env.IMA_ROUTER_API_KEY;
  if (!key) throw new Error('IMA_ROUTER_API_KEY not set');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch(`${IMA_ROUTER_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`IMA Router chat error ${res.status}: ${text}`);
    }
    const data = await res.json();
    return data.choices[0].message.content as string;
  } finally {
    clearTimeout(timeout);
  }
}

async function callZai(system: string, user: string): Promise<string> {
  const key = process.env.ZAI_API_KEY;
  if (!key) throw new Error('ZAI_API_KEY not set');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'glm-5.1',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Z.AI error ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content as string;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Main LLM call — tries IMA Router (gpt-4o) first, then Z.AI as fallback.
 * Returns '__MOCK__' sentinel if MOCK_MODE or all providers fail.
 */
export async function callLLM(system: string, user: string): Promise<string> {
  if (MOCK_MODE) return '__MOCK__';

  const providers: Array<[string, () => Promise<string>]> = [
    ['IMA Router (gpt-4o)', () => callImaRouter(system, user)],
    ['Z.AI (glm-5.1)',      () => callZai(system, user)],
  ];

  for (const [name, call] of providers) {
    try {
      return await call();
    } catch (e) {
      console.warn(`[llmService] ${name} failed:`, (e as Error).message);
    }
  }

  console.warn('[llmService] All LLM providers failed — returning mock sentinel');
  return '__MOCK__';
}

/**
 * Parse the JSON from an LLM response string.
 * Handles markdown code fences and trailing text.
 */
export function parseJSON<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
