// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// VisualPromptAgent — generates Product, Knolling, Exploded image prompts.
// ─────────────────────────────────────────────────────────────────────────────

import { VisualSystem, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { VISUAL_PROMPT_SYSTEM, VISUAL_PROMPT_USER } from '@/utils/promptTemplates';
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

  if (raw === '__MOCK__') throw new Error('[VisualPromptAgent] LLM call failed — no API key available');

  const parsed = parseJSON<VisualPromptOutput>(raw);
  if (!parsed) throw new Error('[VisualPromptAgent] Failed to parse LLM response');

  return {
    currentView: 'product',
    productViewPrompt: parsed.productViewPrompt,
    knollingViewPrompt: parsed.knollingViewPrompt,
    explodedViewPrompt: parsed.explodedViewPrompt,
    componentPrompts: parsed.componentPrompts,
  };
}
