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
    <div className="prompt-card opacity-0 w-full max-w-2xl mx-auto">
      {/* Textarea */}
      <div className="
        relative rounded-2xl border border-white/10
        bg-white/5 dark:bg-white/5
        shadow-glass backdrop-blur-sm
        focus-within:border-accent/60 transition-all duration-300
      ">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleBuild();
          }}
          placeholder="Describe your product idea…&#10;e.g. &quot;Create a smart temperature and humidity sensor for modern homes&quot;"
          rows={4}
          className="
            w-full bg-transparent resize-none
            px-5 pt-5 pb-3
            text-white placeholder-white/30
            text-base leading-relaxed
            focus:outline-none
            rounded-2xl
          "
        />

        {/* Build button */}
        <div className="flex justify-end px-4 pb-4">
          <button
            ref={buttonRef}
            onClick={handleBuild}
            disabled={loading || !prompt.trim()}
            className="
              px-6 py-2.5 rounded-full
              bg-accent text-surface-dark dark:bg-accent dark:text-surface-dark
              font-semibold text-sm
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:scale-105 active:scale-95
              transition-transform duration-150
              shadow-neon
            "
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-surface-dark border-t-transparent rounded-full animate-spin" />
                Building…
              </span>
            ) : (
              '⚡ Build My World'
            )}
          </button>
        </div>
      </div>

      {/* Example prompt chips */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {EXAMPLE_PROMPTS.map((ex) => (
          <button
            key={ex}
            onClick={() => setPrompt(ex)}
            className="
              px-3 py-1.5 rounded-full text-xs
              border border-white/10
              bg-white/5 hover:bg-white/10
              text-white/60 hover:text-white
              transition-all duration-200
              text-left
            "
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
