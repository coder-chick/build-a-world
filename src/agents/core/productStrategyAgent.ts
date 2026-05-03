// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ProductStrategyAgent — converts a raw product idea into a structured brief.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { PRODUCT_STRATEGY_SYSTEM, PRODUCT_STRATEGY_USER } from '@/utils/promptTemplates';
const FALLBACK_OVERVIEW: ProductOverview = {
  productName: 'NeonStride X1',
  tagline: 'Run the Future, Own the Streets',
  targetUser: 'Urban runners and sneaker enthusiasts who demand performance and style',
  coreUseCase: 'A futuristic running sneaker with adaptive cushioning, breathable nanofiber upper, and integrated LED accent lighting for urban night runners',
  keyFeatures: [
    'Adaptive cushioning system that adjusts to terrain',
    'Breathable self-cleaning nanofiber knit upper',
    'Integrated LED light-pipe accents for night visibility',
    'Responsive energy-return foam midsole',
    'Smart chip for real-time performance tracking',
  ],
  breakthroughInnovation: 'Self-adjusting midsole density that reads terrain in real time via embedded micro-sensors',
};

export async function runProductStrategyAgent(idea: string): Promise<ProductOverview> {
  const raw = await callLLM(PRODUCT_STRATEGY_SYSTEM, PRODUCT_STRATEGY_USER(idea));
  if (raw === '__MOCK__') {
    console.warn('[ProductStrategyAgent] Using sneaker fallback');
    return FALLBACK_OVERVIEW;
  }

  const parsed = parseJSON<ProductOverview>(raw);
  if (!parsed) {
    console.warn('[ProductStrategyAgent] Parse failed, using sneaker fallback');
    return FALLBACK_OVERVIEW;
  }
  return parsed;
}
