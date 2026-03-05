'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isDismissed, dismiss } from '@/lib/promotions';
import btsServices from '@/content/bts-services.json';

interface InlineAdvisoryBannerProps {
  context: string;
  serviceId: string;
  phase: number;
  variantId: string;
  onDismiss?: () => void;
}

export function InlineAdvisoryBanner({
  context,
  serviceId,
  phase: _phase,
  variantId,
  onDismiss,
}: InlineAdvisoryBannerProps) {
  const [dismissed, setDismissed] = useState(() => isDismissed(variantId));
  const [fading, setFading] = useState(false);

  const service = btsServices.services.find((s) => s.id === serviceId);

  if (!service || dismissed) return null;

  function handleDismiss() {
    setFading(true);
    dismiss(variantId);
    onDismiss?.();
    setTimeout(() => setDismissed(true), 150);
  }

  return (
    <div
      className="transition-opacity duration-150"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="flex gap-4 rounded-xl border-l-[3px] border-[#C9A84C] bg-[#F0E4C0] px-5 py-4">
        {/* Gold icon square */}
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1A1915"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9A7A2E]">
            BTS Advisory Services
          </p>
          <h4 className="mt-1 text-sm font-semibold text-[#1A1915]">
            Want a guided walkthrough of {context}?
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-[#6B6860]">
            {service.shortDesc} — a BTS advisor can walk you through this in detail.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={service.ctaUrl}
              className="inline-flex items-center justify-center rounded-lg bg-[#C9A84C] px-4 py-1.5 text-sm font-medium text-[#1A1915] transition-colors hover:bg-[#9A7A2E]"
            >
              {service.ctaLabel}
            </Link>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center justify-center rounded-lg px-4 py-1.5 text-sm font-medium text-[#6B6860] transition-colors hover:bg-[#E8D28A]/40 hover:text-[#1A1915]"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
