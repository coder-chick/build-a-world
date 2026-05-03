import { NextRequest, NextResponse } from 'next/server';
import { publishPost } from '@/services/twitterService';

export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json() as { text: string };

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Tweet text is required' }, { status: 400 });
    }

    if (text.length > 280) {
      return NextResponse.json({ error: 'Tweet exceeds 280 characters' }, { status: 400 });
    }

    console.log('[twitter/post] Posting tweet...');
    const result = await publishPost(text);
    console.log('[twitter/post] Result:', result.success ? 'posted' : 'mock/fallback');

    return NextResponse.json(result);
  } catch (error) {
    console.error('[twitter/post]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to post tweet' },
      { status: 500 }
    );
  }
}
