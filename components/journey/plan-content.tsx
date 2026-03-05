'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  EntityType,
  PlanningResponses,
  CustodyPreference,
  AllocationApproach,
} from '@/types';

interface PlanContentProps {
  entityType: EntityType;
  assessmentResponses: Record<string, unknown> | null;
  isComplete: boolean;
}

const CUSTODY_OPTIONS: { value: CustodyPreference; label: string; description: string }[] = [
  { value: 'exchange', label: 'Exchange custody', description: 'Hold Bitcoin on a regulated exchange' },
  { value: 'third_party', label: 'Third-party custodian', description: 'Use an institutional custody provider' },
  { value: 'self_custody', label: 'Self-custody', description: 'Manage your own hardware wallet' },
  { value: 'multi_sig', label: 'Multi-signature', description: 'Distributed key management requiring multiple approvals' },
];

const ALLOCATION_OPTIONS: { value: AllocationApproach; label: string; description: string }[] = [
  { value: 'dca', label: 'Dollar-cost average (DCA)', description: 'Regular purchases over time to smooth out volatility' },
  { value: 'lump_sum', label: 'Lump sum', description: 'Single purchase of the target allocation' },
  { value: 'undecided', label: 'Undecided', description: 'Need more guidance before choosing' },
];

const radioOptionClass = (selected: boolean) =>
  cn(
    'flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors',
    selected
      ? 'border-[#C9A84C] bg-[#FAF5E8]'
      : 'border-[#E8E6E0] hover:bg-[#F4F4F1]'
  );

const toggleClass = (on: boolean) =>
  cn('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150', on ? 'bg-[#C9A84C]' : 'bg-[#D5D2CA]');

export function PlanContent({ entityType, assessmentResponses, isComplete }: PlanContentProps) {
  const router = useRouter();
  const accountingSoftware = (assessmentResponses?.accountingSoftware as string) || 'Xero';
  const boardRequired = (assessmentResponses?.boardApprovalRequired as boolean) ?? false;

  const [responses, setResponses] = useState<PlanningResponses>({
    custodyPreference: 'exchange',
    allocationApproach: 'dca',
    accountingSoftware,
    targetAllocationPercent: 5,
    boardApprovalRequired: boardRequired,
    hasExistingCryptoPolicy: false,
  });

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerateChecklist() {
    setIsGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/workflows/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          assessmentResponses,
          planningResponses: responses,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to generate checklist');
        return;
      }

      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 3, status: 'COMPLETE' }),
      });

      router.push(`/artifacts/${data.data.artifactId}`);
      router.refresh();
    } catch {
      setError('Failed to generate checklist. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  if (isComplete) {
    return (
      <div className="space-y-6">
        <Card>
          <h2 className="font-display text-xl font-semibold text-navy-900">Phase 3 complete</h2>
          <p className="mt-2 text-navy-600">
            Your implementation checklist has been generated. Head to the Track phase to monitor your progress.
          </p>
        </Card>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push('/journey')}>
            Back to dashboard
          </Button>
          <Button onClick={() => router.push('/journey/track')}>
            Go to Track
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="font-display text-xl font-semibold text-navy-900">Build your strategy</h2>
        <p className="mt-1 text-sm leading-relaxed text-navy-500">
          Configure your implementation preferences. When you&apos;re done, we&apos;ll generate a personalised
          implementation checklist for your entity.
        </p>
        <div className="mt-5 flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                s <= step ? 'bg-[#C9A84C]' : 'bg-[#E8E6E0]'
              )}
            />
          ))}
        </div>
      </Card>

      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-navy-900">Custody preference</h3>
            <p className="mt-1 text-sm text-navy-500">
              How do you want to secure your Bitcoin holdings?
            </p>
            <div className="mt-4 space-y-2">
              {CUSTODY_OPTIONS.map((opt) => (
                <label key={opt.value} className={radioOptionClass(responses.custodyPreference === opt.value)}>
                  <input
                    type="radio"
                    name="custody"
                    value={opt.value}
                    checked={responses.custodyPreference === opt.value}
                    onChange={() =>
                      setResponses((prev) => ({ ...prev, custodyPreference: opt.value }))
                    }
                    className="mt-0.5 accent-[#C9A84C]"
                  />
                  <div>
                    <p className="text-sm font-medium text-navy-900">{opt.label}</p>
                    <p className="text-xs text-navy-500">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>Next: Allocation</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-navy-900">Allocation approach</h3>
            <div className="mt-4 space-y-2">
              {ALLOCATION_OPTIONS.map((opt) => (
                <label key={opt.value} className={radioOptionClass(responses.allocationApproach === opt.value)}>
                  <input
                    type="radio"
                    name="allocation"
                    value={opt.value}
                    checked={responses.allocationApproach === opt.value}
                    onChange={() =>
                      setResponses((prev) => ({ ...prev, allocationApproach: opt.value }))
                    }
                    className="mt-0.5 accent-[#C9A84C]"
                  />
                  <div>
                    <p className="text-sm font-medium text-navy-900">{opt.label}</p>
                    <p className="text-xs text-navy-500">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-navy-900">Target allocation</h3>
            <p className="mt-1 text-sm text-navy-500">
              What percentage of your treasury would you consider allocating to Bitcoin?
            </p>
            <div className="mt-4">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={responses.targetAllocationPercent}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      targetAllocationPercent: Number(e.target.value),
                    }))
                  }
                  className="flex-1 accent-[#C9A84C]"
                />
                <span className="font-data w-12 text-right text-lg font-semibold text-[#9A7A2E]">
                  {responses.targetAllocationPercent}%
                </span>
              </div>
              <p className="mt-2 text-xs text-navy-400">
                Most conservative strategies suggest 1–5% of total reserves.
              </p>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Next: Review</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-navy-900">Additional details</h3>
            <div className="mt-4 space-y-5">
              <label className="flex items-center justify-between gap-4">
                <span className="text-sm text-navy-700">Board approval required?</span>
                <button
                  type="button"
                  onClick={() =>
                    setResponses((prev) => ({
                      ...prev,
                      boardApprovalRequired: !prev.boardApprovalRequired,
                    }))
                  }
                  className={toggleClass(responses.boardApprovalRequired)}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150',
                      responses.boardApprovalRequired && 'translate-x-5'
                    )}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between gap-4">
                <span className="text-sm text-navy-700">Do you have an existing crypto policy?</span>
                <button
                  type="button"
                  onClick={() =>
                    setResponses((prev) => ({
                      ...prev,
                      hasExistingCryptoPolicy: !prev.hasExistingCryptoPolicy,
                    }))
                  }
                  className={toggleClass(responses.hasExistingCryptoPolicy)}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150',
                      responses.hasExistingCryptoPolicy && 'translate-x-5'
                    )}
                  />
                </button>
              </label>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-navy-900">Summary</h3>
            <div className="mt-4 space-y-2.5 border-t border-[#E8E6E0] pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-500">Custody</span>
                <span className="font-medium text-navy-900">
                  {CUSTODY_OPTIONS.find((o) => o.value === responses.custodyPreference)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Approach</span>
                <span className="font-medium text-navy-900">
                  {ALLOCATION_OPTIONS.find((o) => o.value === responses.allocationApproach)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Target allocation</span>
                <span className="font-data font-medium text-navy-900">{responses.targetAllocationPercent}%</span>
              </div>
            </div>
          </Card>

          {error && <p className="text-center text-sm text-[#B04040]">{error}</p>}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <Button size="lg" onClick={handleGenerateChecklist} disabled={isGenerating}>
              {isGenerating ? 'Generating checklist...' : 'Generate implementation checklist'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
