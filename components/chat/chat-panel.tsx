'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
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
            <div className="flex h-full items-center justify-center text-center text-sm text-navy-400">
              <p>Ask me anything about Bitcoin treasury management for Australian entities.</p>
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
              {msg.content || (
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
