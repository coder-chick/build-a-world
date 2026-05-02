'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE — Chat Ideation
// OWNER: TEAM 1
// Entry point where the user iterates on their product idea with an AI
// assistant before sending it to the builder pipeline.
// ─────────────────────────────────────────────────────────────────────────────

import ChatInterface from '@/components/chat/ChatInterface';
import Link from 'next/link';

export default function ChatPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-xs" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        <Link href="/" className="hover:text-fg transition-colors" style={{ color: 'inherit' }}>Home</Link>
        <span>/</span>
        <span className="text-fg">Ideation Chat</span>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-fg">
          <span className="text-gradient">Ideation</span> Chat
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          Describe your product idea and refine it before building your world
        </p>
      </div>

      <ChatInterface />
    </>
  );
}
