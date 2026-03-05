'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { InlineAdvisoryBanner } from '@/components/promotions/InlineAdvisoryBanner';
import { isDismissed, dismiss } from '@/lib/promotions';
import { cn } from '@/lib/utils';
import type { LearnModule } from '@/lib/content';
import type { EntityType } from '@/types';

interface LearnContentProps {
  modules: LearnModule[];
  isComplete: boolean;
  entityType: EntityType;
}

// Modules that get ATO-entity-specific banner treatment
const ATO_ENTITY_TYPES: EntityType[] = ['SMSF', 'PRIVATE_COMPANY', 'PUBLIC_COMPANY'];

function getBannerConfig(
  moduleId: string,
  entityType: EntityType
): { context: string; serviceId: string } | null {
  if (moduleId === 'regulatory-context') {
    return ATO_ENTITY_TYPES.includes(entityType)
      ? { context: 'ATO tax treatment for your entity', serviceId: 'team_education' }
      : { context: 'Australian regulatory obligations', serviceId: 'advisory_session' };
  }
  if (moduleId === 'custody-models') {
    return { context: 'bitcoin custody and key management', serviceId: 'advisory_session' };
  }
  return null;
}

const LEARN_EXHAUSTED_KEY = 'learn_banner_exhausted';

export function LearnContent({ modules, isComplete, entityType }: LearnContentProps) {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<number>>(
    isComplete ? new Set(modules.map((_, i) => i)) : new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const allCompleted = modules.every((_, i) => completedModules.has(i));
  const currentModule = modules[activeModule];
  const bannerConfig = currentModule ? getBannerConfig(currentModule.id, entityType) : null;
  const variantId = currentModule ? `inline_advisory_1_${currentModule.id}` : '';

  const isExhausted = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(LEARN_EXHAUSTED_KEY) === '1';
  }, []);

  // Reset banner visibility on module change
  useEffect(() => {
    setBannerVisible(false);
  }, [activeModule]);

  // Intersection Observer — show banner when bottom of card scrolls into view
  useEffect(() => {
    if (!bannerConfig || isExhausted()) return;
    if (isDismissed(variantId)) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setBannerVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeModule, bannerConfig, variantId, isExhausted]);

  function handleBannerDismiss() {
    // Mark all learn banners as exhausted for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(LEARN_EXHAUSTED_KEY, '1');
    }
    dismiss(variantId);
    setBannerVisible(false);
  }

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

  const showBanner =
    bannerConfig &&
    bannerVisible &&
    !isExhausted() &&
    !isDismissed(variantId);

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

          {/* Sentinel observed for IntersectionObserver banner trigger */}
          <div ref={sentinelRef} className="h-px" aria-hidden="true" />

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

        {/* Advisory banner — appears after eligible module scrolled into view */}
        {showBanner && (
          <div className="mt-4">
            <InlineAdvisoryBanner
              context={bannerConfig.context}
              serviceId={bannerConfig.serviceId}
              phase={1}
              variantId={variantId}
              onDismiss={handleBannerDismiss}
            />
          </div>
        )}

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
