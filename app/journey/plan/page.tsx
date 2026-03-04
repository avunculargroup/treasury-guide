import { requireUserProfile } from '@/lib/user';
import { getEntityLabel } from '@/lib/utils';
import { PhaseLayout } from '@/components/journey/phase-layout';
import { PlanContent } from '@/components/journey/plan-content';
import { prisma } from '@/lib/prisma';

export default async function PlanPage() {
  const profile = await requireUserProfile();

  const assessment = await prisma.assessment.findFirst({
    where: { userId: profile.id },
    orderBy: { updatedAt: 'desc' },
  });

  const progress = profile.progress.find((p) => p.phase === 3);
  const isComplete = progress?.status === 'COMPLETE';

  return (
    <PhaseLayout
      title="Plan"
      phase={3}
      entityLabel={getEntityLabel(profile.entityType)}
      displayName={profile.displayName}
    >
      <PlanContent
        entityType={profile.entityType}
        assessmentResponses={assessment?.responses as Record<string, unknown> | null}
        isComplete={isComplete}
      />
    </PhaseLayout>
  );
}
