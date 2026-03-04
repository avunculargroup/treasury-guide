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
      <nav className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-8 space-y-1">
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(i)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                activeModule === i
                  ? 'bg-brand-100 text-brand-700 font-medium'
                  : 'text-navy-600 hover:bg-navy-50'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs',
                  completedModules.has(i)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-navy-100 text-navy-500'
                )}
              >
                {completedModules.has(i) ? '✓' : i + 1}
              </span>
              <span className="truncate">{mod.title}</span>
              {mod.isEntitySpecific && (
                <span className="ml-auto shrink-0 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-600">
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
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm"
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

          <div className="mt-8 flex items-center justify-between border-t border-navy-100 pt-4">
            <Button
              variant="ghost"
              onClick={() => setActiveModule(Math.max(0, activeModule - 1))}
              disabled={activeModule === 0}
            >
              ← Previous
            </Button>

            {!completedModules.has(activeModule) ? (
              <Button onClick={() => markModuleComplete(activeModule)}>
                Mark as Read
              </Button>
            ) : activeModule < modules.length - 1 ? (
              <Button variant="outline" onClick={() => setActiveModule(activeModule + 1)}>
                Next →
              </Button>
            ) : null}
          </div>
        </Card>

        {allCompleted && !isComplete && (
          <div className="mt-6 text-center">
            <Button size="lg" onClick={handleCompletePhase} disabled={isSubmitting}>
              {isSubmitting ? 'Completing...' : 'Complete Phase 1 & Continue'}
            </Button>
          </div>
        )}

        {isComplete && (
          <div className="mt-6 text-center">
            <p className="mb-2 text-sm text-green-600 font-medium">Phase 1 Complete</p>
            <Button variant="outline" onClick={() => router.push('/journey')}>
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
