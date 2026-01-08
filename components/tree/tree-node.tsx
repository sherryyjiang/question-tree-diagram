'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Plus, X, Lock, Dices } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TreeNodeProps {
  id: string;
  label: string;
  type: 'entry' | 'response' | 'branch' | 'branch2' | 'exploration' | 'dimension' | 'probe';
  isFixed?: boolean;
  onUpdate: (value: string) => void;
  onDelete?: () => void;
  onAdd?: () => void;
  className?: string;
}

const typeStyles = {
  entry: 'bg-amber-900/60 border-amber-600/60 text-amber-100',
  response: 'bg-slate-800/80 border-slate-600/60 text-slate-100',
  branch: 'bg-blue-900/60 border-blue-600/60 text-blue-100',
  branch2: 'bg-indigo-900/60 border-indigo-600/60 text-indigo-100',
  exploration: 'bg-emerald-900/60 border-emerald-600/60 text-emerald-100 border-dashed',
  dimension: 'bg-teal-900/60 border-teal-600/60 text-teal-100 border-dashed',
  probe: 'bg-violet-900/60 border-violet-600/60 text-violet-100 border-dashed',
};

const typeLabels = {
  entry: 'EQ',
  response: '',
  branch: 'B1',
  branch2: 'B2',
  exploration: '~',
  dimension: '',
  probe: '',
};

export function TreeNode({
  id,
  label,
  type,
  isFixed = true,
  onUpdate,
  onDelete,
  onAdd,
  className,
}: TreeNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (e.key === 'Enter') {
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

  return (
    <div
      className={cn(
        'relative group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs',
        'min-w-[60px] max-w-[180px] transition-all',
        typeStyles[type],
        className
      )}
    >
      {/* Type indicator */}
      {typeLabels[type] && (
        <span className="text-[10px] opacity-60 font-mono shrink-0">
          {typeLabels[type]}
        </span>
      )}

      {/* Fixed/Flexible indicator */}
      {type !== 'response' && (
        <span className="shrink-0">
          {isFixed ? (
            <Lock className="h-2.5 w-2.5 opacity-50" />
          ) : (
            <Dices className="h-2.5 w-2.5 opacity-50" />
          )}
        </span>
      )}

      {/* Label */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs"
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          className="flex-1 min-w-0 truncate cursor-pointer"
          title={label}
        >
          {label}
        </span>
      )}

      {/* Delete button */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/30 rounded transition-opacity shrink-0"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Add button (appears on the right edge) */}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 bg-card border border-border rounded-full hover:bg-muted transition-opacity"
        >
          <Plus className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

