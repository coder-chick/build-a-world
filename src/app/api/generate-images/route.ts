import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/services/imaRouterService';

export const maxDuration = 300;

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWithRetry(
  prompt: string,
  options: Parameters<typeof generateImage>[1],
  label: string
): Promise<string | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = await generateImage(prompt, options);
      if (url) {
        console.log(`[generate-images] ${label}: OK (attempt ${attempt})`);
        return url;
      }
      console.warn(`[generate-images] ${label}: empty result (attempt ${attempt})`);
    } catch (e) {
      console.error(`[generate-images] ${label} failed (attempt ${attempt}):`, (e as Error).message);
    }
    if (attempt < MAX_RETRIES) {
      await delay(RETRY_DELAY_MS);
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { productPrompt, knollingPrompt, explodedPrompt, referenceImageUrl } = await req.json();

    if (!productPrompt && !knollingPrompt && !explodedPrompt) {
      return NextResponse.json({ error: 'At least one prompt is required' }, { status: 400 });
    }

    // Step 1: high-quality product image (with retry), or use provided reference
    let productViewImageUrl: string | null = referenceImageUrl || null;
    if (productPrompt) {
      productViewImageUrl = await generateWithRetry(
        productPrompt,
        { model: 'gemini-3-pro-image-preview', aspectRatio: '1:1', size: '1K' },
        'Product'
      );
    }

    // Step 2: knolling + exploded in parallel (with retry), using product as reference
    const [knollingViewImageUrl, explodedViewImageUrl] = await Promise.all([
      knollingPrompt
        ? generateWithRetry(
            knollingPrompt,
            { model: 'gemini-3.1-flash-image-preview', aspectRatio: '1:1', size: '1K', referenceImageUrl: productViewImageUrl ?? undefined },
            'Knolling'
          )
        : Promise.resolve(null),
      explodedPrompt
        ? generateWithRetry(
            explodedPrompt,
            { model: 'gemini-3.1-flash-image-preview', aspectRatio: '1:1', size: '1K', referenceImageUrl: productViewImageUrl ?? undefined },
            'Exploded'
          )
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      productViewImageUrl: productViewImageUrl ?? '',
      knollingViewImageUrl: knollingViewImageUrl ?? '',
      explodedViewImageUrl: explodedViewImageUrl ?? '',
    });
  } catch (error) {
    console.error('[API /generate-images]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image generation failed' },
      { status: 500 }
    );
  }
}
