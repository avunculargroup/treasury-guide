import Link from 'next/link';
import { DisclaimerFooter } from '@/components/ui/disclaimer-footer';
import { Logo } from '@/components/ui/logo';

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
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/journey"
              className="shrink-0 text-sm text-navy-400 transition-colors hover:text-navy-700"
            >
              ← Dashboard
            </Link>
            <div className="h-5 w-px shrink-0 bg-[#E8E6E0]" />
            <div className="min-w-0">
              <h1 className="font-display truncate text-base font-semibold text-navy-900">
                Phase {phase}: {title}
              </h1>
              <p className="hidden text-xs text-navy-400 sm:block">
                {displayName} — {entityLabel}
              </p>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Logo size="sm" />
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
