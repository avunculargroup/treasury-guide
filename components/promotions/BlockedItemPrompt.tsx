'use client';

import Link from 'next/link';
import type { EntityType } from '@/types';

interface BlockedItemPromptProps {
  checklistItemId: string;
  itemTitle: string;
  itemCategory: string;
  entityType: EntityType;
}

function getExpertUrl(category: string): string {
  if (category.toLowerCase().includes('legal') || category.toLowerCase().includes('compliance')) {
    return '/contact?service=expert_referral&type=legal';
  }
  if (category.toLowerCase().includes('account') || category.toLowerCase().includes('tax')) {
    return '/contact?service=expert_referral&type=accounting';
  }
  if (category.toLowerCase().includes('custody') || category.toLowerCase().includes('security')) {
    return '/contact?service=expert_referral&type=custody';
  }
  if (category.toLowerCase().includes('smsf') || category.toLowerCase().includes('trust deed')) {
    return '/contact?service=expert_referral&type=smsf';
  }
  return '/contact?service=expert_referral';
}

export function BlockedItemPrompt({
  checklistItemId: _checklistItemId,
  itemTitle,
  itemCategory,
  entityType: _entityType,
}: BlockedItemPromptProps) {
  const expertUrl = getExpertUrl(itemCategory);

  return (
    <div className="mt-2 rounded-lg border border-[#E8D28A] bg-[#FFF8E8] px-4 py-3">
      <p className="text-sm leading-relaxed text-[#6B6860]">
        Stuck on &ldquo;{itemTitle}&rdquo;? BTS can connect you with an Australia-based specialist
        who&apos;s done this before.
      </p>
      <Link
        href={expertUrl}
        className="mt-2 inline-flex items-center text-sm font-medium text-[#9A7A2E] transition-colors hover:text-[#C9A84C]"
      >
        Find an expert through BTS →
      </Link>
    </div>
  );
}
