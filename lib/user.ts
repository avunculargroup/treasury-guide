import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function requireUserProfile() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: { progress: true },
  });

  if (!profile) redirect('/onboarding');
  return profile;
}

export async function getUserProfile() {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: { progress: true },
  });
}
