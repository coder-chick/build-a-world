// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ProductStrategyAgent — converts a raw product idea into a structured brief.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { PRODUCT_STRATEGY_SYSTEM, PRODUCT_STRATEGY_USER } from '@/utils/promptTemplates';
export async function runProductStrategyAgent(idea: string): Promise<ProductOverview> {
  const raw = await callLLM(PRODUCT_STRATEGY_SYSTEM, PRODUCT_STRATEGY_USER(idea));
  if (raw === '__MOCK__') throw new Error('[ProductStrategyAgent] LLM call failed — no API key available');

  const parsed = parseJSON<ProductOverview>(raw);
  if (!parsed) throw new Error('[ProductStrategyAgent] Failed to parse LLM response');
  return parsed;
}
