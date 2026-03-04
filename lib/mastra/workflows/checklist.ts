import { generateText } from 'ai';
import { defaultModel } from '@/lib/ai';
import { getChecklistTemplate } from '@/lib/content';
import type {
  EntityType,
  AssessmentResponses,
  PlanningResponses,
  ChecklistOutput,
} from '@/types';

export async function runChecklistGeneration(
  entityType: EntityType,
  assessmentResponses: AssessmentResponses | Record<string, unknown>,
  planningResponses: PlanningResponses
): Promise<ChecklistOutput> {
  const template = getChecklistTemplate(entityType);

  const prompt = `You are generating a personalised Bitcoin treasury implementation checklist for an Australian entity.

Entity Type: ${entityType}
Assessment Data: ${JSON.stringify(assessmentResponses, null, 2)}
Planning Preferences: ${JSON.stringify(planningResponses, null, 2)}
${template ? `Base Template: ${JSON.stringify(template, null, 2)}` : ''}

Generate a comprehensive, personalised implementation checklist as JSON with this exact structure:
{
  "title": "Bitcoin Treasury Implementation Checklist",
  "entityType": "${entityType}",
  "generatedAt": "${new Date().toISOString()}",
  "categories": [
    {
      "name": "Category Name",
      "description": "Brief description of this category",
      "items": [
        {
          "title": "Task title",
          "description": "Detailed task description with specific guidance for this entity type",
          "responsible": "Who is responsible (e.g., CFO, Board, Accountant, Legal, IT)",
          "estimatedDays": 14,
          "order": 1
        }
      ]
    }
  ]
}

Required categories (adapt items based on entity type and preferences):
1. Internal Approval & Governance
2. Legal & Compliance Setup
3. Accounting & Tax Preparation
4. Custody & Security Setup (personalise based on custody preference: ${planningResponses.custodyPreference})
5. Banking & Fiat On-ramp
6. First Purchase Execution (personalise based on allocation approach: ${planningResponses.allocationApproach})
7. Ongoing Maintenance Setup

${entityType === 'SMSF' ? 'ALSO include: "SMSF Trust Deed & Investment Strategy Update" category' : ''}
${entityType === 'PUBLIC_COMPANY' ? 'ALSO include: "ASX/ASIC Disclosure Requirements" category' : ''}
${entityType === 'NFP' ? 'ALSO include: "Board & Governance Approvals" and "Donor/Grant Compliance Review" categories' : ''}

Each category should have 3-5 specific, actionable items.
Items should reference Australian-specific requirements where applicable.
Return valid JSON only, no other text.`;

  const { text } = await generateText({
    model: defaultModel,
    prompt,
    maxOutputTokens: 4096,
  });

  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned) as ChecklistOutput;

    // Validate structure
    if (!result.categories || !Array.isArray(result.categories)) {
      throw new Error('Invalid checklist structure');
    }

    return result;
  } catch {
    // Fallback to template or basic checklist
    if (template) {
      return {
        ...template,
        generatedAt: new Date().toISOString(),
      };
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
            {
              title: 'Draft treasury policy amendment',
              description: 'Create a policy document outlining the Bitcoin allocation strategy',
              responsible: 'CFO',
              estimatedDays: 14,
              order: 1,
            },
            {
              title: 'Present to board/decision-makers',
              description: 'Present the proposal with risk assessment and implementation plan',
              responsible: 'CFO',
              estimatedDays: 7,
              order: 2,
            },
          ],
        },
        {
          name: 'Legal & Compliance Setup',
          description: 'Ensure legal and regulatory compliance',
          items: [
            {
              title: 'Engage legal adviser',
              description: 'Consult with a lawyer experienced in digital assets and Australian corporate law',
              responsible: 'Legal',
              estimatedDays: 7,
              order: 1,
            },
          ],
        },
        {
          name: 'Custody & Security Setup',
          description: 'Set up secure custody for Bitcoin holdings',
          items: [
            {
              title: 'Select and set up custody solution',
              description: `Set up ${planningResponses.custodyPreference} custody solution`,
              responsible: 'IT',
              estimatedDays: 14,
              order: 1,
            },
          ],
        },
      ],
    };
  }
}
