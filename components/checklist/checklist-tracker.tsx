'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BlockedItemPrompt } from '@/components/promotions/BlockedItemPrompt';
import type { EntityType } from '@/types';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';
import type { ChecklistItemStatus } from '@/types';

interface ChecklistItemData {
  id: string;
  category: string;
  title: string;
  description: string | null;
  responsible: string | null;
  estimatedDays: number | null;
  status: ChecklistItemStatus;
  notes: string | null;
  blockedReason: string | null;
  order: number;
}

interface ChecklistTrackerProps {
  items: ChecklistItemData[];
  artifactId: string;
  entityType: EntityType;
}

const STATUS_OPTIONS: { value: ChecklistItemStatus; label: string; color: string }[] = [
  { value: 'NOT_STARTED', label: 'Not Started', color: 'bg-navy-100 text-navy-600' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'COMPLETE', label: 'Complete', color: 'bg-green-100 text-green-700' },
  { value: 'BLOCKED', label: 'Blocked', color: 'bg-red-100 text-red-700' },
];

export function ChecklistTracker({ items: initialItems, artifactId, entityType }: ChecklistTrackerProps) {
  const [items, setItems] = useState(initialItems);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Group by category
  const categories = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItemData[]>
  );

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.status === 'COMPLETE').length;
  const overallPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  async function updateItem(
    itemId: string,
    updates: Partial<{ status: ChecklistItemStatus; notes: string; blockedReason: string }>
  ) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );

    await fetch('/api/checklist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, ...updates }),
    });
  }

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy-900">Implementation Progress</h2>
            <p className="mt-1 text-sm text-navy-500">
              {completedItems} of {totalItems} tasks complete
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-brand-500">{overallPercent}%</span>
          </div>
        </div>
        <ProgressBar value={completedItems} max={totalItems} className="mt-4" />
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/artifacts/${artifactId}`, '_blank')}
          >
            View Full Checklist / Export PDF
          </Button>
        </div>
      </Card>

      {/* Categories */}
      {Object.entries(categories).map(([category, categoryItems]) => {
        const catComplete = categoryItems.filter((i) => i.status === 'COMPLETE').length;

        return (
          <Card key={category}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-navy-900">{category}</h3>
              <span className="text-sm text-navy-500">
                {catComplete}/{categoryItems.length}
              </span>
            </div>
            <ProgressBar value={catComplete} max={categoryItems.length} className="mb-4" />

            <div className="space-y-2">
              {categoryItems.map((item) => {
                const isExpanded = expandedItem === item.id;
                const statusStyle = STATUS_OPTIONS.find((s) => s.value === item.status);

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-navy-100 bg-white"
                  >
                    <button
                      onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                          statusStyle?.color
                        )}
                      >
                        {statusStyle?.label}
                      </span>
                      <span className="flex-1 text-sm font-medium text-navy-800">
                        {item.title}
                      </span>
                      {item.responsible && (
                        <span className="shrink-0 text-xs text-navy-400">
                          {item.responsible}
                        </span>
                      )}
                      <span className="shrink-0 text-navy-300">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-navy-50 px-4 py-3">
                        {item.description && (
                          <p className="mb-3 text-sm text-navy-600">{item.description}</p>
                        )}

                        {item.estimatedDays && (
                          <p className="mb-3 text-xs text-navy-400">
                            Estimated: {item.estimatedDays} days
                          </p>
                        )}

                        {/* Status selector */}
                        <div className="mb-3">
                          <label className="mb-1 block text-xs font-medium text-navy-600">
                            Status
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => updateItem(item.id, { status: opt.value })}
                                className={cn(
                                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                  item.status === opt.value
                                    ? opt.color
                                    : 'bg-navy-50 text-navy-400 hover:bg-navy-100'
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Blocked reason */}
                        {item.status === 'BLOCKED' && (
                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-medium text-navy-600">
                              Blocked Reason
                            </label>
                            <input
                              type="text"
                              value={item.blockedReason || ''}
                              onChange={(e) =>
                                updateItem(item.id, { blockedReason: e.target.value })
                              }
                              placeholder="Why is this blocked?"
                              className="w-full rounded-lg border border-navy-200 px-3 py-1.5 text-sm"
                            />
                          </div>
                        )}

                        {/* Notes */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-navy-600">
                            Notes
                          </label>
                          <textarea
                            value={item.notes || ''}
                            onChange={(e) =>
                              updateItem(item.id, { notes: e.target.value })
                            }
                            placeholder="Add notes..."
                            rows={2}
                            className="w-full rounded-lg border border-navy-200 px-3 py-1.5 text-sm"
                          />
                        </div>

                        {/* BTS expert prompt — only shown when item is BLOCKED */}
                        {item.status === 'BLOCKED' && (
                          <BlockedItemPrompt
                            checklistItemId={item.id}
                            itemTitle={item.title}
                            itemCategory={item.category}
                            entityType={entityType}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
