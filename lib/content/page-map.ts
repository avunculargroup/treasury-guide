export interface PageInfo {
  pageTitle: string;
  description: string;
  suggestedQuestions: string[];
}

export const PAGE_MAP: Record<string, PageInfo> = {
  '/journey': {
    pageTitle: 'Journey Overview',
    description: 'The starting point of the Bitcoin treasury journey, showing all four phases.',
    suggestedQuestions: [
      'Where should I start?',
      'What does the full journey look like?',
      'How long does this process take?',
    ],
  },
  '/journey/learn': {
    pageTitle: 'Learn — Bitcoin Treasury Fundamentals',
    description:
      'Educational phase covering Bitcoin treasury concepts, Australian regulatory context (ATO, ASIC, APRA), tax treatment, custody models, and key risks.',
    suggestedQuestions: [
      'What is CGT treatment for Bitcoin in Australia?',
      'What custody model suits a private company?',
      'Do I need an AFSL to hold Bitcoin?',
    ],
  },
  '/journey/decide': {
    pageTitle: 'Decide — Fit Assessment',
    description:
      'Assessment phase where the user evaluates their organisation\'s fit for a Bitcoin treasury, including risk appetite, cash reserves, stakeholder considerations, and an AI-generated fit score.',
    suggestedQuestions: [
      'How do I assess my organisation\'s risk appetite?',
      'What should a board resolution for Bitcoin cover?',
      'What are the main red flags that make Bitcoin treasury unsuitable?',
    ],
  },
  '/journey/plan': {
    pageTitle: 'Plan — Strategy Development',
    description:
      'Strategy phase covering allocation sizing (DCA vs lump sum), custody selection, legal structure considerations, accounting policy elections, and purchase approval workflows.',
    suggestedQuestions: [
      'What\'s a sensible first allocation size?',
      'How do I select a custodian?',
      'What accounting policy should I elect for Bitcoin?',
    ],
  },
  '/journey/track': {
    pageTitle: 'Track — Implementation Checklist',
    description:
      'Tracking phase where the user monitors progress against their implementation checklist, manages blocked items, and tracks category-level completion.',
    suggestedQuestions: [
      'How do I track implementation progress?',
      'What should I do if a checklist item is blocked?',
      'What professionals should be involved at this stage?',
    ],
  },
};

export function getPageInfo(pathname: string): PageInfo {
  // Exact match first, then strip trailing segments progressively
  const normalised = pathname.replace(/\/$/, '');
  if (PAGE_MAP[normalised]) return PAGE_MAP[normalised];

  // Walk up the path tree
  const parts = normalised.split('/');
  for (let i = parts.length - 1; i > 0; i--) {
    const candidate = parts.slice(0, i).join('/');
    if (PAGE_MAP[candidate]) return PAGE_MAP[candidate];
  }

  return {
    pageTitle: 'Bitcoin Treasury Guide',
    description: 'A guided platform for Australian companies evaluating a Bitcoin treasury strategy.',
    suggestedQuestions: [],
  };
}
