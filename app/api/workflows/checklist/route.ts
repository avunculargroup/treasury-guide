import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runChecklistGeneration } from '@/lib/mastra/workflows/checklist';
import type { EntityType, PlanningResponses } from '@/types';
import type { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  if (!profile) {
    return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
  }

  const body = await req.json();
  const {
    entityType,
    assessmentResponses,
    planningResponses,
  } = body as {
    entityType: EntityType;
    assessmentResponses: Record<string, unknown>;
    planningResponses: PlanningResponses;
  };

  if (!entityType || !planningResponses) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const checklist = await runChecklistGeneration(
      entityType,
      assessmentResponses || {},
      planningResponses
    );

    // Create artifact and checklist items
    const artifact = await prisma.artifact.create({
      data: {
        userId: profile.id,
        type: 'implementation_checklist',
        title: checklist.title,
        content: JSON.parse(JSON.stringify(checklist)) as Prisma.InputJsonValue,
        checklistItems: {
          create: checklist.categories.flatMap((category, catIdx) =>
            category.items.map((item, itemIdx) => ({
              category: category.name,
              title: item.title,
              description: item.description,
              responsible: item.responsible,
              estimatedDays: item.estimatedDays,
              order: catIdx * 100 + itemIdx + 1,
              status: 'NOT_STARTED' as const,
            }))
          ),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { artifactId: artifact.id },
    });
  } catch (err) {
    console.error('Checklist generation error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to generate checklist' },
      { status: 500 }
    );
  }
}
