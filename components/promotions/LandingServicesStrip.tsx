'use client';

import Link from 'next/link';
import btsServices from '@/content/bts-services.json';

const FEATURED_SERVICE_IDS = ['team_education', 'board_pitch', 'expert_referral'];

export function LandingServicesStrip() {
  const { company, services } = btsServices;
  const featured = services.filter((s) => FEATURED_SERVICE_IDS.includes(s.id));

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex flex-col items-start gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#C9A84C]">
              {company.name} services
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-[#1A1915]">
              Beyond the guide
            </h2>
          </div>
        </div>

        {/* Service cards */}
        <div className="grid gap-5 sm:grid-cols-3">
          {featured.map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-xl border border-[#E8E6E0] bg-white p-6 shadow-[0_1px_3px_rgba(26,25,21,0.06),0_1px_2px_rgba(26,25,21,0.04)]"
            >
              <span className="rounded-[4px] bg-[#F0E4C0] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#9A7A2E] self-start">
                BTS
              </span>
              <h3 className="mt-3 font-semibold text-[#1A1915]">{service.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#6B6860]">
                {service.shortDesc}
              </p>
              <p className="mt-3 text-xs text-[#9E9C96]">{service.format}</p>
              <Link
                href={service.ctaUrl}
                className="mt-4 inline-flex items-center text-sm font-medium text-[#C9A84C] hover:text-[#9A7A2E] transition-colors"
              >
                {service.ctaLabel} →
              </Link>
            </div>
          ))}
        </div>

        {/* Footer strip */}
        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-[#E8E6E0] bg-[#F4F4F1] px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm leading-relaxed text-[#6B6860]">
            This guide is free to use. When you&apos;re ready for expert human support, BTS is here.
          </p>
          <Link
            href={company.servicesUrl}
            className="shrink-0 inline-flex items-center justify-center rounded-lg bg-[#C9A84C] px-5 py-2 text-sm font-medium text-[#1A1915] transition-colors hover:bg-[#9A7A2E]"
          >
            Explore BTS services →
          </Link>
        </div>
      </div>
    </section>
  );
}
