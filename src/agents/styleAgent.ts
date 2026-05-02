// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// StyleAgent — generates 9 visual style directions for the product.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductStyle, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { STYLE_SYSTEM, STYLE_USER } from '@/utils/promptTemplates';
import { MOCK_PRODUCT_WORLD } from '@/utils/mockData';

interface StyleAgentOutput {
  styles: ProductStyle[];
}

export async function runStyleAgent(overview: ProductOverview): Promise<ProductStyle[]> {
  const raw = await callLLM(STYLE_SYSTEM, STYLE_USER(overview.productName));
  if (raw === '__MOCK__') return MOCK_PRODUCT_WORLD.styles;

  const parsed = parseJSON<StyleAgentOutput>(raw);
  if (!parsed?.styles?.length) {
    console.warn('[StyleAgent] JSON parse failed — using mock');
    return MOCK_PRODUCT_WORLD.styles;
  }
  return parsed.styles;
}
