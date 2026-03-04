import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runFitAssessment } from '@/lib/mastra/workflows/fit-assessment';
import type { AssessmentResponses, EntityType } from '@/types';
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
  const { entityType, responses } = body as {
    entityType: EntityType;
    responses: AssessmentResponses;
  };

  if (!entityType || !responses) {
    return NextResponse.json(
      { success: false, error: 'Entity type and responses are required' },
      { status: 400 }
    );
  }

  try {
    const result = await runFitAssessment(entityType, responses);

    const responsesJson = JSON.parse(JSON.stringify(responses)) as Prisma.InputJsonValue;
    const riskFlagsJson = JSON.parse(JSON.stringify(result.riskFlags)) as Prisma.InputJsonValue;

    // Persist assessment
    const existing = await prisma.assessment.findFirst({
      where: { userId: profile.id },
      select: { id: true },
    });

    if (existing) {
      await prisma.assessment.update({
        where: { id: existing.id },
        data: {
          responses: responsesJson,
          fitScore: result.fitScore,
          fitSummary: result.fitSummary,
          riskFlags: riskFlagsJson,
        },
      });
    } else {
      await prisma.assessment.create({
        data: {
          userId: profile.id,
          responses: responsesJson,
          fitScore: result.fitScore,
          fitSummary: result.fitSummary,
          riskFlags: riskFlagsJson,
        },
      });
    }

    // Update progress to in_progress
    await prisma.journeyProgress.upsert({
      where: { userId_phase: { userId: profile.id, phase: 2 } },
      update: { status: 'IN_PROGRESS' },
      create: { userId: profile.id, phase: 2, status: 'IN_PROGRESS' },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('Fit assessment error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}
