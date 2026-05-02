'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// PromptInput — landing page input box with example prompt chips.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import anime from 'animejs';
import { EXAMPLE_PROMPTS } from '@/utils/mockData';

export default function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Entrance animation
  useEffect(() => {
    anime({
      targets: '.prompt-card',
      translateY: [40, 0],
      opacity:   [0, 1],
      easing:    'easeOutExpo',
      duration:  800,
      delay:     300,
    });
  }, []);

  const handleBuild = async () => {
    if (!prompt.trim()) return;

    // Button pulse animation
    if (buttonRef.current) {
      anime({
        targets:   buttonRef.current,
        scale:     [1, 0.95, 1],
        duration:  300,
        easing:    'easeInOutQuad',
      });
    }

    setLoading(true);

    // Store the prompt and navigate to builder
    sessionStorage.setItem('baw_pending_prompt', prompt.trim());
    router.push('/builder');
  };

  return (
    <div className="prompt-card opacity-0 w-full max-w-2xl mx-auto flex flex-col gap-4">

      {/* ── Search-style textarea card ───────────────────────── */}
      <div
        className="relative rounded-3xl transition-all duration-300 overflow-hidden"
        style={{
          background: 'rgb(var(--color-card))',
          border: '1.5px solid rgb(var(--color-border) / 0.12)',
          boxShadow: '0 2px 12px rgb(0 0 0 / 0.06)',
        }}
        onFocus={() => {}}
      >
        {/* Top: textarea */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleBuild();
          }}
          placeholder="Describe your product idea…"
          rows={3}
          className="w-full bg-transparent resize-none px-6 pt-5 pb-2 text-fg placeholder-fg-muted text-base leading-relaxed focus:outline-none"
          style={{ color: 'rgb(var(--color-fg))', caretColor: '#06B6D4' }}
        />

        {/* Bottom toolbar */}
        <div
          className="flex items-center justify-between px-4 pb-3 pt-1"
          style={{ borderTop: '1px solid rgb(var(--color-border) / 0.06)' }}
        >
          <span className="text-xs" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            ⌘↵ to build
          </span>
          <button
            ref={buttonRef}
            onClick={handleBuild}
            disabled={loading || !prompt.trim()}
            className="btn-accent"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white"
                  style={{ animation: 'spin 0.7s linear infinite' }}
                />
                Building…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span>⚡</span>
                <span>Build My World</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Example chips ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 justify-center">
        {EXAMPLE_PROMPTS.map((ex) => (
          <button
            key={ex}
            onClick={() => setPrompt(ex)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: 'rgb(var(--color-border) / 0.06)',
              border: '1px solid rgb(var(--color-border) / 0.1)',
              color: 'rgb(var(--color-fg-muted))',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgb(var(--color-border) / 0.12)';
              e.currentTarget.style.color = 'rgb(var(--color-fg))';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgb(var(--color-border) / 0.06)';
              e.currentTarget.style.color = 'rgb(var(--color-fg-muted))';
            }}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

