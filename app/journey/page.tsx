import { requireUserProfile } from '@/lib/user';
import { PHASES, getEntityLabel } from '@/lib/utils';
import { PhaseCard } from '@/components/journey/phase-card';
import { DisclaimerFooter } from '@/components/ui/disclaimer-footer';
import { DashboardBTSCard } from '@/components/promotions/DashboardBTSCard';
import type { PhaseStatus } from '@/types';

export default async function JourneyDashboard() {
  const profile = await requireUserProfile();

  const progressMap = new Map(
    profile.progress.map((p) => [p.phase, p.status as PhaseStatus])
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Bitcoin Treasury Guide" className="h-8 w-8" />
            <div>
              <h1 className="font-display text-lg font-semibold leading-tight text-navy-900">
                Bitcoin Treasury Guide
              </h1>
              <p className="text-xs text-navy-400">Welcome back, {profile.displayName}</p>
            </div>
          </div>
          <span className="rounded-[4px] bg-[#F0E4C0] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#9A7A2E]">
            {getEntityLabel(profile.entityType)}
          </span>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display mb-2 text-2xl font-semibold text-navy-900">Your journey</h2>
          <p className="mb-8 text-sm text-navy-500">
            Complete each phase in sequence to build your Bitcoin treasury strategy.
          </p>
          <div className="space-y-4">
            {PHASES.map((phase) => (
              <PhaseCard
                key={phase.phase}
                phase={phase.phase}
                title={phase.title}
                description={phase.description}
                status={progressMap.get(phase.phase) || 'LOCKED'}
                route={phase.route}
              />
            ))}
          </div>

          {/* BTS advisory card — below phase cards */}
          <div className="mt-6">
            <DashboardBTSCard />
          </div>
        </div>
      </main>

      <DisclaimerFooter />
    </div>
  );
}
