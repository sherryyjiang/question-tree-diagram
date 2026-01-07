'use client';

import { useState } from 'react';
import {
  Lock,
  ChevronDown,
  ChevronRight,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types/question-tree';
import { EditableText } from './editable-text';
import { InlineAdd } from './inline-add';
import { QuestionBlock } from './question-block';
import { useTreeStore } from '@/lib/stores/tree-store';

interface CategoryBlockProps {
  category: Category;
}

export function CategoryBlock({ category }: CategoryBlockProps) {
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(
    new Set([category.entryQuestion.responseOptions[0]?.id].filter(Boolean))
  );

  const {
    updateCategory,
    deleteCategory,
    updateEntryQuestion,
    addResponseOption,
    updateResponseOption,
    deleteResponseOption,
  } = useTreeStore();

  function toggleOption(optionId: string) {
    setExpandedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div
        className={cn(
          'rounded-xl border-2 p-4 tree-node',
          'bg-gradient-to-br from-amber-950/30 to-orange-950/20',
          'border-amber-700/40'
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Category
          </span>
          <button
            type="button"
            onClick={() => deleteCategory(category.id)}
            className="ml-auto p-1.5 hover:bg-destructive/20 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
        <EditableText
          value={category.name}
          onSave={(name) => updateCategory(category.id, name)}
          className="text-lg font-semibold"
          placeholder="Category Name"
        />
      </div>

      {/* Arrow connector */}
      <div className="flex justify-center">
        <div className="w-0.5 h-6 bg-border/50 relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border/50" />
        </div>
      </div>

      {/* Entry Question */}
      <div
        className={cn(
          'rounded-xl border p-4 tree-node',
          'bg-gradient-to-br from-slate-900/50 to-slate-800/30',
          'border-slate-600/40'
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Entry Question
          </span>
          <span className="text-xs text-muted-foreground">(Fixed)</span>
        </div>

        {/* Question Text */}
        <div className="p-3 bg-card/50 rounded-lg border border-border/30 mb-4">
          <EditableText
            value={category.entryQuestion.text}
            onSave={(text) => updateEntryQuestion(category.id, text)}
            className="text-sm"
            placeholder="What question do you want to ask?"
          />
        </div>

        {/* Response Options */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Response Options:
          </div>
          <div className="flex flex-wrap gap-2">
            {category.entryQuestion.responseOptions.map((option) => (
              <div
                key={option.id}
                className={cn(
                  'group flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer',
                  'border text-sm transition-all',
                  expandedOptions.has(option.id)
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-card/60 border-border/50 hover:border-border'
                )}
                onClick={() => toggleOption(option.id)}
              >
                <span className="text-muted-foreground">
                  {expandedOptions.has(option.id) ? '●' : '○'}
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <EditableText
                    value={option.label}
                    onSave={(label) =>
                      updateResponseOption(category.id, option.id, label)
                    }
                    className="text-sm"
                    placeholder="Option..."
                  />
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteResponseOption(category.id, option.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 hover:bg-destructive/20 rounded transition-all"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
          <InlineAdd
            placeholder="Add response option..."
            onAdd={(label) => addResponseOption(category.id, label)}
            onBulkAdd={(labels) =>
              labels.forEach((label) => addResponseOption(category.id, label))
            }
          />
        </div>
      </div>

      {/* Expanded Response Option Branches */}
      {category.entryQuestion.responseOptions
        .filter((option) => expandedOptions.has(option.id))
        .map((option) => (
          <div key={option.id} className="pl-8 space-y-4">
            {/* Connector line */}
            <div className="flex items-center gap-2 -ml-8">
              <div className="w-8 h-0.5 bg-border/50" />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded text-xs text-muted-foreground">
                <ChevronRight className="h-3 w-3" />
                <span>If selected: {option.label}</span>
              </div>
            </div>

            {option.branch1Question && (
              <QuestionBlock
                categoryId={category.id}
                optionId={option.id}
                optionLabel={option.label}
                branchQuestion={option.branch1Question}
              />
            )}
          </div>
        ))}
    </div>
  );
}

