import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
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

  const stream = await agent.stream(messages, {
    requestContext,
  });

  let fullResponse = '';

  const uiMessageStream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      for await (const part of toAISdkStream(stream, { from: 'agent' })) {
        if (part.type === 'text-delta' && 'delta' in part && typeof part.delta === 'string') {
          fullResponse += part.delta;
        }
        await writer.write(part);
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

  return createUIMessageStreamResponse({
    stream: uiMessageStream,
  });
}
