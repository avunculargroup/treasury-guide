import type { EntityType, PhaseInfo } from '@/types';

export function getEntityLabel(entityType: EntityType): string {
  const labels: Record<EntityType, string> = {
    SMSF: 'Self Managed Super Fund',
    SOLE_TRADER: 'Sole Trader',
    NFP: 'Not For Profit',
    PRIVATE_COMPANY: 'Private Company',
    PUBLIC_COMPANY: 'Public Company',
  };
  return labels[entityType];
}

export function getEntitySlug(entityType: EntityType): string {
  const slugs: Record<EntityType, string> = {
    SMSF: 'smsf',
    SOLE_TRADER: 'sole-trader',
    NFP: 'nfp',
    PRIVATE_COMPANY: 'private-company',
    PUBLIC_COMPANY: 'public-company',
  };
  return slugs[entityType];
}

export const PHASES: Omit<PhaseInfo, 'status'>[] = [
  {
    phase: 1,
    title: 'Learn',
    description: 'Bitcoin treasury fundamentals and Australian regulatory context',
    route: '/journey/learn',
  },
  {
    phase: 2,
    title: 'Decide',
    description: 'Assess your organisation\'s fit for a Bitcoin treasury',
    route: '/journey/decide',
  },
  {
    phase: 3,
    title: 'Plan',
    description: 'Build your implementation strategy and generate your checklist',
    route: '/journey/plan',
  },
  {
    phase: 4,
    title: 'Track',
    description: 'Monitor progress against your implementation checklist',
    route: '/journey/track',
  },
];

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getDefaultBoardApproval(entityType: EntityType): boolean {
  return entityType === 'PRIVATE_COMPANY' || entityType === 'PUBLIC_COMPANY' || entityType === 'NFP';
}

export function getDefaultListedEntity(entityType: EntityType): boolean {
  return entityType === 'PUBLIC_COMPANY';
}
