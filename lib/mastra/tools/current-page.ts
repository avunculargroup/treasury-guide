import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getPageInfo } from '@/lib/content/page-map';

export const getCurrentPageTool = createTool({
  id: 'get-current-page',
  description:
    'Returns the title, description, and suggested questions for the page the user is currently viewing. Use this when you need context about what the user is looking at to give a more relevant answer.',
  inputSchema: z.object({
    pathname: z.string().describe('The current URL pathname, e.g. /journey/learn'),
  }),
  outputSchema: z.object({
    pageTitle: z.string(),
    description: z.string(),
    suggestedQuestions: z.array(z.string()),
  }),
  execute: async ({ pathname }) => {
    return getPageInfo(pathname);
  },
});
