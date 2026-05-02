// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 3
// SocialAgent — selects the best Twitter post, runs A/B simulation,
// generates mock engagement metrics.
// ─────────────────────────────────────────────────────────────────────────────

import { Social, GTMKit } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { SOCIAL_SYSTEM, SOCIAL_USER } from '@/utils/promptTemplates';
import { MOCK_PRODUCT_WORLD } from '@/utils/mockData';

interface SocialOutput {
  selectedPost: string;
  abTestWinner: 'A' | 'B';
  mockMetrics: Social['mockMetrics'];
}

export async function runSocialAgent(gtmKit: GTMKit): Promise<Social> {
  const { abTestingPlan } = gtmKit;
  const aTotal =
    abTestingPlan.variantA.engagementRate +
    abTestingPlan.variantA.clickIntent +
    abTestingPlan.variantA.shareabilityScore;
  const bTotal =
    abTestingPlan.variantB.engagementRate +
    abTestingPlan.variantB.clickIntent +
    abTestingPlan.variantB.shareabilityScore;

  const raw = await callLLM(
    SOCIAL_SYSTEM,
    SOCIAL_USER(gtmKit.twitterPosts, aTotal, bTotal)
  );

  if (raw === '__MOCK__') return MOCK_PRODUCT_WORLD.social;

  const parsed = parseJSON<SocialOutput>(raw);
  if (!parsed) {
    console.warn('[SocialAgent] JSON parse failed — using mock');
    return MOCK_PRODUCT_WORLD.social;
  }

  return {
    selectedPost:   parsed.selectedPost ?? gtmKit.twitterPosts[0],
    postedStatus:   'idle',
    mockMetrics:    parsed.mockMetrics ?? MOCK_PRODUCT_WORLD.social.mockMetrics,
    abTestWinner:   parsed.abTestWinner ?? (bTotal > aTotal ? 'B' : 'A'),
  };
}
