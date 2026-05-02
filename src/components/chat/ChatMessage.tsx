'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ChatMessage — renders a single message bubble (user or AI).
// ─────────────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)'
            : 'rgb(var(--color-card))',
          color: isUser ? '#fff' : 'rgb(var(--color-fg))',
          border: isUser ? 'none' : '1px solid rgb(var(--color-border) / 0.08)',
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
