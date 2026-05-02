// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// LLM Service — tries Z.AI first, falls back to OpenAI, then Anthropic.
// If MOCK_MODE=true or all keys fail, returns a mock response sentinel.
// TODO: fill ZAI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY in .env.local
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_MODE = process.env.MOCK_MODE === 'true';

async function callZai(system: string, user: string): Promise<string> {
  const key = process.env.ZAI_API_KEY;
  if (!key) throw new Error('ZAI_API_KEY not set');

  const res = await fetch('https://api.z.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'z1-preview',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Z.AI error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

async function callOpenAI(system: string, user: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

async function callAnthropic(system: string, user: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
  const data = await res.json();
  return data.content[0].text as string;
}

/**
 * Main LLM call — tries Z.AI → OpenAI → Anthropic in order.
 * Returns '__MOCK__' sentinel if MOCK_MODE or all providers fail.
 */
export async function callLLM(system: string, user: string): Promise<string> {
  if (MOCK_MODE) return '__MOCK__';

  const providers = [callZai, callOpenAI, callAnthropic];
  for (const provider of providers) {
    try {
      return await provider(system, user);
    } catch {
      // try next provider
    }
  }

  console.warn('[zaiService] All LLM providers failed — returning mock sentinel');
  return '__MOCK__';
}

/**
 * Parse the JSON from an LLM response string.
 * Handles markdown code fences and trailing text.
 */
export function parseJSON<T>(raw: string): T | null {
  try {
    // Strip markdown fences
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
