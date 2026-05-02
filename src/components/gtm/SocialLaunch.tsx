'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 3
// SocialLaunch — A/B test winner display with score bars and mock metrics.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { GTMKit, Social } from '@/types/productWorld';

interface Props {
  gtmKit: GTMKit;
  social: Social;
  posting: boolean;
  onPost: () => void;
}

function ScoreBar({ label, value, max = 10, color = '#6EE7F7' }: {
  label: string; value: number; max?: number; color?: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const pct = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (barRef.current) {
      anime({
        targets:  barRef.current,
        width:    [`0%`, `${pct}%`],
        duration: 800,
        easing:   'easeOutExpo',
        delay:    200,
      });
    }
  }, [pct]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-white/50">
        <span>{label}</span>
        <span className="font-medium text-white/80">{value.toFixed(1)}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/10">
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{ background: color, width: '0%' }}
        />
      </div>
    </div>
  );
}

export default function SocialLaunch({ gtmKit, social, posting, onPost }: Props) {
  const { abTestingPlan } = gtmKit;
  const winner = social.abTestWinner;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">

      {/* ── A/B Test ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
          A/B Testing Simulation
        </p>

        {(['A', 'B'] as const).map((v) => {
          const variant = v === 'A' ? abTestingPlan.variantA : abTestingPlan.variantB;
          const isWinner = winner === v;
          return (
            <div
              key={v}
              className={`
                rounded-2xl p-5 border transition-all duration-300
                ${isWinner
                  ? 'border-accent/60 bg-accent/5 shadow-neon'
                  : 'border-white/10 bg-white/5'}
              `}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-sm font-bold ${isWinner ? 'text-accent' : 'text-white/50'}`}>
                  Variant {v}
                </span>
                {isWinner && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
                    Winner 🏆
                  </span>
                )}
              </div>
              <p className="text-xs text-white/60 mb-1">{variant.positioning}</p>
              <p className="text-[11px] text-white/40 mb-3">{variant.visualStrategy}</p>
              <div className="flex flex-col gap-2">
                <ScoreBar label="Engagement Rate" value={variant.engagementRate} max={10} />
                <ScoreBar label="Click Intent"    value={variant.clickIntent}    max={100} color="#818CF8" />
                <ScoreBar label="Conversion Proxy" value={variant.conversionProxy} max={10} color="#34D399" />
                <ScoreBar label="Shareability"    value={variant.shareabilityScore} max={100} color="#F472B6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Social Post + Mock Metrics ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Selected Post
        </p>

        {/* Post preview card styled like a tweet */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-lg">🌡️</div>
            <div>
              <p className="text-sm font-semibold text-white">Build-A-World</p>
              <p className="text-xs text-white/40">@buildaworld · just now</p>
            </div>
          </div>
          <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line mb-4">
            {social.selectedPost}
          </p>
          <button
            onClick={onPost}
            disabled={posting || social.postedStatus === 'posted'}
            className="
              w-full py-2.5 rounded-xl text-sm font-semibold
              bg-accent text-surface-dark
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-[1.02] active:scale-95
              transition-all duration-200
              shadow-neon
            "
          >
            {posting          ? '⏳ Posting…'
             : social.postedStatus === 'posted' ? '✓ Posted!'
             : '𝕏 Post to Twitter / X'}
          </button>
        </div>

        {/* Mock metrics */}
        {social.postedStatus === 'posted' && (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-400/60 mb-3">
              Mock Engagement
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Impressions', value: social.mockMetrics.impressions.toLocaleString() },
                { label: 'Likes',       value: social.mockMetrics.likes.toLocaleString() },
                { label: 'Reposts',     value: social.mockMetrics.reposts.toLocaleString() },
                { label: 'Replies',     value: social.mockMetrics.replies.toLocaleString() },
                { label: 'Click Intent',value: `${social.mockMetrics.clickIntent}%` },
                { label: 'Shareability',value: `${social.mockMetrics.shareabilityScore}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-lg font-bold text-white">{value}</p>
                  <p className="text-[10px] text-white/40">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
