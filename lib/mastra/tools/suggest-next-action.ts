import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface NextAction {
  action: string;
  reason: string;
  href: string;
}

const NEXT_ACTIONS: Record<number, Record<string, NextAction>> = {
  1: {
    default: {
      action: 'Read through the Learn phase content',
      reason: 'Understanding the fundamentals — tax treatment, custody models, and regulatory context — will help you make an informed decision in the next phase.',
      href: '/journey/learn',
    },
  },
  2: {
    default: {
      action: 'Complete the fit assessment questionnaire',
      reason: 'The assessment evaluates your organisation\'s risk appetite, cash reserves, and stakeholder considerations to produce a tailored fit score.',
      href: '/journey/decide',
    },
  },
  3: {
    SMSF: {
      action: 'Review SMSF-specific custody and legal requirements before planning your strategy',
      reason: 'SMSFs face strict SIS Act investment rules and sole purpose test requirements that constrain custody options and allocation size.',
      href: '/journey/plan',
    },
    NFP: {
      action: 'Review your constitution and funding covenants before committing to an allocation',
      reason: 'NFPs may have restrictions on speculative investments in their governing documents or grant conditions that must be addressed first.',
      href: '/journey/plan',
    },
    default: {
      action: 'Define your allocation size and custody structure',
      reason: 'These are the two highest-stakes decisions in the planning phase — everything else (accounting, purchase process, key management) flows from them.',
      href: '/journey/plan',
    },
  },
  4: {
    default: {
      action: 'Work through your implementation checklist and mark completed items',
      reason: 'Tracking progress keeps the project moving and surfaces blocked items early so you can resolve them with your advisers.',
      href: '/journey/track',
    },
  },
};

export const suggestNextActionTool = createTool({
  id: 'suggest-next-action',
  description:
    'Returns the most important next action for the user to take within the platform, based on their current phase and entity type. Use this when the user asks "what should I do next?" or seems unsure about how to proceed.',
  inputSchema: z.object({
    phase: z.number().min(1).max(4),
    entityType: z.string(),
  }),
  outputSchema: z.object({
    action: z.string(),
    reason: z.string(),
    href: z.string(),
  }),
  execute: async ({ phase, entityType }) => {
    const phaseActions = NEXT_ACTIONS[phase] ?? NEXT_ACTIONS[1];
    return phaseActions[entityType] ?? phaseActions['default'];
  },
});
