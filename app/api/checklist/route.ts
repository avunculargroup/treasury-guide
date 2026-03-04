import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
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

  const { itemId, status, notes, blockedReason } = await req.json();

  if (!itemId) {
    return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
  }

  // Verify the item belongs to this user
  const item = await prisma.checklistItem.findUnique({
    where: { id: itemId },
    include: { artifact: { select: { userId: true } } },
  });

  if (!item || item.artifact.userId !== profile.id) {
    return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;
  if (blockedReason !== undefined) updateData.blockedReason = blockedReason;

  await prisma.checklistItem.update({
    where: { id: itemId },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}
