import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const phase = searchParams.get('phase') ? Number(searchParams.get('phase')) : null;

  const messages = await prisma.chatMessage.findMany({
    where: {
      userId: profile.id,
      ...(phase !== null ? { phase } : {}),
    },
    orderBy: { createdAt: 'asc' },
    take: 20,
    select: { id: true, role: true, content: true },
  });

  return NextResponse.json({ success: true, messages });
}
