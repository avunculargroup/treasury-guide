import { requireUserProfile } from '@/lib/user';
import { PHASES, getEntityLabel } from '@/lib/utils';
import { PhaseCard } from '@/components/journey/phase-card';
import { DisclaimerFooter } from '@/components/ui/disclaimer-footer';
import type { PhaseStatus } from '@/types';

export default async function JourneyDashboard() {
  const profile = await requireUserProfile();

  const progressMap = new Map(
    profile.progress.map((p) => [p.phase, p.status as PhaseStatus])
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-navy-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-navy-900">Treasury Guide</h1>
            <p className="text-sm text-navy-500">Welcome back, {profile.displayName}</p>
          </div>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
            {getEntityLabel(profile.entityType)}
          </span>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-2xl font-bold text-navy-900">Your Journey</h2>
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
        </div>
      </main>

      <DisclaimerFooter />
    </div>
  );
}
