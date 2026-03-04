import { Mastra } from '@mastra/core';
import { treasuryChatAgent } from './agents/chat-agent';

export const mastra = new Mastra({
  agents: {
    'treasury-chat-assistant': treasuryChatAgent,
  },
});
