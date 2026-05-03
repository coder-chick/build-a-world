import { NextRequest, NextResponse } from 'next/server';
import { createVideoTask } from '@/services/seedanceService';
import { createVeoTask } from '@/services/veoService';
import { VideoType } from '@/types/productWorld';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { type, prompt, imageUrl } = await req.json() as {
      type: VideoType;
      prompt: string;
      imageUrl?: string;
    };

    if (!type || !prompt) {
      return NextResponse.json(
        { error: 'type and prompt are required' },
        { status: 400 }
      );
    }

    // Try Seedance first, fall back to Veo
    try {
      console.log(`[video/start] Trying Seedance for ${type}...`);
      const { taskId } = await createVideoTask(type, prompt, imageUrl);
      console.log(`[video/start] Seedance ${type} task: ${taskId}`);
      return NextResponse.json({ taskId, provider: 'seedance' });
    } catch (seedanceErr) {
      console.warn(`[video/start] Seedance failed for ${type}:`, (seedanceErr as Error).message);
    }

    // Fallback: Veo
    try {
      console.log(`[video/start] Falling back to Veo for ${type}...`);
      const { operationName } = await createVeoTask(prompt, imageUrl);
      console.log(`[video/start] Veo ${type} operation: ${operationName}`);
      return NextResponse.json({ taskId: operationName, provider: 'veo' });
    } catch (veoErr) {
      console.error(`[video/start] Veo also failed for ${type}:`, (veoErr as Error).message);
      throw veoErr;
    }
  } catch (error) {
    console.error('[video/start]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start video task' },
      { status: 500 }
    );
  }
}
