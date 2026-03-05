'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { PostAssessmentCTA } from '@/components/promotions/PostAssessmentCTA';
import { Button } from '@/components/ui/button';
import { cn, getDefaultBoardApproval, getDefaultListedEntity } from '@/lib/utils';
import type {
  EntityType,
  AssessmentResponses,
  RiskAppetite,
  CashReserveBand,
  InvestmentHorizon,
  PriorCryptoExposure,
  FitScore,
} from '@/types';

interface AssessmentFormProps {
  entityType: EntityType;
  existingAssessment: {
    responses: Record<string, unknown>;
    fitScore: FitScore | null;
    fitSummary: string | null;
    riskFlags: string[] | null;
  } | null;
  isComplete: boolean;
}

const RISK_OPTIONS: { value: RiskAppetite; label: string }[] = [
  { value: 'low', label: 'Low — Preserve capital, minimal risk' },
  { value: 'medium', label: 'Medium — Balanced growth and preservation' },
  { value: 'high', label: 'High — Growth-focused, can tolerate drawdowns' },
];

const CASH_RESERVE_OPTIONS: { value: CashReserveBand; label: string }[] = [
  { value: '<$100k', label: 'Under $100,000' },
  { value: '$100k-$500k', label: '$100,000 – $500,000' },
  { value: '$500k-$2m', label: '$500,000 – $2,000,000' },
  { value: '$2m-$10m', label: '$2,000,000 – $10,000,000' },
  { value: '$10m+', label: 'Over $10,000,000' },
];

const HORIZON_OPTIONS: { value: InvestmentHorizon; label: string }[] = [
  { value: '<1yr', label: 'Less than 1 year' },
  { value: '1-3yrs', label: '1 – 3 years' },
  { value: '3-5yrs', label: '3 – 5 years' },
  { value: '5yrs+', label: '5+ years' },
];

const CRYPTO_EXPOSURE_OPTIONS: { value: PriorCryptoExposure; label: string }[] = [
  { value: 'none', label: 'None — First time considering crypto' },
  { value: 'some', label: 'Some — Limited personal or business exposure' },
  { value: 'significant', label: 'Significant — Active involvement in crypto' },
];

const SOFTWARE_OPTIONS = ['Xero', 'MYOB', 'QuickBooks', 'Other', 'None'];

const radioOptionClass = (selected: boolean) =>
  cn(
    'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
    selected
      ? 'border-[#C9A84C] bg-[#FAF5E8]'
      : 'border-[#E8E6E0] hover:bg-[#F4F4F1]'
  );

const selectClass =
  'mt-2 w-full rounded-md border border-[#E8E6E0] bg-white px-4 py-2 text-sm text-navy-900 focus:border-[#C9A84C] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20';

export function AssessmentForm({ entityType, existingAssessment, isComplete }: AssessmentFormProps) {
  const router = useRouter();
  const existing = existingAssessment?.responses as Partial<AssessmentResponses> | undefined;

  const [responses, setResponses] = useState<AssessmentResponses>({
    riskAppetite: (existing?.riskAppetite as RiskAppetite) || 'medium',
    cashReserveBand: (existing?.cashReserveBand as CashReserveBand) || '$100k-$500k',
    investmentHorizon: (existing?.investmentHorizon as InvestmentHorizon) || '1-3yrs',
    hasTreasuryPolicy: existing?.hasTreasuryPolicy ?? false,
    accountingSoftware: existing?.accountingSoftware || 'Xero',
    stakeholderConcerns: existing?.stakeholderConcerns ?? false,
    priorCryptoExposure: (existing?.priorCryptoExposure as PriorCryptoExposure) || 'none',
    boardApprovalRequired: existing?.boardApprovalRequired ?? getDefaultBoardApproval(entityType),
    listedEntity: existing?.listedEntity ?? getDefaultListedEntity(entityType),
  });

  const [result, setResult] = useState<{
    fitScore: FitScore;
    fitSummary: string;
    riskFlags: string[];
  } | null>(
    existingAssessment?.fitScore
      ? {
          fitScore: existingAssessment.fitScore,
          fitSummary: existingAssessment.fitSummary || '',
          riskFlags: (existingAssessment.riskFlags || []) as string[],
        }
      : null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateField<K extends keyof AssessmentResponses>(key: K, value: AssessmentResponses[K]) {
    setResponses((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/workflows/fit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, responses }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Assessment failed');
        return;
      }

      setResult(data.data);
    } catch {
      setError('Failed to generate assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCompletePhase() {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase: 2, status: 'COMPLETE' }),
    });
    router.push('/journey');
    router.refresh();
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="mb-5 rounded-md bg-[#F4F4F1] px-4 py-2.5 text-xs text-navy-500">
            This assessment provides general information only and does not constitute financial advice.
          </div>

          <h2 className="font-display text-xl font-semibold text-navy-900">Your fit assessment</h2>

          <div className="mt-4">
            <span
              className={cn(
                'inline-block rounded-[4px] px-4 py-1.5 text-sm font-semibold uppercase tracking-wide',
                result.fitScore === 'RECOMMENDED'
                  ? 'bg-[#E8F4EF] text-[#3D7A5E]'
                  : result.fitScore === 'EXPLORE_FURTHER'
                    ? 'bg-[#F0E4C0] text-[#9A7A2E]'
                    : 'bg-[#F9EDED] text-[#B04040]'
              )}
            >
              {result.fitScore === 'RECOMMENDED'
                ? 'Recommended'
                : result.fitScore === 'EXPLORE_FURTHER'
                  ? 'Explore further'
                  : 'Not recommended'}
            </span>
          </div>

          <p className="mt-5 leading-relaxed text-navy-600">{result.fitSummary}</p>

          {result.riskFlags.length > 0 && (
            <div className="mt-6 border-t border-[#E8E6E0] pt-5">
              <h3 className="text-sm font-semibold text-navy-900">Key risk flags</h3>
              <ul className="mt-3 space-y-2.5">
                {result.riskFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-600">
                    <span className="mt-0.5 text-[#B8860B]">⚠</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <PostAssessmentCTA fitScore={result.fitScore} entityType={entityType} />

        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => setResult(null)}>
            Retake assessment
          </Button>
          {!isComplete && (
            <Button size="lg" onClick={handleCompletePhase}>
              Continue to Phase 3
            </Button>
          )}
          {isComplete && (
            <Button variant="secondary" onClick={() => router.push('/journey')}>
              Back to dashboard
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="font-display text-xl font-semibold text-navy-900">Company fit assessment</h2>
        <p className="mt-2 text-sm leading-relaxed text-navy-500">
          Answer these questions to receive a personalised assessment of whether a Bitcoin treasury
          strategy is appropriate for your entity.
        </p>
      </Card>

      {/* Risk Appetite */}
      <Card>
        <label className="block text-sm font-medium text-navy-900">Risk appetite</label>
        <div className="mt-3 space-y-2">
          {RISK_OPTIONS.map((opt) => (
            <label key={opt.value} className={radioOptionClass(responses.riskAppetite === opt.value)}>
              <input
                type="radio"
                name="riskAppetite"
                value={opt.value}
                checked={responses.riskAppetite === opt.value}
                onChange={() => updateField('riskAppetite', opt.value)}
                className="accent-[#C9A84C]"
              />
              <span className="text-sm text-navy-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Cash Reserve Band */}
      <Card>
        <label className="block text-sm font-medium text-navy-900">Available cash reserves</label>
        <select
          value={responses.cashReserveBand}
          onChange={(e) => updateField('cashReserveBand', e.target.value as CashReserveBand)}
          className={selectClass}
        >
          {CASH_RESERVE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </Card>

      {/* Investment Horizon */}
      <Card>
        <label className="block text-sm font-medium text-navy-900">Investment horizon</label>
        <div className="mt-3 space-y-2">
          {HORIZON_OPTIONS.map((opt) => (
            <label key={opt.value} className={radioOptionClass(responses.investmentHorizon === opt.value)}>
              <input
                type="radio"
                name="investmentHorizon"
                value={opt.value}
                checked={responses.investmentHorizon === opt.value}
                onChange={() => updateField('investmentHorizon', opt.value)}
                className="accent-[#C9A84C]"
              />
              <span className="text-sm text-navy-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Prior Crypto Exposure */}
      <Card>
        <label className="block text-sm font-medium text-navy-900">Prior crypto exposure</label>
        <div className="mt-3 space-y-2">
          {CRYPTO_EXPOSURE_OPTIONS.map((opt) => (
            <label key={opt.value} className={radioOptionClass(responses.priorCryptoExposure === opt.value)}>
              <input
                type="radio"
                name="priorCryptoExposure"
                value={opt.value}
                checked={responses.priorCryptoExposure === opt.value}
                onChange={() => updateField('priorCryptoExposure', opt.value)}
                className="accent-[#C9A84C]"
              />
              <span className="text-sm text-navy-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Accounting Software */}
      <Card>
        <label className="block text-sm font-medium text-navy-900">Accounting software</label>
        <select
          value={responses.accountingSoftware}
          onChange={(e) => updateField('accountingSoftware', e.target.value)}
          className={selectClass}
        >
          {SOFTWARE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </Card>

      {/* Boolean toggles */}
      <Card>
        <div className="space-y-5">
          {[
            { key: 'hasTreasuryPolicy' as const, label: 'Do you have an existing treasury policy?' },
            { key: 'stakeholderConcerns' as const, label: 'Are there shareholders, beneficiaries, or members to consider?' },
            { key: 'boardApprovalRequired' as const, label: 'Is board approval required for investment decisions?' },
            { key: 'listedEntity' as const, label: 'Is this a listed entity (ASX or other exchange)?' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-navy-700">{label}</span>
              <button
                type="button"
                onClick={() => updateField(key, !responses[key])}
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150',
                  responses[key] ? 'bg-[#C9A84C]' : 'bg-[#D5D2CA]'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150',
                    responses[key] && 'translate-x-5'
                  )}
                />
              </button>
            </label>
          ))}
        </div>
      </Card>

      {error && <p className="text-center text-sm text-[#B04040]">{error}</p>}

      <div className="text-center">
        <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Generating assessment...' : 'Generate fit assessment'}
        </Button>
      </div>
    </div>
  );
}
