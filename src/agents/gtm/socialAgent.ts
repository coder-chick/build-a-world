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

  const fallbackSocial: SocialOutput = {
    selectedPost: gtmKit.twitterPosts[0] ?? 'The future of running just dropped. Adaptive cushioning, neon LED accents, and nanofiber knit — this sneaker reads the streets beneath your feet. 🚀',
    abTestWinner: bTotal > aTotal ? 'B' : 'A',
    mockMetrics: { impressions: 24800, likes: 1890, reposts: 534, replies: 167, clickIntent: 4.5, shareabilityScore: 4.3 },
  };

  if (raw === '__MOCK__') {
    console.warn('[SocialAgent] Using fallback');
    return { selectedPost: fallbackSocial.selectedPost, postedStatus: 'idle' as const, mockMetrics: fallbackSocial.mockMetrics, abTestWinner: fallbackSocial.abTestWinner };
  }

  const parsed = parseJSON<SocialOutput>(raw);
  if (!parsed) {
    console.warn('[SocialAgent] Parse failed, using fallback');
    return { selectedPost: fallbackSocial.selectedPost, postedStatus: 'idle' as const, mockMetrics: fallbackSocial.mockMetrics, abTestWinner: fallbackSocial.abTestWinner };
  }

  const defaultMetrics: Social['mockMetrics'] = { impressions: 0, likes: 0, reposts: 0, replies: 0, clickIntent: 0, shareabilityScore: 0 };
  return {
    selectedPost:   parsed.selectedPost ?? gtmKit.twitterPosts[0],
    postedStatus:   'idle',
    mockMetrics:    parsed.mockMetrics ?? defaultMetrics,
    abTestWinner:   parsed.abTestWinner ?? (bTotal > aTotal ? 'B' : 'A'),
  };
}
