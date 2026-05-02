// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// LLM Service — uses Google Gemini for all LLM calls.
// If MOCK_MODE=true or Gemini fails, returns a mock response sentinel.
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_MODE = process.env.MOCK_MODE === 'true';

async function callGemini(system: string, user: string): Promise<string> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY not set');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${system}\n\n${user}` }] },
        ],
        generationConfig: { temperature: 0.7 },
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0].text as string;
}

/**
 * Main LLM call — uses Google Gemini.
 * Returns '__MOCK__' sentinel if MOCK_MODE or Gemini fails.
 */
export async function callLLM(system: string, user: string): Promise<string> {
  if (MOCK_MODE) return '__MOCK__';

  try {
    return await callGemini(system, user);
  } catch (err) {
    console.warn('[zaiService] Gemini failed:', err instanceof Error ? err.message : err);
  }

  console.warn('[zaiService] LLM provider failed — returning mock sentinel');
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
