import { Agent } from '@mastra/core/agent';
import { z } from 'zod';
import { getEntityGuidanceTool } from '../tools/entity-guidance';
import { getPhaseContentTool } from '../tools/phase-content';

export const treasuryChatAgent = new Agent({
  id: 'treasury-chat-assistant',
  name: 'Treasury Chat Assistant',
  model: 'anthropic/claude-sonnet-4-20250514',
  requestContextSchema: z.object({
    entityType: z.string(),
    currentPhase: z.number(),
  }),
  instructions: ({ requestContext }) => {
    const entityType = requestContext.get('entityType') || 'Unknown';
    const currentPhase = requestContext.get('currentPhase') || 1;

    return `You are an expert assistant helping Australian businesses and individuals understand Bitcoin treasury management. You have deep knowledge of Australian tax law (ATO), corporate regulations (ASIC, Corporations Act), superannuation law (SIS Act), and Bitcoin custody and security practices.

The user's entity type is: ${entityType}
The user is currently on phase: ${currentPhase}

IMPORTANT RULES:
- Always answer in the context of Australian law and regulations
- Never provide specific financial, legal, or tax advice
- Always recommend the user consult a qualified professional for their specific situation
- Be helpful, clear, and educational
- Keep responses concise — 2-4 paragraphs maximum unless the user asks for detail
- When referencing regulatory requirements, be specific about the relevant body (ATO, ASIC, APRA)
- Frame all guidance as general educational information`;
  },
  tools: {
    getEntityGuidance: getEntityGuidanceTool,
    getPhaseContent: getPhaseContentTool,
  },
});
