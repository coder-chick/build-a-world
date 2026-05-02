'use server';

// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 2
// Seedance 2.0 video generation service.
// Real API: createVideoTask → pollVideoTask → getVideoResult
// Mock mode: returns a fully-formed mock result after a short delay.
// TODO: fill SEEDANCE_API_KEY in .env.local
// ─────────────────────────────────────────────────────────────────────────────

import { VideoTask, VideoType } from '@/types/productWorld';

const MOCK_MODE = process.env.MOCK_MODE === 'true';
const SEEDANCE_BASE = 'https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks';
const DEFAULT_MODELS: Record<VideoType, string> = {
  hero: 'seedance-1-0-pro-250528',
  action: 'seedance-1-0-pro-250528',
  artistic: 'dreamina-seedance-2-0-260128',
  animated: 'dreamina-seedance-2-0-260128',
  interpolation: 'dreamina-seedance-2-0-260128',
};

export interface SeedanceTaskResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  url?: string;
  error?: string;
}

function getModelForType(type: VideoType, imageUrl?: string): string {
  if (process.env.SEEDANCE_MODEL) return process.env.SEEDANCE_MODEL;
  if (imageUrl) return 'dreamina-seedance-2-0-260128';
  return DEFAULT_MODELS[type];
}

function normalizeStatus(status: string | undefined): SeedanceTaskResponse['status'] {
  switch ((status || '').toUpperCase()) {
    case 'SUBMITTED':
    case 'PENDING':
    case 'QUEUED':
      return 'pending';
    case 'RUNNING':
    case 'PROCESSING':
    case 'IN_PROGRESS':
      return 'processing';
    case 'SUCCEEDED':
    case 'SUCCESS':
    case 'COMPLETED':
    case 'DONE':
    case 'COMPLETE':
      return 'complete';
    case 'FAILED':
    case 'ERROR':
    case 'CANCELLED':
      return 'failed';
    default:
      return 'processing';
  }
}

function extractVideoUrl(data: any): string | undefined {
  return (
    data?.video_url ||
    data?.content?.video_url ||
    data?.output?.video_url ||
    data?.result?.video_url ||
    data?.data?.video_url ||
    data?.videoUrl ||
    data?.output?.url ||
    data?.result?.url
  );
}

// ── Real API ──────────────────────────────────────────────────────────────────

export async function createVideoTask(
  type: VideoType,
  prompt: string,
  imageUrl?: string,
  endImageUrl?: string
): Promise<{ taskId: string }> {
  const key = process.env.SEEDANCE_API_KEY;
  if (!key) throw new Error('SEEDANCE_API_KEY not set');

  const content: Array<Record<string, unknown>> = [
    {
      type: 'text',
      text: prompt,
    },
  ];

  if (imageUrl) {
    content.push({
      type: 'image_url',
      image_url: { url: imageUrl },
      role: 'first_frame',
    });
  }
  
  if (endImageUrl) {
    content.push({
      type: 'image_url',
      image_url: { url: endImageUrl },
      role: 'last_frame',
    });
  }

  const payload = {
    model: getModelForType(type, imageUrl),
    content,
  };

  const res = await fetch(SEEDANCE_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Seedance create task error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return { taskId: (data?.id || data?.task_id || data?.taskId) as string };
}

export async function pollVideoTask(taskId: string): Promise<SeedanceTaskResponse> {
  const key = process.env.SEEDANCE_API_KEY;
  if (!key) throw new Error('SEEDANCE_API_KEY not set');

  const res = await fetch(`${SEEDANCE_BASE}/${taskId}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Seedance poll error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    taskId,
    status: normalizeStatus(data?.status || data?.state || data?.task_status),
    url: extractVideoUrl(data),
    error: data?.error?.message || data?.message,
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
  prompt: string,
  imageUrl?: string,
  endImageUrl?: string
): Promise<VideoTask> {
  // Simulate a 3-second generation delay
  await new Promise((r) => setTimeout(r, 3000));

  return {
    id: `mock-task-${Date.now()}`,
    type,
    prompt,
    imageUrl,
    endImageUrl,
    status: 'complete',
    // Demo placeholder thumbnail — replace with real poster image if desired
    thumbnailUrl: imageUrl || `https://placehold.co/640x360/0F1117/6EE7F7?text=${encodeURIComponent(type.toUpperCase() + ' VIDEO')}`,
    url: undefined, // no real URL in mock mode
  };
}

// ── Unified entry point used by VideoStudio ───────────────────────────────────

export async function generateVideo(
  type: VideoType,
  prompt: string,
  imageUrl?: string,
  endImageUrl?: string
): Promise<VideoTask> {
  if (MOCK_MODE) {
    return mockVideoTask(type, prompt, imageUrl, endImageUrl);
  }

  try {
    const { taskId } = await createVideoTask(type, prompt, imageUrl, endImageUrl);

    if (!taskId) {
      throw new Error('Seedance create task did not return a task id');
    }

    // Poll every 5s up to 3 minutes
    for (let i = 0; i < 36; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const result = await pollVideoTask(taskId);
      if (result.status === 'complete' && result.url) {
        return { id: taskId, type, prompt, imageUrl, endImageUrl, status: 'complete', url: result.url };
      }
      if (result.status === 'failed') {
        return {
          id: taskId,
          type,
          prompt,
          imageUrl,
          status: 'failed',
          errorMessage: result.error || 'Seedance task failed',
        };
      }
    }
    return {
      id: `${Date.now()}`,
      type,
      prompt,
      imageUrl,
      status: 'failed',
      errorMessage: 'Timed out waiting for Seedance to finish generating the video',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Seedance error';
    console.error('[seedanceService] Real API failed', error);
    return {
      id: `${Date.now()}`,
      type,
      prompt,
      imageUrl,
      status: 'failed',
      errorMessage: message,
    };
  }
}
