'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ChatInterface — chat-based ideation UI. User goes back and forth with AI
// to refine their product idea before entering the builder.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import anime from 'animejs';
import ChatMessage, { Message } from './ChatMessage';
import { EXAMPLE_PROMPTS } from '@/utils/mockData';

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm your Build-A-World assistant. Describe a product idea and I'll help you refine it before we generate your full product world.",
};

export default function ChatInterface() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    anime({
      targets: containerRef.current,
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      easing: 'cubicBezier(0.16,1,0.3,1)',
    });
  }, []);

  const addMessage = (role: Message['role'], content: string) => {
    const msg: Message = { id: crypto.randomUUID(), role, content };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    addMessage('user', text);
    setSending(true);

    // TODO: Replace with actual AI call (callLLM) for ideation refinement
    await new Promise((r) => setTimeout(r, 1200));
    addMessage(
      'assistant',
      `Great idea! "${text}" has a lot of potential. When you're ready, hit "Build My World" below and I'll hand this off to our 8 AI agents to create your full product world.`
    );
    setSending(false);
  };

  const handleBuild = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;
    sessionStorage.setItem('baw_pending_prompt', lastUserMsg.content);
    router.push('/builder');
  };

  return (
    <div ref={containerRef} className="opacity-0 flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-6 px-2">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}

        {sending && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-5 py-3 text-sm"
              style={{
                background: 'rgb(var(--color-card))',
                border: '1px solid rgb(var(--color-border) / 0.08)',
                color: 'rgb(var(--color-fg-muted))',
              }}
            >
              <span className="animate-pulse-soft">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Example chips (shown when no user messages yet) */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 justify-center pb-4">
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex}
              onClick={() => setInput(ex)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer"
              style={{
                background: 'rgb(var(--color-border) / 0.06)',
                border: '1px solid rgb(var(--color-border) / 0.1)',
                color: 'rgb(var(--color-fg-muted))',
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{
          background: 'rgb(var(--color-card))',
          border: '1.5px solid rgb(var(--color-border) / 0.12)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe your product idea..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
          style={{ color: 'rgb(var(--color-fg))', caretColor: '#06B6D4' }}
          disabled={sending}
        />
        <button onClick={handleSend} disabled={!input.trim() || sending} className="btn-accent text-xs py-2 px-4">
          Send
        </button>
        {messages.length > 1 && (
          <button onClick={handleBuild} className="btn-outline text-xs py-2 px-4">
            Build My World
          </button>
        )}
      </div>
    </div>
  );
}
