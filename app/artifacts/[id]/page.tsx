import { requireUserProfile } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ArtifactView } from '@/components/checklist/artifact-view';

interface ArtifactPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtifactPage({ params }: ArtifactPageProps) {
  const { id } = await params;
  const profile = await requireUserProfile();

  const artifact = await prisma.artifact.findUnique({
    where: { id },
    include: {
      checklistItems: { orderBy: { order: 'asc' } },
    },
  });

  if (!artifact || artifact.userId !== profile.id) {
    redirect('/journey');
  }

  const checklist = artifact.content as Record<string, unknown>;
  const items = artifact.checklistItems.map((item) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    description: item.description,
    responsible: item.responsible,
    estimatedDays: item.estimatedDays,
    status: item.status as string,
    order: item.order,
  }));

  return (
    <ArtifactView
      artifactId={artifact.id}
      title={artifact.title}
      generatedAt={artifact.generatedAt.toISOString()}
      checklist={checklist}
      items={items}
    />
  );
}
