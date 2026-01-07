'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Folder,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditableText } from './editable-text';
import { InlineAdd } from './inline-add';

interface DimensionAccordionProps {
  id: string;
  name: string;
  probeHints: string[];
  onUpdateName: (name: string) => void;
  onDelete: () => void;
  onAddHint: (hint: string) => void;
  onUpdateHint: (index: number, hint: string) => void;
  onDeleteHint: (index: number) => void;
  variant?: 'behavioral' | 'evaluation';
}

export function DimensionAccordion({
  id,
  name,
  probeHints,
  onUpdateName,
  onDelete,
  onAddHint,
  onUpdateHint,
  onDeleteHint,
  variant = 'behavioral',
}: DimensionAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-border/30 rounded-lg overflow-hidden bg-card/30">
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 cursor-pointer',
          'hover:bg-muted/20 transition-colors group'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
          <EditableText
            value={name}
            onSave={onUpdateName}
            className="font-mono text-sm"
            placeholder="dimension-name"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {probeHints.length} hints
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </button>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/20">
          <div className="pl-6 space-y-1.5">
            <div className="text-xs text-muted-foreground mb-2">
              Probe Hints (pool):
            </div>
            {probeHints.map((hint, index) => (
              <div
                key={`${id}-hint-${index}`}
                className="flex items-start gap-2 group/hint"
              >
                <span className="text-muted-foreground mt-0.5">•</span>
                <div className="flex-1 min-w-0">
                  <EditableText
                    value={hint}
                    onSave={(val) => onUpdateHint(index, val)}
                    className="font-mono text-xs"
                    placeholder="Enter probe hint..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteHint(index)}
                  className="opacity-0 group-hover/hint:opacity-100 p-0.5 hover:bg-destructive/20 rounded transition-all"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            ))}
            <InlineAdd
              placeholder="Add probe hint..."
              onAdd={onAddHint}
              onBulkAdd={(hints) => hints.forEach(onAddHint)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

