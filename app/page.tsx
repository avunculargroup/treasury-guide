import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DisclaimerFooter } from '@/components/ui/disclaimer-footer';
import { Button } from '@/components/ui/button';
import { LandingServicesStrip } from '@/components/promotions/LandingServicesStrip';

const ENTITY_TYPES = [
  { label: 'SMSFs', desc: 'Navigate SIS Act compliance and SMSF investment strategy updates' },
  { label: 'Sole Traders', desc: 'Understand ATO CGT treatment and simplified accounting' },
  { label: 'Not For Profits', desc: 'Balance investment mandates with ACNC obligations' },
  { label: 'Private Companies', desc: 'Corporate governance, board approval, and Corporations Act duties' },
  { label: 'Public Companies', desc: 'ASX continuous disclosure and enhanced reporting requirements' },
];

const PHASES = [
  { num: 1, title: 'Learn', desc: 'Understand Bitcoin treasury fundamentals and Australian regulatory context' },
  { num: 2, title: 'Decide', desc: "Assess your organisation's readiness with an AI-powered fit assessment" },
  { num: 3, title: 'Plan', desc: 'Build your implementation strategy and generate a personalised checklist' },
  { num: 4, title: 'Track', desc: 'Monitor progress against your implementation plan with status tracking' },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/journey');

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      {/* Nav */}
      <nav className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Bitcoin Treasury Guide" width={32} height={32} />
            <span className="font-display text-lg font-semibold text-navy-900 tracking-tight">
              Bitcoin Treasury Guide
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-navy-500 transition-colors hover:text-navy-900"
            >
              Sign in
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-[4px] bg-[#F0E4C0] px-3 py-1.5">
            <span className="text-xs font-medium uppercase tracking-widest text-[#9A7A2E]">
              Australian entities only
            </span>
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-navy-900 sm:text-6xl">
            Navigate Bitcoin Treasury
            <br />
            <span className="text-[#C9A84C]">with confidence</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-navy-500">
            A guided platform for Australian CFOs and finance executives to evaluate, plan, and
            implement a Bitcoin treasury strategy — with entity-specific regulatory context and
            AI-powered guidance.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link href="/sign-up">
              <Button size="lg">Begin your assessment</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="secondary" size="lg">
                See how it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="h-px bg-[#E8E6E0]" />
      </div>

      {/* Entity types */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-semibold text-navy-900">
              Built for Australian entities
            </h2>
            <p className="mt-3 text-navy-500">
              Entity-specific guidance tailored to your regulatory obligations and governance requirements.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ENTITY_TYPES.map((entity) => (
              <div
                key={entity.label}
                className="rounded-xl border border-[#E8E6E0] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-semibold text-navy-900">{entity.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{entity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[#F4F4F1] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-semibold text-navy-900">
              Your four-phase journey
            </h2>
            <p className="mt-3 text-navy-500">
              From education to implementation — a structured path to Bitcoin treasury adoption.
            </p>
          </div>
          <div className="mt-12 space-y-4">
            {PHASES.map((phase) => (
              <div
                key={phase.num}
                className="flex items-start gap-6 rounded-xl border border-[#E8E6E0] bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0E4C0] font-data text-sm font-medium text-[#9A7A2E]">
                  {phase.num}
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900">{phase.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-navy-500">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/sign-up">
              <Button size="lg">Get started</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* BTS services strip — after four-phase journey section */}
      <LandingServicesStrip />

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-center text-3xl font-semibold text-navy-900">
            What you get
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {[
              {
                title: 'AI-powered guidance',
                desc: 'An intelligent assistant available throughout your journey, providing context-aware answers about Australian regulations and Bitcoin treasury management.',
              },
              {
                title: 'Entity-specific content',
                desc: 'Content, risk assessments, and checklists tailored to your exact entity type — SMSF, sole trader, NFP, private or public company.',
              },
              {
                title: 'Fit assessment',
                desc: 'A structured questionnaire with AI-generated analysis to help determine whether a Bitcoin treasury is appropriate for your organisation.',
              },
              {
                title: 'Implementation checklist',
                desc: 'A personalised, actionable checklist with progress tracking, notes, and PDF export to guide your implementation.',
              },
            ].map((feature) => (
              <div key={feature.title}>
                <div className="mb-3 h-px w-8 bg-[#C9A84C]" />
                <h3 className="font-semibold text-navy-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DisclaimerFooter />
    </div>
  );
}
