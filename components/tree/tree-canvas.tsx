'use client';

import { RotateCcw, Plus, Download, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTreeStore } from '@/lib/stores/tree-store';
import { CategoryBlock } from './category-block';
import { InlineAdd } from './inline-add';

export function TreeCanvas() {
  const { tree, addCategory, resetToSample } = useTreeStore();

  function handleExport() {
    const dataStr = JSON.stringify(tree, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question-tree-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        // Basic validation
        if (data.categories && Array.isArray(data.categories)) {
          useTreeStore.setState({ tree: data });
        }
      } catch (err) {
        console.error('Failed to import:', err);
      }
    };
    input.click();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight">
              Peek Question Tree
            </h1>
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
              {tree.categories.length} categories
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md',
                'hover:bg-muted transition-colors'
              )}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              type="button"
              onClick={handleImport}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md',
                'hover:bg-muted transition-colors'
              )}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              type="button"
              onClick={resetToSample}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md',
                'hover:bg-muted transition-colors text-muted-foreground'
              )}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="container max-w-screen-2xl px-4 py-3 border-b border-border/30">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-muted-foreground font-medium">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-800/40 border border-blue-700/50" />
            <span>🔒 Fixed (deterministic)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-800/40 border border-emerald-700/50 border-dashed" />
            <span>🎲 Flexible (AI picks from pool)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-800/40 border border-amber-700/50" />
            <span>📁 Category</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <main className="container max-w-screen-xl px-4 py-8">
        <div className="space-y-8">
          {tree.categories.map((category) => (
            <CategoryBlock key={category.id} category={category} />
          ))}

          {/* Add Category */}
          <div className="flex justify-center pt-4">
            <div
              className={cn(
                'w-full max-w-md p-4 rounded-xl border-2 border-dashed',
                'border-border/40 hover:border-border/60 transition-colors'
              )}
            >
              <div className="flex items-center gap-2 mb-3 justify-center">
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Add New Category
                </span>
              </div>
              <InlineAdd
                placeholder="Category name (e.g., Subscription Fatigue, Emotional Spending)..."
                onAdd={addCategory}
                onBulkAdd={(names) => names.forEach(addCategory)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-4">
        <div className="container max-w-screen-2xl px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Double-click to edit text</span>
              <span>•</span>
              <span>↵ to add</span>
              <span>•</span>
              <span>⇧↵ for multi-line</span>
              <span>•</span>
              <span>⌘↵ add and continue</span>
            </div>
            <span>Data saved to localStorage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

