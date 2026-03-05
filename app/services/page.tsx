import Link from 'next/link';
import { DisclaimerFooter } from '@/components/ui/disclaimer-footer';
import btsServices from '@/content/bts-services.json';

export default function ServicesPage() {
  const { company, services, expertNetwork } = btsServices;

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      {/* Nav */}
      <nav className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold text-[#1A1915]">
            Bitcoin Treasury Guide
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-[#C9A84C] px-4 py-1.5 text-sm font-medium text-[#1A1915] transition-colors hover:bg-[#9A7A2E]"
          >
            Get in touch
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C]">
              {company.name}
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-[#1A1915]">
              Advisory services
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#6B6860]">
              {company.tagline}. Our services are designed for Australian entities at every stage of
              the bitcoin treasury adoption journey.
            </p>
          </div>
        </section>

        {/* Services grid */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 sm:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col rounded-xl border border-[#E8E6E0] bg-white p-6 shadow-[0_1px_3px_rgba(26,25,21,0.06),0_1px_2px_rgba(26,25,21,0.04)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-display text-lg font-semibold text-[#1A1915]">
                      {service.title}
                    </h2>
                    <span className="shrink-0 rounded-[4px] bg-[#F0E4C0] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#9A7A2E]">
                      BTS
                    </span>
                  </div>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#6B6860]">
                    {service.longDesc}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9E9C96"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-xs text-[#9E9C96]">{service.format}</span>
                  </div>

                  <div className="mt-5 border-t border-[#E8E6E0] pt-5">
                    <Link
                      href={`/contact?service=${service.id}`}
                      className="inline-flex items-center justify-center rounded-lg bg-[#C9A84C] px-5 py-2 text-sm font-medium text-[#1A1915] transition-colors hover:bg-[#9A7A2E]"
                    >
                      {service.ctaLabel}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Expert network */}
        <section className="bg-[#F4F4F1] px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-semibold text-[#1A1915]">
                The BTS Expert Network
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6B6860]">
                Access BTS&apos;s curated network of Australian professionals with hands-on bitcoin
                experience.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {expertNetwork.map((expert) => (
                <Link
                  key={expert.role}
                  href={expert.ctaUrl}
                  className="group flex items-start gap-4 rounded-xl border border-[#E8E6E0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(26,25,21,0.08)]"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: expert.iconBg }}
                  >
                    <span className="text-lg" aria-hidden="true">
                      {getExpertEmoji(expert.icon)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1915] group-hover:text-[#9A7A2E] transition-colors">
                      {expert.role}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6B6860]">{expert.description}</p>
                    {expert.entityTypes && (
                      <span className="mt-2 inline-block rounded-[4px] bg-[#F0E4C0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#9A7A2E]">
                        {expert.entityTypes.join(', ')}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <p className="mt-6 text-xs text-[#9E9C96]">
              🇦🇺 All specialists are Australia-based and Bitcoin-experienced
            </p>
          </div>
        </section>

        {/* Footer CTA strip */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-semibold text-[#1A1915]">
              Ready to get started?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6B6860]">
              Book a free 20-minute discovery call with a BTS advisor to discuss your situation.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#C9A84C] px-6 py-3 text-sm font-medium text-[#1A1915] transition-colors hover:bg-[#9A7A2E]"
            >
              Book a free discovery call
            </Link>
          </div>
        </section>
      </main>

      <DisclaimerFooter />
    </div>
  );
}

function getExpertEmoji(icon: string): string {
  const map: Record<string, string> = {
    Scale: '⚖️',
    BarChart2: '📊',
    Shield: '🛡️',
    FileText: '📄',
    Landmark: '🏛️',
  };
  return map[icon] ?? '👤';
}
