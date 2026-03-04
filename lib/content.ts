import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { EntityType, ChecklistOutput, EntityGuidance } from '@/types';

const ENTITY_SLUG_MAP: Record<EntityType, string> = {
  SMSF: 'smsf',
  SOLE_TRADER: 'sole-trader',
  NFP: 'nfp',
  PRIVATE_COMPANY: 'private-company',
  PUBLIC_COMPANY: 'public-company',
};

function readContentFile(path: string): string {
  const fullPath = join(process.cwd(), 'content', path);
  if (!existsSync(fullPath)) return '';
  return readFileSync(fullPath, 'utf-8');
}

function readJsonFile<T>(path: string): T | null {
  const fullPath = join(process.cwd(), 'content', path);
  if (!existsSync(fullPath)) return null;
  try {
    return JSON.parse(readFileSync(fullPath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

export function getSharedContent(slug: string): string {
  return readContentFile(`shared/${slug}.mdx`);
}

export function getEntityContent(entityType: EntityType, file: string): string {
  const slug = ENTITY_SLUG_MAP[entityType];
  return readContentFile(`entities/${slug}/${file}`);
}

export function getEntityGuidance(entityType: EntityType): EntityGuidance | null {
  const slug = ENTITY_SLUG_MAP[entityType];
  return readJsonFile<EntityGuidance>(`entities/${slug}/guidance.json`);
}

export function getChecklistTemplate(entityType: EntityType): ChecklistOutput | null {
  const slug = ENTITY_SLUG_MAP[entityType];
  return readJsonFile<ChecklistOutput>(`entities/${slug}/checklist-template.json`);
}

export interface LearnModule {
  id: string;
  title: string;
  content: string;
  isEntitySpecific: boolean;
}

export function getLearnModules(entityType: EntityType): LearnModule[] {
  const modules: LearnModule[] = [
    {
      id: 'what-is-bitcoin-treasury',
      title: 'What Is a Bitcoin Treasury?',
      content: getSharedContent('what-is-bitcoin-treasury'),
      isEntitySpecific: false,
    },
    {
      id: 'why-companies-hold-bitcoin',
      title: 'Why Organisations Hold Bitcoin',
      content: getSharedContent('why-companies-hold-bitcoin'),
      isEntitySpecific: false,
    },
    {
      id: 'entity-specific',
      title: `Bitcoin Treasury for Your Entity`,
      content: getEntityContent(entityType, 'learn.mdx'),
      isEntitySpecific: true,
    },
    {
      id: 'regulatory-context',
      title: 'Australian Regulatory Context',
      content: getEntityContent(entityType, 'regulatory-context.mdx'),
      isEntitySpecific: true,
    },
    {
      id: 'custody-models',
      title: 'Custody Models',
      content: getSharedContent('custody-models'),
      isEntitySpecific: false,
    },
    {
      id: 'risks-overview',
      title: 'Understanding the Risks',
      content: getSharedContent('risks-overview'),
      isEntitySpecific: false,
    },
  ];

  return modules;
}
