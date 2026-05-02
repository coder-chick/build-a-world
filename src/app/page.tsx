'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 1 — Landing
// OWNER: TEAM 1
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import PromptInput from '@/components/PromptInput';
import Link from 'next/link';

const FEATURE_CARDS = [
  { icon: '🧠', title: '8 AI Agents',      desc: 'Strategy → Customization → Style → Visual → Video → GTM → Social → Orchestrator' },
  { icon: '🎨', title: '9 Style Clusters', desc: 'Creative dot map lets you choose the perfect aesthetic direction for your product' },
  { icon: '🎬', title: 'Video Studio',     desc: 'Seedance 2.0 generates hero, action, artistic and animated product videos' },
  { icon: '🚀', title: 'GTM + Launch',     desc: 'Full go-to-market kit with A/B tested Twitter posts and live engagement metrics' },
];

export default function LandingPage() {
  const heroRef  = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero entrance
    anime({
      targets:   heroRef.current?.querySelectorAll('.hero-el'),
      opacity:   [0, 1],
      translateY:[40, 0],
      duration:  800,
      delay:     anime.stagger(120),
      easing:    'easeOutExpo',
    });
    // Cards entrance
    setTimeout(() => {
      anime({
        targets:   cardsRef.current?.querySelectorAll('.feature-card'),
        opacity:   [0, 1],
        translateY:[30, 0],
        duration:  600,
        delay:     anime.stagger(80),
        easing:    'easeOutExpo',
      });
    }, 600);
  }, []);

  return (
    <div className="flex flex-col gap-20 pb-20">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="flex flex-col items-center text-center gap-6 pt-12">
        <div className="hero-el opacity-0">
          <span className="badge bg-accent/10 text-accent border border-accent/20 mb-4">
            🏆 Hackathon 2025
          </span>
        </div>

        <h1 className="hero-el opacity-0 text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
          <span className="text-white">Build-A-</span>
          <span className="text-accent">World</span>
        </h1>

        <p className="hero-el opacity-0 max-w-2xl text-lg md:text-xl text-gray-400">
          Transform any product idea into a fully visualised, market-ready world —
          powered by <strong className="text-white">8 specialised AI agents</strong> running in concert.
        </p>

        {/* Prompt input */}
        <div className="hero-el opacity-0 w-full max-w-2xl">
          <PromptInput />
        </div>

        {/* Architecture peek */}
        <div className="hero-el opacity-0">
          <Link
            href="/architecture"
            className="text-xs text-gray-500 hover:text-accent transition-colors underline underline-offset-4"
          >
            How does it work? → View architecture
          </Link>
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────────────── */}
      <section ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURE_CARDS.map((f) => (
          <div key={f.title} className="feature-card opacity-0 glass-card p-6 flex flex-col gap-3 shadow-glass">
            <span className="text-3xl">{f.icon}</span>
            <h3 className="font-semibold text-white">{f.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── CTA strip ────────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-4 text-center">
        <p className="text-gray-500 text-sm">Ready to explore?</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/builder"      className="btn-accent">🏗️ Builder</Link>
          <Link href="/video"        className="btn-ghost">🎬 Video Studio</Link>
          <Link href="/gtm"          className="btn-ghost">🚀 GTM + Social</Link>
          <Link href="/architecture" className="btn-ghost">🔭 Architecture</Link>
        </div>
      </section>
    </div>
  );
}
