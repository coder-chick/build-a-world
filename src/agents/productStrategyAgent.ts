// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ProductStrategyAgent — converts a raw product idea into a structured brief.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { PRODUCT_STRATEGY_SYSTEM, PRODUCT_STRATEGY_USER } from '@/utils/promptTemplates';
import { MOCK_PRODUCT_WORLD } from '@/utils/mockData';

export async function runProductStrategyAgent(idea: string): Promise<ProductOverview> {
  const raw = await callLLM(PRODUCT_STRATEGY_SYSTEM, PRODUCT_STRATEGY_USER(idea));
  if (raw === '__MOCK__') return MOCK_PRODUCT_WORLD.productOverview;

  const parsed = parseJSON<ProductOverview>(raw);
  if (!parsed) {
    console.warn('[ProductStrategyAgent] JSON parse failed — using mock');
    return MOCK_PRODUCT_WORLD.productOverview;
  }
  return parsed;
}
