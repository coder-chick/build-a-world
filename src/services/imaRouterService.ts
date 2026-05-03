'use server';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// IMA Router Image Generation Service
// Async workflow: POST to submit → GET to poll until succeeded/failed
// ─────────────────────────────────────────────────────────────────────────────

const IMA_BASE = 'https://api.imarouter.com';

type ImageModel = 'gemini-3-pro-image-preview' | 'gemini-3.1-flash-image-preview';
type AspectRatio = '1:1' | '3:2' | '2:3' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';
type ImageSize = '512px' | '1K' | '2K' | '4K';

export interface ImageGenerationOptions {
  model?: ImageModel;
  aspectRatio?: AspectRatio;
  size?: ImageSize;
  referenceImageUrl?: string;
}

export interface ImageTaskResult {
  taskId: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed';
  url: string | null;
}

function getApiKey(): string {
  const key = process.env.IMA_ROUTER_API_KEY;
  if (!key) throw new Error('IMA_ROUTER_API_KEY not set');
  return key;
}

/**
 * Submit an image generation task to IMA Router.
 * Returns the task_id for polling.
 */
export async function submitImageTask(
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<string> {
  const {
    model = 'gemini-3-pro-image-preview',
    aspectRatio = '1:1',
    size = '1K',
    referenceImageUrl,
  } = options;

  const body: Record<string, unknown> = {
    model,
    prompt,
    aspect_ratio: aspectRatio,
    size,
  };

  if (referenceImageUrl) {
    body.image = referenceImageUrl;
  }

  const res = await fetch(`${IMA_BASE}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[IMA Router] Submit failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const taskId = data.task_id || data.id;
  if (!taskId) throw new Error('[IMA Router] No task_id in response');
  return taskId;
}

/**
 * Poll an image task until it reaches a terminal state.
 * Returns the result URL on success.
 */
export async function pollImageTask(
  taskId: string,
  maxAttempts = 20,
  intervalMs = 3000
): Promise<ImageTaskResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${IMA_BASE}/v1/images/generations/${taskId}`, {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    });

    if (!res.ok) {
      if (res.status === 429) {
        await delay(intervalMs * 2);
        continue;
      }
      throw new Error(`[IMA Router] Poll failed (${res.status})`);
    }

    const json = await res.json();
    const data = json.data ?? json;
    const status = data.status;

    if (status === 'succeeded') {
      return { taskId, status: 'succeeded', url: data.url };
    }
    if (status === 'failed') {
      return { taskId, status: 'failed', url: null };
    }

    await delay(intervalMs);
  }

  return { taskId, status: 'processing', url: null };
}

/**
 * Generate an image end-to-end: submit + poll until done.
 */
export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<string | null> {
  const taskId = await submitImageTask(prompt, options);
  const result = await pollImageTask(taskId);
  return result.url;
}

/**
 * Generate multiple images in parallel.
 */
export async function generateImages(
  tasks: Array<{ prompt: string; options?: ImageGenerationOptions }>
): Promise<Array<string | null>> {
  return Promise.all(
    tasks.map(({ prompt, options }) => generateImage(prompt, options))
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
