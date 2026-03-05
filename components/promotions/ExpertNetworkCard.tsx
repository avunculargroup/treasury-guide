'use client';

import Link from 'next/link';
import btsServices from '@/content/bts-services.json';
import type { EntityType } from '@/types';

interface ExpertNetworkCardProps {
  entityType: EntityType;
  phase: number;
}

export function ExpertNetworkCard({ entityType, phase: _phase }: ExpertNetworkCardProps) {
  const { expertNetwork } = btsServices;

  // Filter: entity-matched first, then universal, max 4
  const entityMatched = expertNetwork.filter(
    (e) => e.entityTypes && e.entityTypes.includes(entityType)
  );
  const universal = expertNetwork.filter((e) => !e.entityTypes);
  const visible = [...entityMatched, ...universal].slice(0, 4);

  return (
    <div className="rounded-xl border border-[#E8E6E0] bg-white shadow-[0_1px_3px_rgba(26,25,21,0.06),0_1px_2px_rgba(26,25,21,0.04)]">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-[#E8E6E0] px-5 py-4">
        <h3 className="font-semibold text-[#1A1915]">BTS Expert Network</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B6860]">Australia</span>
          <span className="rounded-[4px] bg-[#C9A84C] px-2 py-0.5 text-xs font-semibold text-[#1A1915]">
            BTS
          </span>
        </div>
      </div>

      {/* Expert rows */}
      <div className="divide-y divide-[#E8E6E0]">
        {visible.map((expert) => (
          <Link
            key={expert.role}
            href={expert.ctaUrl}
            className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#FAF5E8]"
          >
            {/* Icon box */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: expert.iconBg }}
            >
              <ExpertIcon name={expert.icon} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1A1915] group-hover:text-[#9A7A2E] transition-colors">
                {expert.role}
              </p>
              <p className="text-xs text-[#6B6860]">{expert.description}</p>
            </div>

            <span className="shrink-0 text-[#C9A84C] opacity-0 transition-opacity group-hover:opacity-100">
              →
            </span>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-[#E8E6E0] px-5 py-3.5">
        <p className="text-xs text-[#6B6860]">
          🇦🇺 All specialists are Australia-based and Bitcoin-experienced
        </p>
      </div>
    </div>
  );
}

function ExpertIcon({ name }: { name: string }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: '#1A1915',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (name) {
    case 'Scale':
      return (
        <svg {...props}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case 'BarChart2':
      return (
        <svg {...props}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'Shield':
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'FileText':
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 'Landmark':
      return (
        <svg {...props}>
          <line x1="3" y1="22" x2="21" y2="22" />
          <line x1="6" y1="18" x2="6" y2="11" />
          <line x1="10" y1="18" x2="10" y2="11" />
          <line x1="14" y1="18" x2="14" y2="11" />
          <line x1="18" y1="18" x2="18" y2="11" />
          <polygon points="12 2 20 7 4 7" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}
