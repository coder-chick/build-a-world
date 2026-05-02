// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 2
// Seedance 2.0 video generation service.
// Real API: createVideoTask → pollVideoTask → getVideoResult
// Mock mode: returns a fully-formed mock result after a short delay.
// TODO: fill SEEDANCE_API_KEY in .env.local
// ─────────────────────────────────────────────────────────────────────────────

import { VideoTask, VideoType } from '@/types/productWorld';

const MOCK_MODE = process.env.MOCK_MODE === 'true';
const SEEDANCE_BASE = 'https://api.seedance.ai/v1'; // TODO: confirm base URL

export interface SeedanceTaskResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  url?: string;
}

// ── Real API ──────────────────────────────────────────────────────────────────

export async function createVideoTask(prompt: string): Promise<{ taskId: string }> {
  const key = process.env.SEEDANCE_API_KEY;
  if (!key) throw new Error('SEEDANCE_API_KEY not set');

  const res = await fetch(`${SEEDANCE_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      prompt,
      duration: 30,
      resolution: '1080p',
      loop: true,
    }),
  });
  if (!res.ok) throw new Error(`Seedance create task error ${res.status}`);
  const data = await res.json();
  return { taskId: data.task_id as string };
}

export async function pollVideoTask(taskId: string): Promise<SeedanceTaskResponse> {
  const key = process.env.SEEDANCE_API_KEY;
  if (!key) throw new Error('SEEDANCE_API_KEY not set');

  const res = await fetch(`${SEEDANCE_BASE}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Seedance poll error ${res.status}`);
  const data = await res.json();
  return {
    taskId,
    status: data.status,
    url: data.video_url,
  };
}

export async function getVideoResult(taskId: string): Promise<{ url: string }> {
  const result = await pollVideoTask(taskId);
  if (result.status !== 'complete' || !result.url) {
    throw new Error('Video not complete yet');
  }
  return { url: result.url };
}

// ── Mock Mode ─────────────────────────────────────────────────────────────────

export async function mockVideoTask(
  type: VideoType,
  prompt: string
): Promise<VideoTask> {
  // Simulate a 3-second generation delay
  await new Promise((r) => setTimeout(r, 3000));

  return {
    id: `mock-task-${Date.now()}`,
    type,
    prompt,
    status: 'complete',
    // Demo placeholder thumbnail — replace with real poster image if desired
    thumbnailUrl: `https://placehold.co/640x360/0F1117/6EE7F7?text=${encodeURIComponent(type.toUpperCase() + ' VIDEO')}`,
    url: undefined, // no real URL in mock mode
  };
}

// ── Unified entry point used by VideoStudio ───────────────────────────────────

export async function generateVideo(
  type: VideoType,
  prompt: string
): Promise<VideoTask> {
  if (MOCK_MODE) {
    return mockVideoTask(type, prompt);
  }

  try {
    const { taskId } = await createVideoTask(prompt);

    // Poll every 5s up to 3 minutes
    for (let i = 0; i < 36; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const result = await pollVideoTask(taskId);
      if (result.status === 'complete' && result.url) {
        return { id: taskId, type, prompt, status: 'complete', url: result.url };
      }
      if (result.status === 'failed') {
        break;
      }
    }
    return { id: `${Date.now()}`, type, prompt, status: 'failed' };
  } catch {
    console.warn('[seedanceService] Real API failed — falling back to mock');
    return mockVideoTask(type, prompt);
  }
}
