import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-3-pro-image-preview';

/**
 * POST /api/image
 * Body: { prompt: string; size?: string }
 *
 * Calls Google Gemini image generation and returns a base64 data URL.
 * Falls back to a themed placeholder on any error.
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt } = (await req.json()) as {
      prompt: string;
      size?: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const key = process.env.GOOGLE_API_KEY;
    if (!key) {
      return NextResponse.json(
        { url: fallbackUrl(prompt), fallback: true },
        { status: 200 }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[/api/image] Gemini error:', res.status, text);
      return NextResponse.json(
        { url: fallbackUrl(prompt), fallback: true },
        { status: 200 }
      );
    }

    const data = await res.json();
    const parts: { inlineData?: { data: string; mimeType: string } }[] =
      data?.candidates?.[0]?.content?.parts ?? [];

    const imagePart = parts.find((p) => p.inlineData?.data);
    if (!imagePart?.inlineData) {
      console.error('[/api/image] Gemini returned no image part:', JSON.stringify(data).slice(0, 400));
      return NextResponse.json(
        { url: fallbackUrl(prompt), fallback: true },
        { status: 200 }
      );
    }

    const { data: b64, mimeType } = imagePart.inlineData;
    const url = `data:${mimeType};base64,${b64}`;

    return NextResponse.json({ url, fallback: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/image] unexpected error:', message);
    return NextResponse.json(
      { url: fallbackUrl(''), fallback: true },
      { status: 200 }
    );
  }
}

function fallbackUrl(prompt: string): string {
  const label = encodeURIComponent(prompt.slice(0, 40) || 'AI Image');
  return `https://placehold.co/1024x1024/0F1117/06B6D4?text=${label}`;
}
