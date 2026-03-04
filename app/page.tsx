import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DisclaimerFooter } from '@/components/ui/disclaimer-footer';
import { Button } from '@/components/ui/button';

const ENTITY_TYPES = [
  { icon: '🏦', label: 'SMSFs', desc: 'Navigate SIS Act compliance and SMSF investment strategy updates' },
  { icon: '👤', label: 'Sole Traders', desc: 'Understand ATO CGT treatment and simplified accounting' },
  { icon: '🤝', label: 'Not For Profits', desc: 'Balance investment mandates with ACNC obligations' },
  { icon: '🏢', label: 'Private Companies', desc: 'Corporate governance, board approval, and Corporations Act duties' },
  { icon: '📊', label: 'Public Companies', desc: 'ASX continuous disclosure and enhanced reporting requirements' },
];

const PHASES = [
  { num: 1, title: 'Learn', desc: 'Understand Bitcoin treasury fundamentals and Australian regulatory context' },
  { num: 2, title: 'Decide', desc: 'Assess your organisation\'s readiness with an AI-powered fit assessment' },
  { num: 3, title: 'Plan', desc: 'Build your implementation strategy and generate a personalised checklist' },
  { num: 4, title: 'Track', desc: 'Monitor progress against your implementation plan with status tracking' },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/journey');

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="border-b border-navy-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-bold text-navy-900">Treasury Guide</span>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-navy-600 hover:text-navy-800"
            >
              Sign In
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-navy-900 to-navy-800 px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Navigate Bitcoin Treasury
            <br />
            <span className="text-brand-500">for Australian Entities</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-300">
            A guided platform that helps Australian organisations evaluate, plan, and implement a
            Bitcoin treasury strategy — with entity-specific regulatory context and AI-powered
            guidance.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg">Start Your Journey</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="border-navy-600 text-navy-200 hover:bg-navy-700 hover:text-white">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Entity types */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-navy-900">
            Built for Australian Entities
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-navy-500">
            Entity-specific guidance tailored to your regulatory obligations and governance requirements.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ENTITY_TYPES.map((entity) => (
              <div
                key={entity.label}
                className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm"
              >
                <span className="text-3xl">{entity.icon}</span>
                <h3 className="mt-3 text-lg font-semibold text-navy-900">{entity.label}</h3>
                <p className="mt-1 text-sm text-navy-500">{entity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-navy-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-navy-900">
            Your Four-Phase Journey
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-navy-500">
            From education to implementation — a structured path to Bitcoin treasury adoption.
          </p>
          <div className="mt-12 space-y-6">
            {PHASES.map((phase) => (
              <div
                key={phase.num}
                className="flex items-start gap-6 rounded-xl border border-navy-100 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                  {phase.num}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navy-900">{phase.title}</h3>
                  <p className="mt-1 text-sm text-navy-500">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/sign-up">
              <Button size="lg">Get Started — Free</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-navy-900">Key Features</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {[
              {
                title: 'AI-Powered Guidance',
                desc: 'An intelligent chat assistant available throughout your journey, providing context-aware answers about Australian regulations and Bitcoin treasury management.',
              },
              {
                title: 'Entity-Specific Content',
                desc: 'Content, risk assessments, and checklists tailored to your exact entity type — SMSF, sole trader, NFP, private or public company.',
              },
              {
                title: 'Fit Assessment',
                desc: 'A structured questionnaire with AI-generated analysis to help determine whether a Bitcoin treasury is appropriate for your organisation.',
              },
              {
                title: 'Implementation Checklist',
                desc: 'A personalised, actionable checklist with progress tracking, notes, and PDF export to guide your implementation.',
              },
            ].map((feature) => (
              <div key={feature.title}>
                <h3 className="font-semibold text-navy-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-navy-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DisclaimerFooter />
    </div>
  );
}
