'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const PHASE_MAP: Record<string, number> = {
  '/journey/learn': 1,
  '/journey/decide': 2,
  '/journey/plan': 3,
  '/journey/track': 4,
};

const STARTER_QUESTIONS: Record<number, string[]> = {
  1: [
    "What's CGT treatment for Bitcoin in Australia?",
    'What custody model suits a private company?',
    'Do I need an AFSL to hold Bitcoin?',
  ],
  2: [
    "How do I assess my organisation's risk appetite?",
    'What should a board resolution for Bitcoin cover?',
    'What are the main red flags that make Bitcoin treasury unsuitable?',
  ],
  3: [
    "What's a sensible first allocation size?",
    'How do I select a custodian?',
    'What accounting policy should I elect for Bitcoin?',
  ],
  4: [
    'How do I track implementation progress?',
    'What should I do if a checklist item is blocked?',
    'What professionals should be involved?',
  ],
};

function derivePhase(pathname: string): number {
  // Match on the first path segment pair (e.g. /journey/learn or /journey/learn/topic)
  const segment = '/' + pathname.split('/').slice(1, 3).join('/');
  return PHASE_MAP[segment] ?? 1;
}

/** Minimal markdown renderer — handles bold, inline code, and bullet lists. */
function MarkdownContent({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList(key: string) {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="my-1 list-disc pl-4 space-y-0.5">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  function renderInline(line: string): React.ReactNode[] {
    // Process **bold** and `code` inline patterns
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);
      if (!boldMatch && !codeMatch) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
      const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
      const codeIdx = codeMatch ? remaining.indexOf(codeMatch[0]) : Infinity;
      if (boldIdx <= codeIdx && boldMatch) {
        if (boldIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, boldIdx)}</span>);
        parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldIdx + boldMatch[0].length);
      } else if (codeMatch) {
        if (codeIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, codeIdx)}</span>);
        parts.push(<code key={key++} className="rounded bg-black/10 px-1 font-mono text-xs">{codeMatch[1]}</code>);
        remaining = remaining.slice(codeIdx + codeMatch[0].length);
      }
    }
    return parts;
  }

  lines.forEach((line, i) => {
    const bulletMatch = line.match(/^[-*]\s+(.*)/);
    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
    } else {
      flushList(`list-${i}`);
      const trimmed = line.trim();
      if (trimmed) {
        elements.push(
          <p key={`p-${i}`} className="mb-1 last:mb-0">
            {renderInline(trimmed)}
          </p>
        );
      }
    }
  });
  flushList('list-end');

  return <>{elements}</>;
}

export function ChatPanel() {
  const pathname = usePathname();
  const phase = derivePhase(pathname);
  const starters = STARTER_QUESTIONS[phase] ?? STARTER_QUESTIONS[1];

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    // Load history the first time the panel is opened
    if (isOpen && !historyLoaded) {
      setHistoryLoaded(true);
      fetch(`/api/chat/history?phase=${phase}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(
              data.messages.map((m: { id: string; role: string; content: string }) => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
              }))
            );
          }
        })
        .catch(() => {
          // History load failure is non-critical — panel works fine without it
        });
    }
  }, [isOpen, historyLoaded, phase]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
    };

    setMessages([...updatedMessages, assistantMessage]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          phase,
          pathname,
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No stream reader');

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2));
              if (typeof text === 'string') {
                fullContent += text;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    updated[updated.length - 1] = { ...last, content: fullContent };
                  }
                  return updated;
                });
              }
            } catch {
              // skip non-text stream parts
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant' && !last.content) {
          updated[updated.length - 1] = {
            ...last,
            content: 'Sorry, I encountered an error. Please try again.',
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendMessage(input);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-13 w-13 items-center justify-center rounded-full transition-all duration-150 active:scale-95',
          '[box-shadow:0_4px_12px_rgba(26,25,21,0.15),_0_2px_4px_rgba(26,25,21,0.10)]',
          isOpen
            ? 'bg-[#1A1915] text-[#E8E6E0] hover:bg-[#2A2825]'
            : 'bg-[#C9A84C] text-[#1A1915] hover:bg-[#9A7A2E]'
        )}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
      >
        <span className="text-lg">{isOpen ? '✕' : '?'}</span>
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-40 flex w-[22rem] flex-col rounded-xl border border-[#E8E6E0] bg-white transition-all duration-200',
          '[box-shadow:0_12px_32px_rgba(26,25,21,0.12),_0_4px_8px_rgba(26,25,21,0.06)]',
          isOpen ? 'h-[30rem] opacity-100' : 'pointer-events-none h-0 opacity-0'
        )}
      >
        {/* Header */}
        <div className="border-b border-[#E8E6E0] px-4 py-3">
          <h3 className="font-semibold text-navy-900">Treasury assistant</h3>
          <p className="text-xs text-navy-400">
            General information only — not financial advice.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {messages.length === 0 && (
            <div className="flex h-full flex-col justify-center gap-2">
              <p className="text-center text-sm text-navy-400">
                Ask me anything about Bitcoin treasury management for Australian entities.
              </p>
              <div className="flex flex-col gap-1.5">
                {starters.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="rounded-lg border border-[#E8E6E0] px-3 py-2 text-left text-xs text-navy-700 transition-colors hover:border-[#C9A84C] hover:bg-[#FDFBF5] disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'mb-3 max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'ml-auto bg-[#C9A84C] text-[#1A1915]'
                  : 'bg-[#F4F4F1] text-navy-800'
              )}
            >
              {msg.content ? (
                <MarkdownContent text={msg.content} />
              ) : (
                <span className="inline-flex items-center gap-1 text-navy-400">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse delay-100">●</span>
                  <span className="animate-pulse delay-200">●</span>
                </span>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-[#E8E6E0] p-3">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask a question..."
              rows={1}
              className="flex-1 resize-none rounded-md border border-[#E8E6E0] bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-[#C9A84C] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20"
              disabled={isLoading}
            />
            <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
