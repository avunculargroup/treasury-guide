import Link from 'next/link';
import { DisclaimerFooter } from '@/components/ui/disclaimer-footer';

interface PhaseLayoutProps {
  title: string;
  phase: number;
  entityLabel: string;
  displayName: string;
  children: React.ReactNode;
}

export function PhaseLayout({ title, phase, entityLabel, displayName, children }: PhaseLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/journey"
              className="text-sm text-navy-400 transition-colors hover:text-navy-700"
            >
              ← Dashboard
            </Link>
            <div className="h-5 w-px bg-[#E8E6E0]" />
            <div>
              <h1 className="font-display text-base font-semibold text-navy-900">
                Phase {phase}: {title}
              </h1>
              <p className="text-xs text-navy-400">
                {displayName} — {entityLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Bitcoin Treasury Guide" className="h-7 w-7 opacity-60" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>

      <DisclaimerFooter />
    </div>
  );
}
