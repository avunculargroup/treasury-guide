'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
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
          <div className="mb-4 rounded-lg bg-navy-50 px-4 py-2 text-xs text-navy-500">
            This assessment provides general information only and does not constitute financial advice.
          </div>

          <h2 className="text-xl font-bold text-navy-900">Your Fit Assessment</h2>

          <div className="mt-4">
            <span
              className={cn(
                'inline-block rounded-full px-4 py-1.5 text-sm font-semibold',
                result.fitScore === 'RECOMMENDED'
                  ? 'bg-green-100 text-green-700'
                  : result.fitScore === 'EXPLORE_FURTHER'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              )}
            >
              {result.fitScore === 'RECOMMENDED'
                ? 'Recommended'
                : result.fitScore === 'EXPLORE_FURTHER'
                  ? 'Explore Further'
                  : 'Not Recommended'}
            </span>
          </div>

          <p className="mt-4 text-navy-700 leading-relaxed">{result.fitSummary}</p>

          {result.riskFlags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-navy-800">Key Risk Flags</h3>
              <ul className="mt-2 space-y-2">
                {result.riskFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-600">
                    <span className="mt-0.5 text-brand-500">⚠</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setResult(null)}>
            Retake Assessment
          </Button>
          {!isComplete && (
            <Button size="lg" onClick={handleCompletePhase}>
              Continue to Phase 3
            </Button>
          )}
          {isComplete && (
            <Button variant="outline" onClick={() => router.push('/journey')}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-navy-900">Company Fit Assessment</h2>
        <p className="mt-1 text-sm text-navy-500">
          Answer these questions to receive a personalised assessment of whether a Bitcoin treasury
          strategy is appropriate for your entity.
        </p>
      </Card>

      {/* Risk Appetite */}
      <Card>
        <label className="block text-sm font-medium text-navy-800">Risk Appetite</label>
        <div className="mt-2 space-y-2">
          {RISK_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                responses.riskAppetite === opt.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-navy-100 hover:bg-navy-50'
              )}
            >
              <input
                type="radio"
                name="riskAppetite"
                value={opt.value}
                checked={responses.riskAppetite === opt.value}
                onChange={() => updateField('riskAppetite', opt.value)}
                className="accent-brand-500"
              />
              <span className="text-sm text-navy-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Cash Reserve Band */}
      <Card>
        <label className="block text-sm font-medium text-navy-800">Available Cash Reserves</label>
        <select
          value={responses.cashReserveBand}
          onChange={(e) => updateField('cashReserveBand', e.target.value as CashReserveBand)}
          className="mt-2 w-full rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-900"
        >
          {CASH_RESERVE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </Card>

      {/* Investment Horizon */}
      <Card>
        <label className="block text-sm font-medium text-navy-800">Investment Horizon</label>
        <div className="mt-2 space-y-2">
          {HORIZON_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                responses.investmentHorizon === opt.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-navy-100 hover:bg-navy-50'
              )}
            >
              <input
                type="radio"
                name="investmentHorizon"
                value={opt.value}
                checked={responses.investmentHorizon === opt.value}
                onChange={() => updateField('investmentHorizon', opt.value)}
                className="accent-brand-500"
              />
              <span className="text-sm text-navy-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Prior Crypto Exposure */}
      <Card>
        <label className="block text-sm font-medium text-navy-800">Prior Crypto Exposure</label>
        <div className="mt-2 space-y-2">
          {CRYPTO_EXPOSURE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                responses.priorCryptoExposure === opt.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-navy-100 hover:bg-navy-50'
              )}
            >
              <input
                type="radio"
                name="priorCryptoExposure"
                value={opt.value}
                checked={responses.priorCryptoExposure === opt.value}
                onChange={() => updateField('priorCryptoExposure', opt.value)}
                className="accent-brand-500"
              />
              <span className="text-sm text-navy-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Accounting Software */}
      <Card>
        <label className="block text-sm font-medium text-navy-800">Accounting Software</label>
        <select
          value={responses.accountingSoftware}
          onChange={(e) => updateField('accountingSoftware', e.target.value)}
          className="mt-2 w-full rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-900"
        >
          {SOFTWARE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </Card>

      {/* Boolean toggles */}
      <Card>
        <div className="space-y-4">
          {[
            { key: 'hasTreasuryPolicy' as const, label: 'Do you have an existing treasury policy?' },
            { key: 'stakeholderConcerns' as const, label: 'Are there shareholders, beneficiaries, or members to consider?' },
            { key: 'boardApprovalRequired' as const, label: 'Is board approval required for investment decisions?' },
            { key: 'listedEntity' as const, label: 'Is this a listed entity (ASX or other exchange)?' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-sm text-navy-700">{label}</span>
              <button
                type="button"
                onClick={() => updateField(key, !responses[key])}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  responses[key] ? 'bg-brand-500' : 'bg-navy-200'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    responses[key] && 'translate-x-5'
                  )}
                />
              </button>
            </label>
          ))}
        </div>
      </Card>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      <div className="text-center">
        <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Generating Assessment...' : 'Generate Fit Assessment'}
        </Button>
      </div>
    </div>
  );
}
