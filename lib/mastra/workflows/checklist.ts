import { generateObject } from 'ai';
import { z } from 'zod';
import { fastModel } from '@/lib/ai';
import { getChecklistTemplate } from '@/lib/content';
import type {
  EntityType,
  AssessmentResponses,
  PlanningResponses,
  ChecklistOutput,
} from '@/types';

const checklistSchema = z.object({
  title: z.string(),
  categories: z.array(z.object({
    name: z.string(),
    description: z.string(),
    items: z.array(z.object({
      title: z.string(),
      description: z.string(),
      responsible: z.string(),
      estimatedDays: z.number().int(),
    })),
  })),
});

export async function runChecklistGeneration(
  entityType: EntityType,
  assessmentResponses: AssessmentResponses | Record<string, unknown>,
  planningResponses: PlanningResponses
): Promise<ChecklistOutput> {
  const template = getChecklistTemplate(entityType);

  const entitySpecificCategories = [
    entityType === 'SMSF' ? '"SMSF Trust Deed & Investment Strategy Update"' : '',
    entityType === 'PUBLIC_COMPANY' ? '"ASX/ASIC Disclosure Requirements"' : '',
    entityType === 'NFP' ? '"Board & Governance Approvals" and "Donor/Grant Compliance Review"' : '',
  ].filter(Boolean);

  const prompt = `Generate a personalised Bitcoin treasury implementation checklist for an Australian ${entityType}.

Assessment: ${JSON.stringify(assessmentResponses)}
Preferences: custody=${planningResponses.custodyPreference}, allocation=${planningResponses.allocationApproach}, target=${planningResponses.targetAllocationPercent}%
${template ? `Base template for reference: ${JSON.stringify(template.categories.map(c => c.name))}` : ''}

Required categories:
1. Internal Approval & Governance
2. Legal & Compliance
3. Accounting & Tax Preparation
4. Custody & Security Setup (for ${planningResponses.custodyPreference})
5. Banking & Fiat On-ramp
6. First Purchase Execution (${planningResponses.allocationApproach} approach)
7. Ongoing Maintenance
${entitySpecificCategories.length ? `Also include: ${entitySpecificCategories.join(', ')}` : ''}

3-5 actionable items per category. Reference Australian requirements (ATO, ASIC) where applicable.`;

  try {
    const { object } = await generateObject({
      model: fastModel,
      schema: checklistSchema,
      prompt,
    });

    return {
      title: object.title,
      entityType,
      generatedAt: new Date().toISOString(),
      categories: object.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item, idx) => ({ ...item, order: idx + 1 })),
      })),
    };
  } catch (err) {
    console.error('AI generation failed, using fallback:', err);

    if (template) {
      return { ...template, generatedAt: new Date().toISOString() };
    }

    return {
      title: 'Bitcoin Treasury Implementation Checklist',
      entityType,
      generatedAt: new Date().toISOString(),
      categories: [
        {
          name: 'Internal Approval & Governance',
          description: 'Secure internal approval for the Bitcoin treasury strategy',
          items: [
            { title: 'Draft treasury policy amendment', description: 'Create a policy document outlining the Bitcoin allocation strategy', responsible: 'CFO', estimatedDays: 14, order: 1 },
            { title: 'Present to board/decision-makers', description: 'Present the proposal with risk assessment and implementation plan', responsible: 'CFO', estimatedDays: 7, order: 2 },
          ],
        },
        {
          name: 'Legal & Compliance Setup',
          description: 'Ensure legal and regulatory compliance',
          items: [
            { title: 'Engage legal adviser', description: 'Consult with a lawyer experienced in digital assets and Australian corporate law', responsible: 'Legal', estimatedDays: 7, order: 1 },
          ],
        },
        {
          name: 'Custody & Security Setup',
          description: 'Set up secure custody for Bitcoin holdings',
          items: [
            { title: 'Select and set up custody solution', description: `Set up ${planningResponses.custodyPreference} custody solution`, responsible: 'IT', estimatedDays: 14, order: 1 },
          ],
        },
      ],
    };
  }
}
