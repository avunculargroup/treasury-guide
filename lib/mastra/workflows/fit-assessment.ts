import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { EntityType, AssessmentResponses, FitAssessmentResult, FitScore } from '@/types';

function calculatePreliminaryScore(
  entityType: EntityType,
  responses: AssessmentResponses
): FitScore {
  // Rule-based scoring
  if (
    entityType === 'SMSF' &&
    responses.riskAppetite === 'low' &&
    responses.cashReserveBand === '<$100k'
  ) {
    return 'NOT_RECOMMENDED';
  }

  if (
    responses.riskAppetite === 'high' &&
    ['$2m-$10m', '$10m+'].includes(responses.cashReserveBand) &&
    ['3-5yrs', '5yrs+'].includes(responses.investmentHorizon)
  ) {
    return 'RECOMMENDED';
  }

  if (responses.investmentHorizon === '<1yr') {
    return 'NOT_RECOMMENDED';
  }

  if (
    responses.riskAppetite === 'low' &&
    responses.cashReserveBand === '<$100k'
  ) {
    return 'NOT_RECOMMENDED';
  }

  return 'EXPLORE_FURTHER';
}

export async function runFitAssessment(
  entityType: EntityType,
  responses: AssessmentResponses
): Promise<FitAssessmentResult> {
  const prelimScore = calculatePreliminaryScore(entityType, responses);

  const prompt = `You are assessing whether a Bitcoin treasury is appropriate for the following Australian entity.

Entity Type: ${entityType}
Assessment Responses: ${JSON.stringify(responses, null, 2)}
Preliminary Score: ${prelimScore}

Provide a JSON response with:
- fitScore: "RECOMMENDED" | "EXPLORE_FURTHER" | "NOT_RECOMMENDED"
- fitSummary: plain English explanation in 3-5 sentences, specific to their entity type and responses
- riskFlags: array of 3-5 specific risks relevant to this entity type and their situation

Consider Australian regulatory context. Be honest if Bitcoin is not appropriate.
Return valid JSON only, no other text.`;

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    prompt,
  });

  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned) as FitAssessmentResult;

    // Validate the result
    const validScores: FitScore[] = ['RECOMMENDED', 'EXPLORE_FURTHER', 'NOT_RECOMMENDED'];
    if (!validScores.includes(result.fitScore)) {
      result.fitScore = prelimScore;
    }
    if (!result.fitSummary || typeof result.fitSummary !== 'string') {
      result.fitSummary = 'Assessment completed but summary generation encountered an issue.';
    }
    if (!Array.isArray(result.riskFlags)) {
      result.riskFlags = [];
    }

    return result;
  } catch {
    // Fallback if AI response parsing fails
    return {
      fitScore: prelimScore,
      fitSummary:
        'Based on the preliminary assessment of your responses, we have generated a score. For a more detailed analysis, please try again or consult with a qualified adviser.',
      riskFlags: [
        'Volatility risk — Bitcoin can experience significant price swings',
        'Regulatory uncertainty — Australian crypto regulation is evolving',
        'Operational complexity — requires new processes and expertise',
      ],
    };
  }
}
