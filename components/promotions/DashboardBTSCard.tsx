'use client';

import Link from 'next/link';
import btsServices from '@/content/bts-services.json';

export function DashboardBTSCard() {
  const { company, services } = btsServices;

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#1A1915] p-6">
      {/* Radial gold glow — decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0) 70%)',
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#C9A84C]">
              Advisory Services
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-white">
              {company.name}
            </h3>
            <p className="mt-1 text-sm text-[#9E9C96]">{company.tagline}</p>
          </div>
          <span className="shrink-0 rounded-[4px] bg-[#C9A84C] px-2 py-0.5 text-xs font-semibold text-[#1A1915]">
            BTS
          </span>
        </div>

        {/* Service pills */}
        <div className="mt-5 flex flex-wrap gap-2">
          {services.map((service) => (
            <span
              key={service.id}
              className="rounded-[4px] border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-1 text-xs font-medium text-[#C9A84C]"
            >
              {service.title}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={company.contactUrl}
            className="inline-flex items-center justify-center rounded-lg bg-[#C9A84C] px-5 py-2 text-sm font-medium text-[#1A1915] transition-colors hover:bg-[#9A7A2E]"
          >
            Speak with an advisor
          </Link>
          <Link
            href={company.servicesUrl}
            className="inline-flex items-center justify-center rounded-lg border border-[#C9A84C]/40 px-5 py-2 text-sm font-medium text-[#C9A84C] transition-colors hover:border-[#C9A84C] hover:bg-[#C9A84C]/10"
          >
            View all services
          </Link>
        </div>
      </div>
    </div>
  );
}
