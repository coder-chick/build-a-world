// ─────────────────────────────────────────────────────────────────────────────
// Veo (Google Vertex AI) video generation service — fallback for Seedance.
// Uses the Vertex AI predictLongRunning / fetchPredictOperation flow.
// Videos are stored in a GCS bucket and served via public URL.
// ─────────────────────────────────────────────────────────────────────────────

const LOCATION = 'us-central1';
const MODEL_ID = 'veo-2.0-generate-001';

function getBaseUrl(): string {
  const projectId = process.env.VEO_PROJECT_ID;
  if (!projectId) throw new Error('VEO_PROJECT_ID not set');
  return `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}`;
}

function getApiKey(): string {
  const key = process.env.VEO_API_KEY;
  if (!key) throw new Error('VEO_API_KEY not set');
  return key;
}

function getBucket(): string {
  const bucket = process.env.VEO_BUCKET;
  if (!bucket) throw new Error('VEO_BUCKET not set');
  return bucket;
}

export interface VeoCreateResult {
  operationName: string;
}

export interface VeoStatusResult {
  status: 'processing' | 'complete' | 'failed';
  videoUrl?: string;
  error?: string;
}

/**
 * Submit a text-to-video generation request. Returns an operation name for polling.
 */
export async function createVeoTask(
  prompt: string,
  _imageUrl?: string
): Promise<VeoCreateResult> {
  const baseUrl = getBaseUrl();
  const apiKey = getApiKey();
  const bucket = getBucket();

  const body: Record<string, unknown> = {
    instances: [{ prompt }],
    parameters: {
      storageUri: `gs://${bucket}/`,
      sampleCount: 1,
      durationSeconds: 5,
    },
  };

  console.log('[veoService] Submitting video task...');
  const res = await fetch(`${baseUrl}:predictLongRunning`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Veo create task error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const operationName = data.name;
  if (!operationName) throw new Error('Veo returned no operation name');

  console.log('[veoService] Operation:', operationName);
  return { operationName };
}

/**
 * Poll a Veo operation for completion. Returns status + video URL when done.
 */
export async function pollVeoTask(operationName: string): Promise<VeoStatusResult> {
  const baseUrl = getBaseUrl();
  const apiKey = getApiKey();

  const res = await fetch(`${baseUrl}:fetchPredictOperation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({ operationName }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Veo poll error ${res.status}: ${text}`);
  }

  const data = await res.json();

  if (data.done === true) {
    if (data.error) {
      return { status: 'failed', error: data.error.message || 'Veo operation failed' };
    }

    const videos = data.response?.videos;
    if (videos?.length > 0) {
      const gcsUri: string = videos[0].gcsUri;
      const publicUrl = gcsUri.replace(
        /^gs:\/\/([^/]+)\//,
        'https://storage.googleapis.com/$1/'
      );
      return { status: 'complete', videoUrl: publicUrl };
    }

    const raiFiltered = data.response?.raiFilteredCount;
    if (raiFiltered && raiFiltered > 0) {
      return { status: 'failed', error: 'Content filtered by safety policy' };
    }

    return { status: 'failed', error: 'No video in response' };
  }

  return { status: 'processing' };
}
