'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DisclaimerFooter } from '@/components/ui/disclaimer-footer';
import btsServices from '@/content/bts-services.json';

const ENTITY_TYPE_OPTIONS = [
  { value: 'SMSF', label: 'SMSF' },
  { value: 'SOLE_TRADER', label: 'Sole Trader' },
  { value: 'NFP', label: 'Not For Profit' },
  { value: 'PRIVATE_COMPANY', label: 'Private Company' },
  { value: 'PUBLIC_COMPANY', label: 'Public Company' },
];

const inputClass =
  'mt-1 w-full rounded-md border border-[#E8E6E0] bg-white px-4 py-2.5 text-sm text-[#1A1915] transition-colors focus:border-[#C9A84C] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20';

const labelClass = 'block text-sm font-medium text-[#1A1915]';

function ContactForm() {
  const searchParams = useSearchParams();
  const preSelectedService = searchParams.get('service') ?? '';

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    entityType: '',
    service: preSelectedService,
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preSelectedService) {
      setForm((f) => ({ ...f, service: preSelectedService }));
    }
  }, [preSelectedService]);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.message.length < 20) {
      setError('Please provide a message of at least 20 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Unable to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedService = btsServices.services.find((s) => s.id === form.service);

  if (success) {
    return (
      <div className="rounded-xl border border-[#E8E6E0] bg-white p-8 text-center shadow-[0_1px_3px_rgba(26,25,21,0.06)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F4EF]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D7A5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-semibold text-[#1A1915]">Enquiry received</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6B6860]">
          Thank you for reaching out. A BTS advisor will be in touch shortly.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center text-sm font-medium text-[#C9A84C] hover:text-[#9A7A2E] transition-colors"
        >
          ← Return to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Pre-selected service badge */}
      {selectedService && (
        <div className="flex items-center gap-2 rounded-lg border border-[#E8E6E0] bg-[#F4F4F1] px-4 py-2.5">
          <span className="rounded-[4px] bg-[#C9A84C] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#1A1915]">
            BTS
          </span>
          <span className="text-sm text-[#1A1915]">{selectedService.title}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Full name <span className="text-[#B04040]">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Jane Smith"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Email address <span className="text-[#B04040]">*</span>
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="jane@company.com.au"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Company name <span className="text-[#B04040]">*</span>
          </label>
          <input
            type="text"
            required
            value={form.company}
            onChange={(e) => update('company', e.target.value)}
            placeholder="Acme Pty Ltd"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Entity type</label>
          <select
            value={form.entityType}
            onChange={(e) => update('entityType', e.target.value)}
            className={inputClass}
          >
            <option value="">Select entity type</option>
            {ENTITY_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Service</label>
        <select
          value={form.service}
          onChange={(e) => update('service', e.target.value)}
          className={inputClass}
        >
          <option value="">Select a service (optional)</option>
          {btsServices.services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>
          Message <span className="text-[#B04040]">*</span>
        </label>
        <textarea
          required
          minLength={20}
          rows={5}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          placeholder="Tell us a bit about your situation and what you're hoping to get from BTS..."
          className={inputClass}
        />
        <p className="mt-1 text-xs text-[#9E9C96]">Minimum 20 characters</p>
      </div>

      {error && (
        <p className="rounded-md bg-[#F9EDED] px-4 py-2.5 text-sm text-[#B04040]">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[#C9A84C] px-6 py-3 text-sm font-medium text-[#1A1915] transition-colors hover:bg-[#9A7A2E] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Send enquiry'}
      </button>

      <p className="text-center text-xs text-[#9E9C96]">
        This is not financial advice. BTS will respond within 1–2 business days.
      </p>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      {/* Nav */}
      <nav className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold text-[#1A1915]">
            Bitcoin Treasury Guide
          </Link>
          <Link
            href="/services"
            className="text-sm font-medium text-[#6B6860] transition-colors hover:text-[#1A1915]"
          >
            Our services
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-[560px]">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C]">
              Bitcoin Treasury Solutions
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-[#1A1915]">
              Get in touch
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#6B6860]">
              Tell us about your situation and we&apos;ll connect you with the right support. All
              enquiries are handled by experienced BTS advisors.
            </p>
          </div>

          <Suspense fallback={<div className="animate-pulse rounded-xl bg-[#F4F4F1] h-96" />}>
            <ContactForm />
          </Suspense>
        </div>
      </main>

      <DisclaimerFooter />
    </div>
  );
}
