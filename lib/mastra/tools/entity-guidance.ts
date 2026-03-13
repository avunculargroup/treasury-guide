import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { EntityGuidance } from '@/types';

export const getEntityGuidanceTool = createTool({
  id: 'get-entity-guidance',
  description: 'Returns regulatory context and key considerations for a specific Australian entity type. Use this to provide accurate, entity-specific guidance.',
  inputSchema: z.object({
    entityType: z.enum(['SMSF', 'SOLE_TRADER', 'NFP', 'PRIVATE_COMPANY', 'PUBLIC_COMPANY']),
  }),
  outputSchema: z.object({
    guidance: z.any(),
  }),
  execute: async ({ entityType }) => {
    const slugMap: Record<string, string> = {
      SMSF: 'smsf',
      SOLE_TRADER: 'sole-trader',
      NFP: 'nfp',
      PRIVATE_COMPANY: 'private-company',
      PUBLIC_COMPANY: 'public-company',
    };

    const slug = slugMap[entityType];
    const filePath = join(process.cwd(), 'content', 'entities', slug, 'guidance.json');

    try {
      const data = await readFile(filePath, 'utf-8');
      const guidance: EntityGuidance = JSON.parse(data);
      return { guidance };
    } catch {
      return {
        guidance: {
          entityType,
          regulatoryBodies: [],
          keyLegislation: [],
          keyConsiderations: ['Guidance data not available for this entity type'],
          commonRisks: [],
          recommendedProfessionals: [],
        },
      };
    }
  },
});
