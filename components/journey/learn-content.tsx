'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { cn } from '@/lib/utils';
import type { LearnModule } from '@/lib/content';

interface LearnContentProps {
  modules: LearnModule[];
  isComplete: boolean;
}

export function LearnContent({ modules, isComplete }: LearnContentProps) {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<number>>(
    isComplete ? new Set(modules.map((_, i) => i)) : new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allCompleted = modules.every((_, i) => completedModules.has(i));

  function markModuleComplete(index: number) {
    setCompletedModules((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    if (index < modules.length - 1) {
      setActiveModule(index + 1);
    }
  }

  async function handleCompletePhase() {
    setIsSubmitting(true);
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 1, status: 'COMPLETE' }),
      });
      router.push('/journey');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex gap-8">
      {/* Sidebar nav */}
      <nav className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-8 space-y-0.5">
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(i)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                activeModule === i
                  ? 'bg-[#F0E4C0] text-[#9A7A2E] font-medium'
                  : 'text-navy-500 hover:bg-[#F4F4F1] hover:text-navy-900'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-data text-xs',
                  completedModules.has(i)
                    ? 'bg-[#E8F4EF] text-[#3D7A5E]'
                    : activeModule === i
                      ? 'bg-[#C9A84C] text-white'
                      : 'bg-[#F4F4F1] text-navy-400'
                )}
              >
                {completedModules.has(i) ? '✓' : i + 1}
              </span>
              <span className="truncate">{mod.title}</span>
              {mod.isEntitySpecific && (
                <span className="ml-auto shrink-0 rounded-[4px] bg-[#F0E4C0] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#9A7A2E]">
                  Entity
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {/* Mobile module selector */}
        <div className="mb-4 lg:hidden">
          <select
            value={activeModule}
            onChange={(e) => setActiveModule(Number(e.target.value))}
            className="w-full rounded-md border border-[#E8E6E0] bg-white px-3 py-2 text-sm text-navy-900 focus:border-[#C9A84C] focus:outline-none"
          >
            {modules.map((mod, i) => (
              <option key={mod.id} value={i}>
                {completedModules.has(i) ? '✓ ' : ''}{mod.title}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <MarkdownContent content={modules[activeModule]?.content || ''} />

          <div className="mt-8 flex items-center justify-between border-t border-[#E8E6E0] pt-5">
            <Button
              variant="ghost"
              onClick={() => setActiveModule(Math.max(0, activeModule - 1))}
              disabled={activeModule === 0}
            >
              ← Previous
            </Button>

            {!completedModules.has(activeModule) ? (
              <Button onClick={() => markModuleComplete(activeModule)}>
                Mark as read
              </Button>
            ) : activeModule < modules.length - 1 ? (
              <Button variant="secondary" onClick={() => setActiveModule(activeModule + 1)}>
                Next →
              </Button>
            ) : null}
          </div>
        </Card>

        {allCompleted && !isComplete && (
          <div className="mt-8 text-center">
            <Button size="lg" onClick={handleCompletePhase} disabled={isSubmitting}>
              {isSubmitting ? 'Completing...' : 'Complete Phase 1 and continue'}
            </Button>
          </div>
        )}

        {isComplete && (
          <div className="mt-8 text-center">
            <p className="mb-3 text-sm font-medium text-[#3D7A5E]">Phase 1 complete</p>
            <Button variant="secondary" onClick={() => router.push('/journey')}>
              Back to dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
