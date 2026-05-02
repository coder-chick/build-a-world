'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ArchitectureDiagram — agent flow diagram for hackathon judging page.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import anime from 'animejs';

const NODES = [
  { id: 'input',      label: 'User Input',             sub: 'Product idea text',           emoji: '💬', team: '' },
  { id: 'orch',       label: 'Orchestrator Agent',      sub: 'Coordinates all agents',      emoji: '🧠', team: 'TEAM 1' },
  { id: 'strategy',   label: 'Product Strategy Agent',  sub: 'Name, tagline, features',     emoji: '📋', team: 'TEAM 1' },
  { id: 'custom',     label: 'Customization Agent',     sub: 'Component dropdowns',         emoji: '🎛️', team: 'TEAM 1' },
  { id: 'style',      label: 'Style Agent',             sub: '9 visual style directions',   emoji: '🎨', team: 'TEAM 1' },
  { id: 'visual',     label: 'Visual Prompt Agent',     sub: 'Product / Knolling / Exploded', emoji: '🖼️', team: 'TEAM 1' },
  { id: 'vidprompt',  label: 'Video Prompt Agent',      sub: 'Seedance prompt generation',  emoji: '🎬', team: 'TEAM 2' },
  { id: 'seedance',   label: 'Seedance 2.0 API',        sub: 'Video generation engine',     emoji: '🎥', team: 'TEAM 2' },
  { id: 'gtm',        label: 'GTM Agent',               sub: 'Positioning + A/B plan',      emoji: '🚀', team: 'TEAM 3' },
  { id: 'social',     label: 'Social Agent',            sub: 'Twitter posts + A/B test',    emoji: '𝕏',  team: 'TEAM 3' },
  { id: 'butterbase', label: 'Butterbase',              sub: 'State + database + deploy',   emoji: '🗄️', team: '' },
  { id: 'world',      label: 'Product World',           sub: 'Final assembled output',      emoji: '🌍', team: '' },
];

const TEAM_COLOR: Record<string, string> = {
  'TEAM 1': 'border-accent/40 bg-accent/5',
  'TEAM 2': 'border-purple-400/40 bg-purple-400/5',
  'TEAM 3': 'border-pink-400/40 bg-pink-400/5',
  '':       'border-white/10 bg-white/5',
};

export default function ArchitectureDiagram() {
  useEffect(() => {
    anime({
      targets: '.arch-node',
      opacity:     [0, 1],
      translateY:  [20, 0],
      delay:       anime.stagger(80),
      duration:    500,
      easing:      'easeOutExpo',
    });
    anime({
      targets: '.arch-arrow',
      opacity: [0, 1],
      delay:   anime.stagger(80, { start: 200 }),
      duration: 400,
    });
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Legend */}
      <div className="flex gap-4 flex-wrap justify-center mb-2">
        {[
          { label: 'TEAM 1 — UI/Frontend',    color: 'border-accent/40 bg-accent/10 text-accent' },
          { label: 'TEAM 2 — Video Pipeline', color: 'border-purple-400/40 bg-purple-400/10 text-purple-300' },
          { label: 'TEAM 3 — GTM/Social',     color: 'border-pink-400/40 bg-pink-400/10 text-pink-300' },
        ].map(({ label, color }) => (
          <span key={label} className={`text-xs px-3 py-1 rounded-full border ${color}`}>
            {label}
          </span>
        ))}
      </div>

      {/* Flow */}
      <div className="flex flex-col items-center gap-0 w-full max-w-md">
        {NODES.map((node, i) => (
          <div key={node.id} className="flex flex-col items-center w-full">
            <div
              className={`arch-node opacity-0 w-full rounded-2xl border px-5 py-3
                flex items-center gap-3 ${TEAM_COLOR[node.team]}`}
            >
              <span className="text-2xl">{node.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{node.label}</p>
                <p className="text-xs text-white/40 truncate">{node.sub}</p>
              </div>
              {node.team && (
                <span className="text-[10px] font-medium text-white/30 whitespace-nowrap">
                  {node.team}
                </span>
              )}
            </div>
            {i < NODES.length - 1 && (
              <div className="arch-arrow opacity-0 flex flex-col items-center py-1">
                <div className="w-px h-4 bg-white/20" />
                <div className="w-2 h-2 border-r border-b border-white/20 rotate-45 -mt-1" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
