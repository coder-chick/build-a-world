// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// CustomizationAgent — generates product component dropdown options.
// ─────────────────────────────────────────────────────────────────────────────

import { CustomizationSystem, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { CUSTOMIZATION_SYSTEM, CUSTOMIZATION_USER } from '@/utils/promptTemplates';
import { MOCK_PRODUCT_WORLD } from '@/utils/mockData';

export async function runCustomizationAgent(
  overview: ProductOverview
): Promise<CustomizationSystem> {
  const raw = await callLLM(
    CUSTOMIZATION_SYSTEM,
    CUSTOMIZATION_USER(overview.productName, overview.coreUseCase)
  );
  if (raw === '__MOCK__') return MOCK_PRODUCT_WORLD.customizationSystem;

  const parsed = parseJSON<CustomizationSystem>(raw);
  if (!parsed) {
    console.warn('[CustomizationAgent] JSON parse failed — using mock');
    return MOCK_PRODUCT_WORLD.customizationSystem;
  }
  return parsed;
}
