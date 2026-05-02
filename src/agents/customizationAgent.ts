// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// CustomizationAgent — generates product component dropdown options.
// ─────────────────────────────────────────────────────────────────────────────

import { CustomizationSystem, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { CUSTOMIZATION_SYSTEM, CUSTOMIZATION_USER } from '@/utils/promptTemplates';
export async function runCustomizationAgent(
  overview: ProductOverview
): Promise<CustomizationSystem> {
  const raw = await callLLM(
    CUSTOMIZATION_SYSTEM,
    CUSTOMIZATION_USER(overview.productName, overview.coreUseCase)
  );
  if (raw === '__MOCK__') throw new Error('[CustomizationAgent] LLM call failed — no API key available');

  const parsed = parseJSON<CustomizationSystem>(raw);
  if (!parsed) throw new Error('[CustomizationAgent] Failed to parse LLM response');
  return parsed;
}
