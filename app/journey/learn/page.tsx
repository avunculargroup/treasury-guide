import { requireUserProfile } from '@/lib/user';
import { getEntityLabel } from '@/lib/utils';
import { getLearnModules } from '@/lib/content';
import { PhaseLayout } from '@/components/journey/phase-layout';
import { LearnContent } from '@/components/journey/learn-content';

export default async function LearnPage() {
  const profile = await requireUserProfile();
  const modules = getLearnModules(profile.entityType);

  const progress = profile.progress.find((p) => p.phase === 1);
  const isComplete = progress?.status === 'COMPLETE';

  return (
    <PhaseLayout
      title="Learn"
      phase={1}
      entityLabel={getEntityLabel(profile.entityType)}
      displayName={profile.displayName}
    >
      <LearnContent modules={modules} isComplete={isComplete} entityType={profile.entityType} />
    </PhaseLayout>
  );
}
