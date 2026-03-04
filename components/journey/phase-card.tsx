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
  LOCKED: { badge: 'bg-navy-100 text-navy-400', badgeText: 'Locked' },
  AVAILABLE: { badge: 'bg-brand-100 text-brand-700', badgeText: 'Available' },
  IN_PROGRESS: { badge: 'bg-blue-100 text-blue-700', badgeText: 'In Progress' },
  COMPLETE: { badge: 'bg-green-100 text-green-700', badgeText: 'Complete' },
};

export function PhaseCard({ phase, title, description, status, route }: PhaseCardProps) {
  const style = STATUS_STYLES[status];
  const isAccessible = status !== 'LOCKED';

  const content = (
    <Card
      interactive={isAccessible}
      className={cn(!isAccessible && 'opacity-60 cursor-not-allowed')}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold',
              status === 'COMPLETE'
                ? 'bg-green-100 text-green-700'
                : status === 'LOCKED'
                  ? 'bg-navy-100 text-navy-400'
                  : 'bg-brand-100 text-brand-700'
            )}
          >
            {status === 'COMPLETE' ? '✓' : phase}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
            <p className="mt-1 text-sm text-navy-500">{description}</p>
          </div>
        </div>
        <span className={cn('rounded-full px-3 py-1 text-xs font-medium', style.badge)}>
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
