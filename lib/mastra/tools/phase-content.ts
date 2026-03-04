import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const PHASE_SUMMARIES: Record<number, { title: string; description: string; topics: string[] }> = {
  1: {
    title: 'Learn',
    description: 'Educational phase covering Bitcoin treasury fundamentals and Australian regulatory context.',
    topics: [
      'What is a Bitcoin treasury and why companies hold Bitcoin',
      'Australian regulatory landscape: ATO, ASIC, APRA',
      'Tax treatment: CGT vs trading stock',
      'Custody models: exchange, third-party, self-custody, multi-sig',
      'Key risks: volatility, custody, regulatory, reputational',
    ],
  },
  2: {
    title: 'Decide',
    description: 'Assessment phase where users evaluate their organisation\'s fit for a Bitcoin treasury.',
    topics: [
      'Risk appetite assessment',
      'Cash reserve and investment horizon evaluation',
      'Existing treasury policy review',
      'Stakeholder considerations',
      'Prior crypto exposure assessment',
      'AI-generated fit assessment with risk flags',
    ],
  },
  3: {
    title: 'Plan',
    description: 'Strategy development phase for building an implementation plan.',
    topics: [
      'Allocation sizing: percentage of treasury, DCA vs lump sum',
      'Legal and structural considerations by entity type',
      'Custody selection framework',
      'Accounting policy elections',
      'Purchase process and approval workflows',
      'Security and key management',
    ],
  },
  4: {
    title: 'Track',
    description: 'Implementation tracking phase with checklist monitoring.',
    topics: [
      'Implementation checklist progress',
      'Task status tracking',
      'Blocked item management',
      'Category-level progress monitoring',
    ],
  },
};

export const getPhaseContentTool = createTool({
  id: 'get-phase-content',
  description: 'Returns a summary of the current phase content and key topics. Use this to understand what the user is currently working on.',
  inputSchema: z.object({
    phase: z.number().min(1).max(4),
  }),
  outputSchema: z.object({
    summary: z.any(),
  }),
  execute: async ({ phase }) => {
    const summary = PHASE_SUMMARIES[phase] || PHASE_SUMMARIES[1];
    return { summary };
  },
});
