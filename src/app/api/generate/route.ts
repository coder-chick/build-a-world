import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ProductWorld } from '@/types/productWorld';
import { runProductStrategyAgent } from '@/agents/core/productStrategyAgent';
import { runCustomizationAgent } from '@/agents/core/customizationAgent';
import { runStyleAgent } from '@/agents/core/styleAgent';
import { runVisualPromptAgent } from '@/agents/visuals/visualPromptAgent';
import { runVideoPromptAgent } from '@/agents/visuals/videoPromptAgent';
import { runGTMAgent } from '@/agents/gtm/gtmAgent';
import { runSocialAgent } from '@/agents/gtm/socialAgent';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { prompt, theme = 'dark' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    console.log('[generate] Step 1: Product Strategy...');
    const productOverview = await runProductStrategyAgent(prompt);
    console.log('[generate] Step 1 done:', productOverview.productName);

    console.log('[generate] Step 2: Customization + Styles...');
    const [customizationSystem, styles] = await Promise.all([
      runCustomizationAgent(productOverview),
      runStyleAgent(productOverview),
    ]);
    console.log('[generate] Step 2 done: %d components, %d styles', customizationSystem.components.length, styles.length);

    const selectedStyle = styles[0]?.name ?? 'Futurist';
    const selectedComponents: Record<string, string> = {};
    for (const comp of customizationSystem.components) {
      selectedComponents[comp.name] = comp.options[0]?.name ?? '';
    }

    console.log('[generate] Step 3: Visual + Video prompts...');
    const [visualSystem, videoSystem] = await Promise.all([
      runVisualPromptAgent(productOverview, selectedStyle),
      runVideoPromptAgent(productOverview, selectedStyle),
    ]);
    console.log('[generate] Step 3 done');

    console.log('[generate] Step 4: GTM...');
    const gtmKit = await runGTMAgent(productOverview);
    console.log('[generate] Step 4 done');

    console.log('[generate] Step 5: Social...');
    const social = await runSocialAgent(gtmKit);
    console.log('[generate] Step 5 done — assembling response');

    const productWorld: ProductWorld = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      userPrompt: prompt,
      theme,
      productOverview,
      customizationSystem,
      styles,
      selectedStyle,
      selectedComponents,
      visualSystem: {
        ...visualSystem,
        productViewImageUrl: '',
        knollingViewImageUrl: '',
        explodedViewImageUrl: '',
        imageGenStatus: 'idle' as const,
      },
      videoSystem,
      gtmKit,
      social,
    };

    return NextResponse.json(productWorld);
  } catch (error) {
    console.error('[API /generate]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
