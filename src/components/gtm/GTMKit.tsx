'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 3
// GTMKit — positioning, audience, value prop, and 3 Twitter post cards.
// ─────────────────────────────────────────────────────────────────────────────

import { GTMKit as GTMKitType } from '@/types/productWorld';

interface Props {
  gtmKit: GTMKitType;
  onSelectPost: (post: string) => void;
  onCopy: (text: string) => void;
}

const POST_LABELS = ['Viral', 'Premium', 'Experimental'];
const POST_EMOJIS = ['🔥', '✨', '🧪'];

export default function GTMKit({ gtmKit, onSelectPost, onCopy }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

      {/* ── Positioning + Audience ─────────────────────────────────────────── */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
            Positioning
          </p>
          <p className="text-sm text-white/80 leading-relaxed">{gtmKit.positioning}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
            Target Audience
          </p>
          <p className="text-sm text-white/80 leading-relaxed">{gtmKit.audience}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
            Value Proposition
          </p>
          <p className="text-sm text-white/80 leading-relaxed">{gtmKit.valueProposition}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
            Viral Mechanic
          </p>
          <p className="text-sm text-white/80 leading-relaxed">{gtmKit.viralMechanic}</p>
        </div>
      </div>

      {/* ── Twitter / X Posts ─────────────────────────────────────────────── */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Twitter / X Launch Posts
        </p>
        {gtmKit.twitterPosts.map((post, i) => (
          <div
            key={i}
            className="
              rounded-2xl border border-white/10 bg-white/5 p-5
              flex flex-col gap-3
              hover:border-accent/30 transition-colors duration-200
            "
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{POST_EMOJIS[i] ?? '📝'}</span>
              <span className="text-xs font-semibold text-white/60">{POST_LABELS[i] ?? `Post ${i + 1}`}</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{post}</p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onCopy(post)}
                className="
                  px-3 py-1.5 rounded-lg text-xs font-medium
                  border border-white/10 text-white/50
                  hover:text-white hover:border-white/30
                  transition-all duration-200
                "
              >
                📋 Copy
              </button>
              <button
                onClick={() => onSelectPost(post)}
                className="
                  px-3 py-1.5 rounded-lg text-xs font-medium
                  bg-accent/10 border border-accent/30 text-accent
                  hover:bg-accent/20
                  transition-all duration-200
                "
              >
                𝕏 Post to X
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
