import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { toAISdkStream } from '@mastra/ai-sdk';
import { RequestContext } from '@mastra/core/request-context';
import { mastra } from '@/lib/mastra';
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

  const { messages, phase } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ success: false, error: 'Messages required' }, { status: 400 });
  }

  const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop();
  if (lastUserMessage) {
    await prisma.chatMessage.create({
      data: {
        userId: profile.id,
        role: 'user',
        content: typeof lastUserMessage.content === 'string'
          ? lastUserMessage.content
          : JSON.stringify(lastUserMessage.content),
        phase: phase || null,
      },
    });
  }

  const agent = mastra.getAgent('treasury-chat-assistant');

  const requestContext = new RequestContext<{ entityType: string; currentPhase: number }>([
    ['entityType', profile.entityType],
    ['currentPhase', phase || 1],
  ]);

  const agentStream = await agent.stream(messages, {
    requestContext,
  });

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

      if (fullResponse) {
        await prisma.chatMessage.create({
          data: {
            userId: profile.id,
            role: 'assistant',
            content: fullResponse,
            phase: phase || null,
          },
        });
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
