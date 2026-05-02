// ─────────────────────────────────────────────────────────────────────────────
// Server-side API route — generates a full ProductWorld via all agents.
// Runs on the server so process.env API keys are available.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { generateProductWorld } from '@/agents/orchestratorAgent';

export async function POST(req: NextRequest) {
  try {
    const { prompt, theme } = (await req.json()) as {
      prompt: string;
      theme?: 'light' | 'dark';
    };

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const productWorld = await generateProductWorld(prompt.trim(), theme ?? 'light');
    return NextResponse.json(productWorld);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
