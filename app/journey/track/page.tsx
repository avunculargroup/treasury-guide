import { requireUserProfile } from '@/lib/user';
import { getEntityLabel } from '@/lib/utils';
import { PhaseLayout } from '@/components/journey/phase-layout';
import { ChecklistTracker } from '@/components/checklist/checklist-tracker';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function TrackPage() {
  const profile = await requireUserProfile();

  const artifact = await prisma.artifact.findFirst({
    where: { userId: profile.id, type: 'implementation_checklist' },
    orderBy: { generatedAt: 'desc' },
    include: {
      checklistItems: { orderBy: { order: 'asc' } },
    },
  });

  if (!artifact) {
    redirect('/journey/plan');
  }

  // Update progress to in_progress if not already complete
  const progress = profile.progress.find((p) => p.phase === 4);
  if (!progress || progress.status === 'LOCKED' || progress.status === 'AVAILABLE') {
    await prisma.journeyProgress.upsert({
      where: { userId_phase: { userId: profile.id, phase: 4 } },
      update: { status: 'IN_PROGRESS' },
      create: { userId: profile.id, phase: 4, status: 'IN_PROGRESS' },
    });
  }

  const items = artifact.checklistItems.map((item) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    description: item.description,
    responsible: item.responsible,
    estimatedDays: item.estimatedDays,
    status: item.status as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED',
    notes: item.notes,
    blockedReason: item.blockedReason,
    order: item.order,
  }));

  return (
    <PhaseLayout
      title="Track"
      phase={4}
      entityLabel={getEntityLabel(profile.entityType)}
      displayName={profile.displayName}
    >
      <ChecklistTracker items={items} artifactId={artifact.id} />
    </PhaseLayout>
  );
}
