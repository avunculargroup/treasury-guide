import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

  const { phase, status } = await req.json();

  if (!phase || typeof phase !== 'number' || phase < 1 || phase > 4) {
    return NextResponse.json({ success: false, error: 'Invalid phase' }, { status: 400 });
  }

  const validStatuses = ['AVAILABLE', 'IN_PROGRESS', 'COMPLETE'];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
  }

  await prisma.journeyProgress.upsert({
    where: { userId_phase: { userId: profile.id, phase } },
    update: {
      status,
      completedAt: status === 'COMPLETE' ? new Date() : null,
    },
    create: {
      userId: profile.id,
      phase,
      status,
      completedAt: status === 'COMPLETE' ? new Date() : null,
    },
  });

  // Unlock next phase when current is completed
  if (status === 'COMPLETE' && phase < 4) {
    const nextPhase = phase + 1;
    const nextProgress = await prisma.journeyProgress.findUnique({
      where: { userId_phase: { userId: profile.id, phase: nextPhase } },
    });

    if (!nextProgress || nextProgress.status === 'LOCKED') {
      await prisma.journeyProgress.upsert({
        where: { userId_phase: { userId: profile.id, phase: nextPhase } },
        update: { status: 'AVAILABLE' },
        create: { userId: profile.id, phase: nextPhase, status: 'AVAILABLE' },
      });
    }
  }

  return NextResponse.json({ success: true });
}
