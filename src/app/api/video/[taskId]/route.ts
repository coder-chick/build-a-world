import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// BytePlus ModelArk — Seedance video polling API
// Docs: https://docs.byteplus.com/en/docs/ModelArk/1521309
const BYTEPLUS_BASE = 'https://ark.ap-southeast.bytepluses.com/api/v3';

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
 * GET /api/video/[taskId]
 * Polls BytePlus ModelArk for task status.
 * Tries each key — the one that created the task will succeed; others return 404/401/403.
 *
 * BytePlus status values: queued | running | cancelled | succeeded | failed | expired
 * We normalise: succeeded → complete, failed/expired → failed, everything else → processing
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const { taskId } = params;

  // ── Veo 3 polling ──────────────────────────────────────────────────────────
  if (taskId.startsWith('veo::')) {
    const operationName = taskId.slice(5).replace(/~/g, '/'); // decode encoded slashes
    const googleKey = process.env.GOOGLE_API_KEY;
    if (!googleKey) {
      return NextResponse.json({ error: 'No GOOGLE_API_KEY configured' }, { status: 500 });
    }
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${googleKey}`,
        { cache: 'no-store' }
      );
      if (!res.ok) {
        return NextResponse.json({ status: 'failed', error: `Veo poll error ${res.status}` });
      }
      const data = await res.json() as {
        done?: boolean;
        response?: {
          generateVideoResponse?: { generatedSamples?: { video?: { uri?: string; videoBytes?: string; mimeType?: string } }[] };
          generatedSamples?: { video?: { uri?: string; videoBytes?: string; mimeType?: string } }[];
        };
      };
      if (!data.done) {
        return NextResponse.json({ status: 'processing' });
      }
      console.log(`[video/poll] Veo done. Response keys:`, Object.keys(data.response ?? {}));
      console.log(`[video/poll] Full response sample:`, JSON.stringify(data.response).slice(0, 500));
      const samples =
        data.response?.generateVideoResponse?.generatedSamples ??
        data.response?.generatedSamples ?? [];
      const video = samples[0]?.video;
      if (!video) {
        console.warn('[video/poll] No video in samples:', JSON.stringify(samples).slice(0, 500));
        return NextResponse.json({ status: 'failed', error: 'No video in Veo response' });
      }
      console.log(`[video/poll] Video object keys:`, Object.keys(video));
      let url: string | undefined;
      const opId = operationName.split('/').pop() ?? taskId;
      const cacheDir = join(process.cwd(), 'public', 'veo-cache');
      if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

      if (video.uri?.startsWith('http')) {
        // Veo URIs require the API key — download server-side and cache.
        const filename = `${opId}.mp4`;
        const filepath = join(cacheDir, filename);
        if (!existsSync(filepath)) {
          // The download URL accepts ?key= for auth
          const sep = video.uri.includes('?') ? '&' : '?';
          const downloadUrl = `${video.uri}${sep}key=${googleKey}`;
          const dl = await fetch(downloadUrl);
          if (!dl.ok) {
            console.warn(`[video/poll] Download failed ${dl.status}: ${await dl.text()}`);
            return NextResponse.json({ status: 'failed', error: `Download failed ${dl.status}` });
          }
          const buf = Buffer.from(await dl.arrayBuffer());
          writeFileSync(filepath, buf);
          console.log(`[video/poll] Downloaded ${buf.byteLength} bytes from Veo URI to ${filepath}`);
        }
        url = `/veo-cache/${filename}`;
      } else if (video.videoBytes) {
        const mime = video.mimeType ?? 'video/mp4';
        const ext = mime.includes('webm') ? 'webm' : 'mp4';
        const filename = `${opId}.${ext}`;
        const filepath = join(cacheDir, filename);
        const buf = Buffer.from(video.videoBytes, 'base64');
        writeFileSync(filepath, buf);
        console.log(`[video/poll] Wrote ${buf.byteLength} bytes to ${filepath}`);
        url = `/veo-cache/${filename}`;
      } else {
        console.warn('[video/poll] Video has neither uri nor videoBytes:', JSON.stringify(video).slice(0, 300));
      }
      return NextResponse.json({ status: 'complete', url });
    } catch (err) {
      console.warn('[video/poll] Veo 3 threw:', err);
      return NextResponse.json({ status: 'failed', error: String(err) });
    }
  }
  // ── BytePlus polling ───────────────────────────────────────────────────────

  const keys = getSeedanceKeys();

  if (keys.length === 0) {
    return NextResponse.json({ error: 'No SEEDANCE_API_KEY configured' }, { status: 500 });
  }

  for (const key of keys) {
    try {
      const res = await fetch(`${BYTEPLUS_BASE}/contents/generations/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${key}` },
      });

      if (res.ok) {
        const data = await res.json() as {
          status: string;
          content?: { video_url?: string };
          error?: { code: string; message: string };
        };

        // Normalise status for VideoStudio
        const rawStatus = data.status;
        const normStatus =
          rawStatus === 'succeeded' ? 'complete' :
          rawStatus === 'failed' || rawStatus === 'expired' || rawStatus === 'cancelled' ? 'failed' :
          'processing'; // queued | running

        return NextResponse.json({
          status: normStatus,
          url: data.content?.video_url,
          error: data.error?.message,
        });
      }

      // Task owned by a different key → try next
      if (res.status === 404 || res.status === 401 || res.status === 403) continue;

      return NextResponse.json({ error: `BytePlus poll error ${res.status}` }, { status: res.status });
    } catch (err) {
      console.warn(`[video/poll] key ...${key.slice(-6)} threw:`, err);
    }
  }

  return NextResponse.json({ error: 'Could not poll task with any configured key' }, { status: 502 });
}
