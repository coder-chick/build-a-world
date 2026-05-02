import { NextRequest, NextResponse } from 'next/server';
import { VideoType } from '@/types/productWorld';

// BytePlus ModelArk — Seedance video generation API
// Docs: https://docs.byteplus.com/en/docs/ModelArk/1520757
const BYTEPLUS_BASE = 'https://ark.ap-southeast.bytepluses.com/api/v3';
const SEEDANCE_MODEL = process.env.SEEDANCE_MODEL ?? 'dreamina-seedance-2-0-260128';

/** Collect all configured BytePlus/Seedance keys, deduped, in priority order. */
function getSeedanceKeys(): string[] {
  const raw = [
    process.env.SEEDANCE_API_KEY,
    process.env.SEEDANCE_API_KEY2,
    process.env.SEEDANCE_API_KEY3,
    process.env.SEEDANCE_API_KEY4,
    process.env.SEEDANCE_API_KEY5,
  ].filter(Boolean) as string[];
  return Array.from(new Set(raw));
}

/**
 * POST /api/video
 * Body: { prompt: string; type: VideoType; imageUrl?: string; environmentId?: string }
 *
 * Tries each BytePlus API key in order until one succeeds.
 * imageUrl is used as first_frame image for img2video when provided.
 * Falls back to a mock task if all keys fail or none are configured.
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, type, imageUrl, environmentId } = (await req.json()) as {
      prompt: string;
      type: VideoType;
      imageUrl?: string;
      environmentId?: string;
    };

    if (!prompt || !type) {
      return NextResponse.json({ error: 'prompt and type are required' }, { status: 400 });
    }

    // ── 1. Try Veo 3 first ──────────────────────────────────────────────────
    const googleKey = process.env.GOOGLE_API_KEY;
    if (googleKey) {
      try {
        const veoRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:predictLongRunning?key=${googleKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instances: [{ prompt }],
              parameters: { aspectRatio: '16:9', sampleCount: 1 },
            }),
          }
        );
        if (veoRes.ok) {
          const veoData = await veoRes.json() as { name: string };
          console.log(`[video] Veo 3 operation started: ${veoData.name}`);
          // Encode slashes so the taskId is a single URL path segment
          const encodedName = veoData.name.replace(/\//g, '~');
          return NextResponse.json({
            mock: false,
            taskId: `veo::${encodedName}`,
            type,
            prompt,
            status: 'pending',
            environmentId,
          });
        }
        const veoErr = await veoRes.text().catch(() => '');
        console.warn(`[video] Veo 3 returned ${veoRes.status}: ${veoErr} — trying BytePlus`);
      } catch (err) {
        console.warn('[video] Veo 3 threw:', err, '— trying BytePlus');
      }
    }

    // ── 2. Fall back to BytePlus Seedance ───────────────────────────────────
    const keys = getSeedanceKeys();

    if (keys.length > 0) {
      // BytePlus only accepts HTTP/HTTPS URLs for first_frame — skip base64 data: URLs.
      type ContentItem = { type: string; text?: string; image_url?: { url: string }; role?: string };
      const content: ContentItem[] = [{ type: 'text', text: prompt }];
      if (imageUrl && imageUrl.startsWith('http')) {
        content.push({ type: 'image_url', image_url: { url: imageUrl }, role: 'first_frame' });
      }

      const requestBody = {
        model: SEEDANCE_MODEL,
        content,
        resolution: '720p',
        ratio: '16:9',
        duration: 5,
      };

      for (const key of keys) {
        try {
          const res = await fetch(`${BYTEPLUS_BASE}/contents/generations/tasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (res.ok) {
            const data = await res.json();
            console.log(`[video] BytePlus task created: ${data.id} using key ...${key.slice(-6)}`);
            return NextResponse.json({
              mock: false,
              taskId: data.id as string,
              type,
              prompt,
              status: 'pending',
              environmentId,
            });
          }

          const errText = await res.text().catch(() => '');
          console.warn(`[video] key ...${key.slice(-6)} returned ${res.status}: ${errText} — trying next key`);
        } catch (err) {
          console.warn(`[video] key ...${key.slice(-6)} threw:`, err);
        }
      }
    }

    // ── 3. Everything failed — mock placeholder ──────────────────────────────
    console.warn('[video] all providers failed — falling back to mock');
    return NextResponse.json({
      mock: true,
      id: `mock-${Date.now()}`,
      type,
      prompt,
      status: 'complete',
      url: undefined,
      thumbnailUrl: `https://placehold.co/640x360/0F1117/6EE7F7?text=${encodeURIComponent(type.toUpperCase() + '+VIDEO')}`,
      environmentId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

