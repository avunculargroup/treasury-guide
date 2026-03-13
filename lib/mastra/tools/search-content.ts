import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface ContentEntry {
  source: string;
  text: string;
}

// Built once per process lifetime.
let index: ContentEntry[] | null = null;

async function collectStrings(value: unknown, prefix: string): Promise<ContentEntry[]> {
  const entries: ContentEntry[] = [];
  if (typeof value === 'string' && value.trim()) {
    entries.push({ source: prefix, text: value.trim() });
  } else if (Array.isArray(value)) {
    for (const item of value) {
      entries.push(...await collectStrings(item, prefix));
    }
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      entries.push(...await collectStrings(v, `${prefix} > ${k}`));
    }
  }
  return entries;
}

async function buildIndex(): Promise<ContentEntry[]> {
  if (index) return index;

  const entries: ContentEntry[] = [];
  const contentRoot = join(process.cwd(), 'content');

  async function walk(dir: string) {
    const items = await readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        await walk(fullPath);
      } else if (item.isFile() && item.name.endsWith('.json')) {
        try {
          const raw = await readFile(fullPath, 'utf-8');
          const parsed: unknown = JSON.parse(raw);
          const relPath = fullPath.replace(contentRoot + '/', '');
          entries.push(...await collectStrings(parsed, relPath));
        } catch {
          // skip malformed files
        }
      }
    }
  }

  await walk(contentRoot);
  index = entries;
  return entries;
}

export const searchContentTool = createTool({
  id: 'search-guide-content',
  description:
    'Searches the platform\'s guide content (entity guidance, checklists, regulatory references) for information matching the query. Use this to find specific regulatory details, considerations, or checklist items rather than relying solely on your training data.',
  inputSchema: z.object({
    query: z.string().describe('Keywords or phrase to search for'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        source: z.string(),
        excerpt: z.string(),
      })
    ),
  }),
  execute: async ({ query }) => {
    const entries = await buildIndex();
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = entries
      .map((entry) => {
        const haystack = entry.text.toLowerCase();
        const matches = terms.filter((t) => haystack.includes(t)).length;
        return { entry, matches };
      })
      .filter(({ matches }) => matches > 0)
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 5);

    return {
      results: scored.map(({ entry }) => ({
        source: entry.source,
        excerpt: entry.text.length > 300 ? entry.text.slice(0, 300) + '…' : entry.text,
      })),
    };
  },
});
