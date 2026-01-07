'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineAddProps {
  placeholder: string;
  onAdd: (value: string) => void;
  onBulkAdd?: (values: string[]) => void;
  className?: string;
  buttonClassName?: string;
}

export function InlineAdd({
  placeholder,
  onAdd,
  onBulkAdd,
  className,
  buttonClassName,
}: InlineAddProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setValue('');
      return;
    }

    // Cmd/Ctrl + Enter: add and keep input open for more
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(true);
      return;
    }

    // Enter without shift: submit single item
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(false);
      return;
    }

    // Shift+Enter: allow multiline for bulk paste
  }

  function handleSubmit(keepOpen: boolean) {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Check for multiple lines (bulk add)
    const lines = trimmed
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 1 && onBulkAdd) {
      onBulkAdd(lines);
    } else if (lines.length === 1) {
      onAdd(lines[0]);
    }

    setValue('');
    if (!keepOpen) {
      setIsExpanded(false);
    } else {
      inputRef.current?.focus();
    }
  }

  function handleExpand() {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={handleExpand}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground',
          'hover:text-foreground hover:bg-muted/50 rounded-md transition-colors',
          'opacity-60 hover:opacity-100',
          buttonClassName
        )}
      >
        <Plus className="h-3 w-3" />
        <span>Add</span>
      </button>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!value.trim()) {
            setIsExpanded(false);
          }
        }}
        placeholder={placeholder}
        rows={1}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-md',
          'bg-muted/30 border border-border/50',
          'placeholder:text-muted-foreground/50',
          'focus:outline-none focus:border-primary/50',
          'resize-none inline-add-input',
          'min-h-[36px]'
        )}
        style={{
          height: value.includes('\n') ? 'auto' : '36px',
        }}
      />
      <div className="absolute right-2 bottom-1.5 text-[10px] text-muted-foreground/50">
        ↵ add • ⇧↵ newline • ⌘↵ add+continue
      </div>
    </div>
  );
}

