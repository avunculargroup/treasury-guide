'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { EntityType } from '@/types';

const ENTITY_TYPES: { value: EntityType; label: string; icon: string; description: string }[] = [
  {
    value: 'SMSF',
    label: 'Self Managed Super Fund',
    icon: '🏦',
    description: 'Trustee or member managing an SMSF investment strategy',
  },
  {
    value: 'SOLE_TRADER',
    label: 'Sole Trader',
    icon: '👤',
    description: 'Individual or tradesperson with personal business income',
  },
  {
    value: 'NFP',
    label: 'Not For Profit',
    icon: '🤝',
    description: 'CEO or finance manager of an ACNC-registered organisation',
  },
  {
    value: 'PRIVATE_COMPANY',
    label: 'Private Company',
    icon: '🏢',
    description: 'CFO or director of an unlisted Australian company',
  },
  {
    value: 'PUBLIC_COMPANY',
    label: 'Public Company',
    icon: '📊',
    description: 'CFO or company secretary of an ASX-listed entity',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [entityType, setEntityType] = useState<EntityType | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleComplete() {
    if (!entityType || !displayName.trim()) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, displayName: displayName.trim() }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Something went wrong');
        return;
      }
      router.push('/journey');
    } catch {
      setError('Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-navy-900">Welcome to Treasury Guide</h1>
          <p className="mt-2 text-navy-500">
            {step === 1
              ? 'Select your entity type to personalise your journey'
              : step === 2
                ? 'What should we call you?'
                : "You're all set — here's what to expect"}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${s <= step ? 'bg-brand-500' : 'bg-navy-200'}`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            {ENTITY_TYPES.map((entity) => (
              <Card
                key={entity.value}
                interactive
                selected={entityType === entity.value}
                onClick={() => setEntityType(entity.value)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{entity.icon}</span>
                  <div>
                    <p className="font-semibold text-navy-900">{entity.label}</p>
                    <p className="text-sm text-navy-500">{entity.description}</p>
                  </div>
                </div>
              </Card>
            ))}
            <div className="pt-4 text-center">
              <Button
                size="lg"
                disabled={!entityType}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto max-w-md space-y-6">
            <Card>
              <label className="block text-sm font-medium text-navy-700">
                Display Name
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={user?.firstName || 'Your name'}
                  className="mt-1 block w-full rounded-lg border border-navy-200 px-4 py-2 text-navy-900 placeholder:text-navy-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  autoFocus
                />
              </label>
            </Card>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                size="lg"
                disabled={!displayName.trim()}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mx-auto max-w-md space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-navy-900">Your journey ahead</h2>
              <div className="mt-4 space-y-3">
                {[
                  { num: 1, title: 'Learn', desc: 'Bitcoin treasury fundamentals & Australian regulations' },
                  { num: 2, title: 'Decide', desc: 'Assess your fit and readiness' },
                  { num: 3, title: 'Plan', desc: 'Build your implementation strategy' },
                  { num: 4, title: 'Track', desc: 'Monitor progress on your checklist' },
                ].map((phase) => (
                  <div key={phase.num} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {phase.num}
                    </div>
                    <div>
                      <p className="font-medium text-navy-800">{phase.title}</p>
                      <p className="text-sm text-navy-500">{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            {error && (
              <p className="text-center text-sm text-red-600">{error}</p>
            )}
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button size="lg" onClick={handleComplete} disabled={isSubmitting}>
                {isSubmitting ? 'Setting up...' : "Let's Go"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
