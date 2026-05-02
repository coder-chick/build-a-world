// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 3
// SocialAgent — selects the best Twitter post, runs A/B simulation,
// generates mock engagement metrics.
// ─────────────────────────────────────────────────────────────────────────────

import { Social, GTMKit } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { SOCIAL_SYSTEM, SOCIAL_USER } from '@/utils/promptTemplates';
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

  if (raw === '__MOCK__') throw new Error('[SocialAgent] LLM call failed — no API key available');

  const parsed = parseJSON<SocialOutput>(raw);
  if (!parsed) throw new Error('[SocialAgent] Failed to parse LLM response');

  const defaultMetrics: Social['mockMetrics'] = { impressions: 0, likes: 0, reposts: 0, replies: 0, clickIntent: 0, shareabilityScore: 0 };
  return {
    selectedPost:   parsed.selectedPost ?? gtmKit.twitterPosts[0],
    postedStatus:   'idle',
    mockMetrics:    parsed.mockMetrics ?? defaultMetrics,
    abTestWinner:   parsed.abTestWinner ?? (bTotal > aTotal ? 'B' : 'A'),
  };
}
