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
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-navy-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/journey"
              className="text-navy-400 transition-colors hover:text-navy-700"
            >
              ← Dashboard
            </Link>
            <div className="h-6 w-px bg-navy-200" />
            <div>
              <h1 className="text-lg font-bold text-navy-900">
                Phase {phase}: {title}
              </h1>
              <p className="text-sm text-navy-500">{displayName} — {entityLabel}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>

      <DisclaimerFooter />
    </div>
  );
}
