import { requireUserProfile } from '@/lib/user';
import { getEntityLabel } from '@/lib/utils';
import { PhaseLayout } from '@/components/journey/phase-layout';
import { AssessmentForm } from '@/components/journey/assessment-form';
import { prisma } from '@/lib/prisma';

export default async function DecidePage() {
  const profile = await requireUserProfile();

  const assessment = await prisma.assessment.findFirst({
    where: { userId: profile.id },
    orderBy: { updatedAt: 'desc' },
  });

  const progress = profile.progress.find((p) => p.phase === 2);
  const isComplete = progress?.status === 'COMPLETE';

  return (
    <PhaseLayout
      title="Decide"
      phase={2}
      entityLabel={getEntityLabel(profile.entityType)}
      displayName={profile.displayName}
    >
      <AssessmentForm
        entityType={profile.entityType}
        existingAssessment={assessment ? {
          responses: assessment.responses as Record<string, unknown>,
          fitScore: assessment.fitScore,
          fitSummary: assessment.fitSummary,
          riskFlags: assessment.riskFlags as string[] | null,
        } : null}
        isComplete={isComplete}
      />
    </PhaseLayout>
  );
}
