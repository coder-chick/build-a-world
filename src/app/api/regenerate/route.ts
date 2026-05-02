// ─────────────────────────────────────────────────────────────────────────────
// Server-side API route — regenerates only visuals/video after a style change.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { regenerateVisuals } from '@/agents/orchestratorAgent';
import { ProductWorld } from '@/types/productWorld';

export async function POST(req: NextRequest) {
  try {
    const { productWorld, newStyle, newComponents } = (await req.json()) as {
      productWorld: ProductWorld;
      newStyle?: string;
      newComponents?: Record<string, string>;
    };

    if (!productWorld) {
      return NextResponse.json({ error: 'productWorld is required' }, { status: 400 });
    }

    const updated = await regenerateVisuals(productWorld, newStyle, newComponents);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
