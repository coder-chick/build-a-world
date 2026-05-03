import { NextRequest, NextResponse } from 'next/server';
import { pollVideoTask } from '@/services/seedanceService';
import { pollVeoTask } from '@/services/veoService';

export const maxDuration = 15;

function isVeoOperation(taskId: string): boolean {
  return taskId.startsWith('projects/');
}

export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId query parameter is required' },
        { status: 400 }
      );
    }

    if (isVeoOperation(taskId)) {
      const result = await pollVeoTask(taskId);
      return NextResponse.json({
        status: result.status === 'complete' ? 'complete'
              : result.status === 'failed' ? 'failed'
              : 'processing',
        url: result.videoUrl || null,
        error: result.error || null,
        provider: 'veo',
      });
    }

    // Default: Seedance
    const result = await pollVideoTask(taskId);
    return NextResponse.json({ ...result, provider: 'seedance' });
  } catch (error) {
    console.error('[video/status]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check video status' },
      { status: 500 }
    );
  }
}
