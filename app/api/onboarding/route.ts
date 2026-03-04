import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { EntityType } from '@/types';

const VALID_ENTITY_TYPES: EntityType[] = [
  'SMSF', 'SOLE_TRADER', 'NFP', 'PRIVATE_COMPANY', 'PUBLIC_COMPANY',
];

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { entityType, displayName } = body;

  if (!entityType || !VALID_ENTITY_TYPES.includes(entityType)) {
    return NextResponse.json({ success: false, error: 'Invalid entity type' }, { status: 400 });
  }
  if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
    return NextResponse.json({ success: false, error: 'Display name is required' }, { status: 400 });
  }

  const existing = await prisma.userProfile.findUnique({ where: { clerkUserId: userId } });
  if (existing) {
    return NextResponse.json({ success: false, error: 'Profile already exists' }, { status: 409 });
  }

  const profile = await prisma.userProfile.create({
    data: {
      clerkUserId: userId,
      displayName: displayName.trim(),
      entityType,
      progress: {
        create: [
          { phase: 1, status: 'AVAILABLE' },
          { phase: 2, status: 'LOCKED' },
          { phase: 3, status: 'LOCKED' },
          { phase: 4, status: 'LOCKED' },
        ],
      },
    },
  });

  return NextResponse.json({ success: true, data: { profileId: profile.id } });
}
