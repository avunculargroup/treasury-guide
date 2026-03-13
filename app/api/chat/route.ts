import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { toAISdkStream } from '@mastra/ai-sdk';
import { RequestContext } from '@mastra/core/request-context';
import { mastra } from '@/lib/mastra';
import { prisma } from '@/lib/prisma';

// Simple in-process cache to avoid a DB lookup on every chat message.
// Entries expire after 60 seconds.
const profileCache = new Map<string, { profile: { id: string; entityType: string }; expiresAt: number }>();

async function getCachedProfile(userId: string) {
  const cached = profileCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.profile;

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, entityType: true },
  });

  if (profile) {
    profileCache.set(userId, { profile, expiresAt: Date.now() + 60_000 });
  }

  return profile;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getCachedProfile(userId);

  if (!profile) {
    return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
  }

  const { messages, phase, pathname } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ success: false, error: 'Messages required' }, { status: 400 });
  }

  const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop();

  // Write the user message and start the agent stream concurrently — no need to
  // wait for the DB write before we start producing tokens.
  const userMessageWrite = lastUserMessage
    ? prisma.chatMessage.create({
        data: {
          userId: profile.id,
          role: 'user',
          content: typeof lastUserMessage.content === 'string'
            ? lastUserMessage.content
            : JSON.stringify(lastUserMessage.content),
          phase: phase || null,
        },
      }).catch((err: unknown) => console.error('Failed to save user message:', err))
    : Promise.resolve();

  const agent = mastra.getAgent('treasury-chat-assistant');

  const requestContext = new RequestContext<{ entityType: string; currentPhase: number; pathname: string }>([
    ['entityType', profile.entityType],
    ['currentPhase', phase || 1],
    ['pathname', pathname || ''],
  ]);

  const [agentStream] = await Promise.all([
    agent.stream(messages, { requestContext }),
    userMessageWrite,
  ]);

  let fullResponse = '';
  const encoder = new TextEncoder();

  // Stream in data stream protocol format (`0:"delta"` per line) so the
  // client-side manual parser can read text deltas correctly.
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of toAISdkStream(agentStream, { from: 'agent' })) {
          if (part.type === 'text-delta' && 'delta' in part && typeof part.delta === 'string') {
            fullResponse += part.delta;
            controller.enqueue(encoder.encode(`0:${JSON.stringify(part.delta)}\n`));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  // Persist the assistant response after streaming completes. We do this by
  // piping through a TransformStream that accumulates the full response, then
  // saves it once the readable is fully consumed on the client.
  const saveAfterStream = readable.pipeThrough(
    new TransformStream({
      transform(chunk, ctrl) {
        ctrl.enqueue(chunk);
      },
      async flush() {
        if (fullResponse) {
          await prisma.chatMessage.create({
            data: {
              userId: profile.id,
              role: 'assistant',
              content: fullResponse,
              phase: phase || null,
            },
          }).catch((err: unknown) => console.error('Failed to save assistant message:', err));
        }
      },
    }),
  );

  return new Response(saveAfterStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
