'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useDrag } from '@use-gesture/react';
import { ChevronDown, ChevronRight, Plus, X, Lock, Dices, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasNodeProps {
  id: string;
  label: string;
  type: 'entry' | 'response' | 'branch' | 'exploration' | 'dimension' | 'probe';
  isFixed?: boolean;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  onUpdate: (value: string) => void;
  onDelete?: () => void;
  onAdd?: () => void;
  childIds?: string[];
}

const typeStyles = {
  entry: {
    bg: 'bg-amber-900/70',
    border: 'border-amber-500/60',
    text: 'text-amber-100',
    label: 'Entry Question',
    labelColor: 'text-amber-400',
  },
  response: {
    bg: 'bg-slate-800/80',
    border: 'border-slate-500/60',
    text: 'text-slate-100',
    label: 'Response',
    labelColor: 'text-slate-400',
  },
  branch: {
    bg: 'bg-blue-900/70',
    border: 'border-blue-500/60',
    text: 'text-blue-100',
    label: 'Branch Question',
    labelColor: 'text-blue-400',
  },
  exploration: {
    bg: 'bg-emerald-900/70',
    border: 'border-emerald-500/60 border-dashed',
    text: 'text-emerald-100',
    label: 'Exploration Goal',
    labelColor: 'text-emerald-400',
  },
  dimension: {
    bg: 'bg-teal-900/70',
    border: 'border-teal-500/60 border-dashed',
    text: 'text-teal-100',
    label: 'Dimension',
    labelColor: 'text-teal-400',
  },
  probe: {
    bg: 'bg-violet-900/70',
    border: 'border-violet-500/60 border-dashed',
    text: 'text-violet-100',
    label: 'Probe Hint',
    labelColor: 'text-violet-400',
  },
};

export function CanvasNode({
  id,
  label,
  type,
  isFixed = true,
  position,
  onPositionChange,
  onUpdate,
  onDelete,
  onAdd,
  childIds = [],
}: CanvasNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const style = typeStyles[type];

  // Drag handling
  const bind = useDrag(
    ({ offset: [x, y], first, last }) => {
      if (first) setIsDragging(true);
      if (last) setIsDragging(false);
      onPositionChange({ x, y });
    },
    {
      from: () => [position.x, position.y],
    }
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(label);
  }, [label]);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(label);
      setIsEditing(false);
    }
  }

  function handleSave() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== label) {
      onUpdate(trimmed);
    } else {
      setEditValue(label);
    }
    setIsEditing(false);
  }

  const needsTruncation = label.length > 60;

  return (
    <div
      ref={nodeRef}
      data-node-id={id}
      data-children={childIds.join(',')}
      className={cn(
        'absolute rounded-lg border-2 shadow-lg transition-shadow',
        style.bg,
        style.border,
        style.text,
        isDragging && 'shadow-xl ring-2 ring-white/20 cursor-grabbing z-50',
        !isDragging && 'cursor-grab'
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        minWidth: isExpanded ? '300px' : '180px',
        maxWidth: isExpanded ? '450px' : '200px',
      }}
    >
      {/* Header with drag handle */}
      <div
        {...bind()}
        className="flex items-center gap-1.5 px-2 py-1.5 border-b border-white/10 touch-none"
      >
        <GripVertical className="h-3.5 w-3.5 opacity-40 shrink-0" />
        
        {/* Type label */}
        <span className={cn('text-[9px] uppercase tracking-wider font-medium', style.labelColor)}>
          {style.label}
        </span>

        {/* Fixed/Flexible indicator */}
        <span className="ml-auto shrink-0">
          {isFixed ? (
            <Lock className="h-3 w-3 opacity-40" />
          ) : (
            <Dices className="h-3 w-3 opacity-40" />
          )}
        </span>

        {/* Expand/Collapse if content is long */}
        {needsTruncation && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-white/10 rounded shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        {/* Delete button */}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-0.5 hover:bg-red-500/30 rounded shrink-0 opacity-60 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full bg-transparent border-none outline-none text-sm resize-none',
              style.text
            )}
            rows={Math.max(2, editValue.split('\n').length)}
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className={cn(
              'text-sm cursor-text',
              !isExpanded && needsTruncation && 'line-clamp-2'
            )}
            title={label}
          >
            {label}
          </div>
        )}
      </div>

      {/* Add button */}
      {onAdd && (
        <div className="px-2 pb-2">
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1 px-2 py-1 text-[10px] opacity-50 hover:opacity-100 hover:bg-white/10 rounded transition-opacity w-full justify-center"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
      )}
    </div>
  );
}

