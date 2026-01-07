'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function EditableText({
  value,
  onSave,
  className,
  inputClassName,
  placeholder = 'Click to edit...',
  multiline = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  }

  function handleSave() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  }

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    return (
      <InputComponent
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full px-2 py-1 text-sm rounded border border-primary/50',
          'bg-background focus:outline-none focus:ring-1 focus:ring-primary/30',
          multiline && 'min-h-[60px] resize-y',
          inputClassName
        )}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => setIsEditing(true)}
      className={cn(
        'cursor-pointer hover:bg-muted/30 px-1 -mx-1 rounded transition-colors',
        !value && 'text-muted-foreground italic',
        className
      )}
      title="Double-click to edit"
    >
      {value || placeholder}
    </span>
  );
}

