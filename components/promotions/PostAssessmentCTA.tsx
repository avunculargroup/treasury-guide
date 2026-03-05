'use client';

import { useState } from 'react';
import Link from 'next/link';
import btsServices from '@/content/bts-services.json';
import type { FitScore, EntityType } from '@/types';

interface PostAssessmentCTAProps {
  fitScore: FitScore;
  entityType: EntityType;
}

const SCORE_COPY: Record<FitScore, { headline: string; subCopy: string }> = {
  RECOMMENDED: {
    headline: 'Ready to move forward — with confidence',
    subCopy:
      'Bitcoin treasury looks like a strong fit. Here\u2019s how BTS can help you execute it properly.',
  },
  EXPLORE_FURTHER: {
    headline: 'A few questions worth talking through',
    subCopy:
      'Your situation has nuances worth exploring with an advisor before proceeding.',
  },
  NOT_RECOMMENDED: {
    headline: 'It may not be the right time — let\u2019s talk',
    subCopy:
      'That\u2019s a valuable insight. Our advisors can help you understand what would change the picture.',
  },
};

const CTA_SERVICE_IDS = ['advisory_session', 'team_education', 'board_pitch', 'expert_referral'];

export function PostAssessmentCTA({ fitScore, entityType: _entityType }: PostAssessmentCTAProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const { headline, subCopy } = SCORE_COPY[fitScore];
  const ctaServices = btsServices.services.filter((s) => CTA_SERVICE_IDS.includes(s.id));
  const selectedService = ctaServices.find((s) => s.id === selectedServiceId) ?? null;

  const ctaHref = selectedService ? selectedService.ctaUrl : '/contact';
  const ctaLabel = selectedService ? `Enquire \u2014 ${selectedService.title}` : 'Get in touch with BTS';

  return (
    <div className="overflow-hidden rounded-xl border border-[#E8E6E0] shadow-[0_1px_3px_rgba(26,25,21,0.06),0_1px_2px_rgba(26,25,21,0.04)]">
      {/* Dark header */}
      <div className="flex items-start gap-4 bg-[#1A1915] px-6 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]">
          <svg
            width="20"
            height="20"
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
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C9A84C]">
            BTS Advisory Services
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-white">{headline}</h3>
          <p className="mt-1 text-sm text-[#9E9C96]">{subCopy}</p>
        </div>
      </div>

      {/* Service selector */}
      <div className="bg-white px-6 py-5">
        <p className="mb-3 text-sm font-medium text-[#1A1915]">
          How can we help?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {ctaServices.map((service) => {
            const isSelected = selectedServiceId === service.id;
            return (
              <button
                key={service.id}
                onClick={() =>
                  setSelectedServiceId(isSelected ? null : service.id)
                }
                className={[
                  'flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-colors',
                  isSelected
                    ? 'border-[#C9A84C] bg-[#FAF5E8]'
                    : 'border-[#E8E6E0] hover:bg-[#F4F4F1]',
                ].join(' ')}
              >
                <span className="text-sm font-medium text-[#1A1915]">
                  {service.title}
                </span>
                <span className="mt-0.5 text-xs leading-relaxed text-[#6B6860]">
                  {service.shortDesc}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-lg bg-[#C9A84C] px-5 py-2.5 text-sm font-medium text-[#1A1915] transition-colors hover:bg-[#9A7A2E]"
          >
            {ctaLabel}
          </Link>
          <button className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-[#6B6860] transition-colors hover:bg-[#F4F4F1] hover:text-[#1A1915]">
            Continue on my own
          </button>
        </div>
      </div>
    </div>
  );
}
