// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// VisualPromptAgent — generates Product, Knolling, Exploded image prompts.
// ─────────────────────────────────────────────────────────────────────────────

import { VisualSystem, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { VISUAL_PROMPT_SYSTEM, VISUAL_PROMPT_USER } from '@/utils/promptTemplates';
import { MOCK_PRODUCT_WORLD } from '@/utils/mockData';

interface VisualPromptOutput {
  productViewPrompt: string;
  knollingViewPrompt: string;
  explodedViewPrompt: string;
  componentPrompts: string[];
}

export async function runVisualPromptAgent(
  overview: ProductOverview,
  selectedStyle: string
): Promise<VisualSystem> {
  const raw = await callLLM(
    VISUAL_PROMPT_SYSTEM,
    VISUAL_PROMPT_USER(overview.productName, selectedStyle, overview.coreUseCase)
  );

  const base = MOCK_PRODUCT_WORLD.visualSystem;

  if (raw === '__MOCK__') return { ...base, currentView: 'product' };

  const parsed = parseJSON<VisualPromptOutput>(raw);
  if (!parsed) {
    console.warn('[VisualPromptAgent] JSON parse failed — using mock');
    return { ...base, currentView: 'product' };
  }

  return {
    currentView: 'product',
    productViewPrompt: parsed.productViewPrompt,
    knollingViewPrompt: parsed.knollingViewPrompt,
    explodedViewPrompt: parsed.explodedViewPrompt,
    componentPrompts: parsed.componentPrompts,
  };
}
