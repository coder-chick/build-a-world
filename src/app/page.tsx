'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 1 — Landing
// OWNER: TEAM 1
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import PromptInput from '@/components/PromptInput';
import Link from 'next/link';

const FEATURES = [
  {
    icon: '🧠',
    title: '8 AI Agents',
    desc: 'Strategy, customization, style, visual, video, GTM, social, and orchestrator agents work in parallel.',
    color: 'from-cyan-400/20 to-cyan-400/0',
    accent: '#06B6D4',
  },
  {
    icon: '🎨',
    title: 'Creative Clusters',
    desc: 'An interactive dot-map of 9 style directions. Pick a vibe and watch your product transform.',
    color: 'from-violet-400/20 to-violet-400/0',
    accent: '#8B5CF6',
  },
  {
    icon: '🎬',
    title: 'Video Studio',
    desc: 'Seedance 2.0 generates hero, action, artistic and animated product videos on demand.',
    color: 'from-pink-400/20 to-pink-400/0',
    accent: '#EC4899',
  },
  {
    icon: '🚀',
    title: 'GTM + Social',
    desc: 'A/B tested Twitter posts, viral mechanics, and live engagement metrics — ready to launch.',
    color: 'from-emerald-400/20 to-emerald-400/0',
    accent: '#10B981',
  },
];

const STEPS = [
  { n: '01', label: 'Describe', desc: 'Type your product idea in plain English' },
  { n: '02', label: 'Generate', desc: '8 agents build your complete product world' },
  { n: '03', label: 'Visualise', desc: 'Explore product, knolling & exploded views' },
  { n: '04', label: 'Launch',   desc: 'Ship videos, GTM kit, and social posts' },
];

export default function LandingPage() {
  const heroRef  = useRef<HTMLDivElement>(null);
  const featRef  = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero stagger
    anime({
      targets:    heroRef.current?.querySelectorAll('.hero-el'),
      opacity:    [0, 1],
      translateY: [36, 0],
      duration:   900,
      delay:      anime.stagger(100, { start: 100 }),
      easing:     'cubicBezier(0.16,1,0.3,1)',
    });
    // Feature cards
    const featObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        anime({
          targets:    '.feat-card',
          opacity:    [0, 1],
          translateY: [28, 0],
          duration:   700,
          delay:      anime.stagger(90),
          easing:     'cubicBezier(0.16,1,0.3,1)',
        });
        featObs.disconnect();
      }
    }, { threshold: 0.15 });
    if (featRef.current) featObs.observe(featRef.current);
    // Steps
    const stepsObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        anime({
          targets:    '.step-el',
          opacity:    [0, 1],
          translateX: [-20, 0],
          duration:   600,
          delay:      anime.stagger(100),
          easing:     'cubicBezier(0.16,1,0.3,1)',
        });
        stepsObs.disconnect();
      }
    }, { threshold: 0.2 });
    if (stepsRef.current) stepsObs.observe(stepsRef.current);
    return () => { featObs.disconnect(); stepsObs.disconnect(); };
  }, []);

  return (
    <div className="flex flex-col gap-24 pb-24">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center text-center gap-7 pt-16 pb-4"
        style={{ background: 'var(--hero-gradient)' }}
      >
        {/* Floating orbs (decorative) */}
        <span
          className="pointer-events-none absolute top-10 left-[10%] w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }}
        />
        <span
          className="pointer-events-none absolute top-20 right-[8%] w-48 h-48 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }}
        />

        <div className="hero-el opacity-0">
          <span className="badge badge-accent text-xs py-1 px-3">
            🏆 &nbsp;Hackathon 2025 &nbsp;·&nbsp; Multi-Agent AI
          </span>
        </div>

        <h1 className="hero-el opacity-0 text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight">
          <span className="text-fg">Build-A-</span>
          <span className="text-gradient">World</span>
        </h1>

        <p className="hero-el opacity-0 max-w-xl text-lg md:text-xl text-fg-muted leading-relaxed">
          Type a product idea. &nbsp;8 specialised AI agents turn it into a
          complete <strong className="text-fg font-semibold">visual, video, and GTM-ready</strong> product world.
        </p>

        <div className="hero-el opacity-0 w-full max-w-2xl">
          <PromptInput />
        </div>

        <div className="hero-el opacity-0 flex items-center gap-4 pt-2">
          <Link href="/architecture" className="text-xs text-fg-muted hover:text-fg transition-colors underline underline-offset-4">
            How it works →
          </Link>
          <span className="text-fg-muted/40 text-xs">·</span>
          <span className="text-xs text-fg-muted">MOCK_MODE demo — no API keys needed</span>
        </div>
      </section>

      {/* ── How it works (steps) ───────────────────────────── */}
      <section ref={stepsRef} className="px-2">
        <div className="mb-8 text-center">
          <h2 className="section-heading">How it works</h2>
          <p className="section-sub">From idea to launch in four steps</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map(({ n, label, desc }) => (
            <div key={n} className="step-el opacity-0 card p-6 flex flex-col gap-3">
              <span
                className="text-xs font-mono font-bold tracking-widest"
                style={{ color: '#06B6D4' }}
              >{n}</span>
              <h3 className="font-bold text-fg text-base">{label}</h3>
              <p className="text-xs text-fg-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section ref={featRef}>
        <div className="mb-8 text-center">
          <h2 className="section-heading">Powered by AI at every step</h2>
          <p className="section-sub">Each agent specialises in one part of the product lifecycle</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="feat-card opacity-0 card p-6 flex flex-col gap-4 overflow-hidden relative group cursor-default"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${f.accent}18, transparent)` }}
              />
              <div
                className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: `${f.accent}18` }}
              >
                {f.icon}
              </div>
              <div className="relative z-10">
                <h3 className="font-semibold text-fg text-base mb-1.5">{f.title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section
        className="card p-10 text-center flex flex-col items-center gap-5"
        style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(99,102,241,0.06) 100%)' }}
      >
        <h2 className="text-2xl font-extrabold text-fg tracking-tight">Ready to explore?</h2>
        <p className="text-fg-muted text-sm max-w-md">
          Dive into any section or go straight to the builder and describe your product idea.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/builder"      className="btn-accent">🏗️&nbsp; Builder</Link>
          <Link href="/video"        className="btn-ghost">🎬&nbsp; Video Studio</Link>
          <Link href="/gtm"          className="btn-ghost">🚀&nbsp; GTM + Social</Link>
          <Link href="/architecture" className="btn-ghost">🔭&nbsp; Architecture</Link>
        </div>
      </section>

    </div>
  );
}
