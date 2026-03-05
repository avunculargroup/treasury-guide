'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PhaseStatus } from '@/types';

interface PhaseCardProps {
  phase: number;
  title: string;
  description: string;
  status: PhaseStatus;
  route: string;
}

const STATUS_STYLES: Record<PhaseStatus, { badge: string; badgeText: string }> = {
  LOCKED: { badge: 'bg-[#F4F4F1] text-navy-400', badgeText: 'Locked' },
  AVAILABLE: { badge: 'bg-[#F0E4C0] text-[#9A7A2E]', badgeText: 'Available' },
  IN_PROGRESS: { badge: 'bg-[#F0E4C0] text-[#9A7A2E]', badgeText: 'In progress' },
  COMPLETE: { badge: 'bg-[#E8F4EF] text-[#3D7A5E]', badgeText: 'Complete' },
};

export function PhaseCard({ phase, title, description, status, route }: PhaseCardProps) {
  const style = STATUS_STYLES[status];
  const isAccessible = status !== 'LOCKED';

  const content = (
    <Card
      interactive={isAccessible}
      className={cn(!isAccessible && 'opacity-50 cursor-not-allowed')}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-data text-sm font-medium',
              status === 'COMPLETE'
                ? 'bg-[#E8F4EF] text-[#3D7A5E]'
                : status === 'LOCKED'
                  ? 'bg-[#F4F4F1] text-navy-400'
                  : 'bg-[#F0E4C0] text-[#9A7A2E]'
            )}
          >
            {status === 'COMPLETE' ? '✓' : phase}
          </div>
          <div>
            <h3 className="font-semibold text-navy-900">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-navy-500">{description}</p>
          </div>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-[4px] px-2.5 py-1 text-xs font-medium uppercase tracking-wide',
            style.badge
          )}
        >
          {style.badgeText}
        </span>
      </div>
    </Card>
  );

  if (isAccessible) {
    return <Link href={route}>{content}</Link>;
  }
  return content;
}
