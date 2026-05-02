// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// StyleAgent — generates 9 visual style directions for the product.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductStyle, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { STYLE_SYSTEM, STYLE_USER } from '@/utils/promptTemplates';
interface StyleAgentOutput {
  styles: ProductStyle[];
}

export async function runStyleAgent(overview: ProductOverview): Promise<ProductStyle[]> {
  const raw = await callLLM(STYLE_SYSTEM, STYLE_USER(overview.productName));
  if (raw === '__MOCK__') throw new Error('[StyleAgent] LLM call failed — no API key available');

  const parsed = parseJSON<StyleAgentOutput>(raw);
  if (!parsed?.styles?.length) throw new Error('[StyleAgent] Failed to parse LLM response');
  return parsed.styles;
}
