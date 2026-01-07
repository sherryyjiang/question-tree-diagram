'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, Download, Upload, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTreeStore } from '@/lib/stores/tree-store';
import { TreeNode } from './tree-node';
import type { Category, ResponseOption } from '@/lib/types/question-tree';

interface Connection {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export function HorizontalTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const {
    tree,
    addCategory,
    updateCategory,
    deleteCategory,
    updateEntryQuestion,
    addResponseOption,
    updateResponseOption,
    deleteResponseOption,
    updateBranch1Question,
    addBranch1ResponseOption,
    updateBranch1ResponseOption,
    deleteBranch1ResponseOption,
    updateExplorationGoal,
    addBehavioralDimension,
    updateBehavioralDimension,
    deleteBehavioralDimension,
    addProbeHint,
    updateProbeHint,
    deleteProbeHint,
    resetToSample,
  } = useTreeStore();

  const updateConnections = useCallback(() => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newConnections: Connection[] = [];

    const getNodePoints = (el: HTMLDivElement) => {
      const rect = el.getBoundingClientRect();
      return {
        right: {
          x: rect.right - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        },
        left: {
          x: rect.left - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        },
      };
    };

    nodeRefs.current.forEach((fromEl, fromId) => {
      const children = fromEl.dataset.children?.split(',').filter(Boolean) || [];
      children.forEach((childId) => {
        const toEl = nodeRefs.current.get(childId);
        if (toEl) {
          const fromPoints = getNodePoints(fromEl);
          const toPoints = getNodePoints(toEl);
          newConnections.push({
            from: fromPoints.right,
            to: toPoints.left,
          });
        }
      });
    });

    setConnections(newConnections);
  }, []);

  useEffect(() => {
    updateConnections();
    window.addEventListener('resize', updateConnections);
    return () => window.removeEventListener('resize', updateConnections);
  }, [updateConnections, tree]);

  useEffect(() => {
    const timer = setTimeout(updateConnections, 100);
    return () => clearTimeout(timer);
  }, [tree, updateConnections]);

  function registerNode(id: string, el: HTMLDivElement | null, childIds: string[] = []) {
    if (el) {
      el.dataset.children = childIds.join(',');
      nodeRefs.current.set(id, el);
    } else {
      nodeRefs.current.delete(id);
    }
  }

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold tracking-tight">
              Peek Question Tree
            </h1>
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
              {tree.categories.length} categories
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-muted transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-muted transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </button>
            <button
              type="button"
              onClick={resetToSample}
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-muted transition-colors text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border/30 text-[10px]">
          <span className="text-muted-foreground">Legend:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-900/60 border border-amber-600/60" />
            <span>Entry Q</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-800/80 border border-slate-600/60" />
            <span>Response</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-900/60 border border-blue-600/60" />
            <span>Branch Q</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-900/60 border border-emerald-600/60 border-dashed" />
            <span>Exploration</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-teal-900/60 border border-teal-600/60 border-dashed" />
            <span>Dimension</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-violet-900/60 border border-violet-600/60 border-dashed" />
            <span>Probe</span>
          </div>
        </div>
      </header>

      {/* Tree Canvas */}
      <div className="flex-1 overflow-auto p-6">
        <div ref={containerRef} className="relative min-w-max">
          {/* SVG Layer for connections */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            {connections.map((conn, i) => {
              const midX = (conn.from.x + conn.to.x) / 2;
              return (
                <path
                  key={i}
                  d={`M ${conn.from.x} ${conn.from.y} C ${midX} ${conn.from.y}, ${midX} ${conn.to.y}, ${conn.to.x} ${conn.to.y}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>

          {/* Tree - one section per category */}
          <div className="flex flex-col gap-16">
            {tree.categories.map((category) => (
              <CategoryTree
                key={category.id}
                category={category}
                registerNode={registerNode}
                updateCategory={updateCategory}
                deleteCategory={deleteCategory}
                updateEntryQuestion={updateEntryQuestion}
                addResponseOption={addResponseOption}
                updateResponseOption={updateResponseOption}
                deleteResponseOption={deleteResponseOption}
                updateBranch1Question={updateBranch1Question}
                addBranch1ResponseOption={addBranch1ResponseOption}
                updateBranch1ResponseOption={updateBranch1ResponseOption}
                deleteBranch1ResponseOption={deleteBranch1ResponseOption}
                updateExplorationGoal={updateExplorationGoal}
                addBehavioralDimension={addBehavioralDimension}
                updateBehavioralDimension={updateBehavioralDimension}
                deleteBehavioralDimension={deleteBehavioralDimension}
                addProbeHint={addProbeHint}
                updateProbeHint={updateProbeHint}
                deleteProbeHint={deleteProbeHint}
              />
            ))}

            {/* Add Category button */}
            <button
              type="button"
              onClick={() => addCategory('New Category')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-dashed border-border/50 rounded-md hover:border-border hover:bg-muted/30 transition-colors w-fit"
            >
              <Plus className="h-3 w-3" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 py-2 px-4">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Double-click to edit • Hover for + button • Data auto-saved</span>
          <span>Scroll horizontally →</span>
        </div>
      </footer>
    </div>
  );
}

// Category Tree - renders all branches as horizontal rows
interface CategoryTreeProps {
  category: Category;
  registerNode: (id: string, el: HTMLDivElement | null, childIds?: string[]) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  updateEntryQuestion: (categoryId: string, text: string) => void;
  addResponseOption: (categoryId: string, label: string) => void;
  updateResponseOption: (categoryId: string, optionId: string, label: string) => void;
  deleteResponseOption: (categoryId: string, optionId: string) => void;
  updateBranch1Question: (categoryId: string, optionId: string, text: string) => void;
  addBranch1ResponseOption: (categoryId: string, optionId: string, label: string) => void;
  updateBranch1ResponseOption: (categoryId: string, optionId: string, responseId: string, label: string) => void;
  deleteBranch1ResponseOption: (categoryId: string, optionId: string, responseId: string) => void;
  updateExplorationGoal: (categoryId: string, optionId: string, goal: string) => void;
  addBehavioralDimension: (categoryId: string, optionId: string, name: string) => void;
  updateBehavioralDimension: (categoryId: string, optionId: string, dimensionId: string, name: string) => void;
  deleteBehavioralDimension: (categoryId: string, optionId: string, dimensionId: string) => void;
  addProbeHint: (categoryId: string, optionId: string, dimensionId: string, hint: string) => void;
  updateProbeHint: (categoryId: string, optionId: string, dimensionId: string, hintIndex: number, hint: string) => void;
  deleteProbeHint: (categoryId: string, optionId: string, dimensionId: string, hintIndex: number) => void;
}

function CategoryTree({
  category,
  registerNode,
  updateCategory,
  deleteCategory,
  updateEntryQuestion,
  addResponseOption,
  updateResponseOption,
  deleteResponseOption,
  updateBranch1Question,
  addBranch1ResponseOption,
  updateBranch1ResponseOption,
  deleteBranch1ResponseOption,
  updateExplorationGoal,
  addBehavioralDimension,
  updateBehavioralDimension,
  deleteBehavioralDimension,
  addProbeHint,
  updateProbeHint,
  deleteProbeHint,
}: CategoryTreeProps) {
  const responseOptions = category.entryQuestion.responseOptions;
  const entryNodeId = `entry-${category.id}`;

  return (
    <div className="space-y-1">
      {/* Category label */}
      <div className="text-[10px] text-amber-400 font-medium uppercase tracking-wider mb-2">
        {category.name}
      </div>

      {/* Tree rows - one per response option path */}
      <div className="flex flex-col gap-6">
        {responseOptions.map((option, optionIndex) => (
          <ResponseBranch
            key={option.id}
            categoryId={category.id}
            category={category}
            option={option}
            optionIndex={optionIndex}
            isFirstOption={optionIndex === 0}
            registerNode={registerNode}
            updateEntryQuestion={updateEntryQuestion}
            deleteCategory={deleteCategory}
            addResponseOption={addResponseOption}
            updateResponseOption={updateResponseOption}
            deleteResponseOption={deleteResponseOption}
            updateBranch1Question={updateBranch1Question}
            addBranch1ResponseOption={addBranch1ResponseOption}
            updateBranch1ResponseOption={updateBranch1ResponseOption}
            deleteBranch1ResponseOption={deleteBranch1ResponseOption}
            updateExplorationGoal={updateExplorationGoal}
            addBehavioralDimension={addBehavioralDimension}
            updateBehavioralDimension={updateBehavioralDimension}
            deleteBehavioralDimension={deleteBehavioralDimension}
            addProbeHint={addProbeHint}
            updateProbeHint={updateProbeHint}
            deleteProbeHint={deleteProbeHint}
          />
        ))}

        {/* Add response option row */}
        {responseOptions.length === 0 && (
          <div className="flex items-center gap-4">
            <div
              ref={(el) => registerNode(entryNodeId, el, [])}
            >
              <TreeNode
                id={entryNodeId}
                label={category.entryQuestion.text}
                type="entry"
                isFixed
                onUpdate={(text) => updateEntryQuestion(category.id, text)}
                onDelete={() => deleteCategory(category.id)}
                onAdd={() => addResponseOption(category.id, 'New option')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Response Branch - one horizontal row per response option
interface ResponseBranchProps {
  categoryId: string;
  category: Category;
  option: ResponseOption;
  optionIndex: number;
  isFirstOption: boolean;
  registerNode: (id: string, el: HTMLDivElement | null, childIds?: string[]) => void;
  updateEntryQuestion: (categoryId: string, text: string) => void;
  deleteCategory: (id: string) => void;
  addResponseOption: (categoryId: string, label: string) => void;
  updateResponseOption: (categoryId: string, optionId: string, label: string) => void;
  deleteResponseOption: (categoryId: string, optionId: string) => void;
  updateBranch1Question: (categoryId: string, optionId: string, text: string) => void;
  addBranch1ResponseOption: (categoryId: string, optionId: string, label: string) => void;
  updateBranch1ResponseOption: (categoryId: string, optionId: string, responseId: string, label: string) => void;
  deleteBranch1ResponseOption: (categoryId: string, optionId: string, responseId: string) => void;
  updateExplorationGoal: (categoryId: string, optionId: string, goal: string) => void;
  addBehavioralDimension: (categoryId: string, optionId: string, name: string) => void;
  updateBehavioralDimension: (categoryId: string, optionId: string, dimensionId: string, name: string) => void;
  deleteBehavioralDimension: (categoryId: string, optionId: string, dimensionId: string) => void;
  addProbeHint: (categoryId: string, optionId: string, dimensionId: string, hint: string) => void;
  updateProbeHint: (categoryId: string, optionId: string, dimensionId: string, hintIndex: number, hint: string) => void;
  deleteProbeHint: (categoryId: string, optionId: string, dimensionId: string, hintIndex: number) => void;
}

function ResponseBranch({
  categoryId,
  category,
  option,
  optionIndex,
  isFirstOption,
  registerNode,
  updateEntryQuestion,
  deleteCategory,
  addResponseOption,
  updateResponseOption,
  deleteResponseOption,
  updateBranch1Question,
  addBranch1ResponseOption,
  updateBranch1ResponseOption,
  deleteBranch1ResponseOption,
  updateExplorationGoal,
  addBehavioralDimension,
  updateBehavioralDimension,
  deleteBehavioralDimension,
  addProbeHint,
  updateProbeHint,
  deleteProbeHint,
}: ResponseBranchProps) {
  const entryNodeId = `entry-${categoryId}`;
  const respNodeId = `resp-${option.id}`;
  const branch1 = option.branch1Question;
  const exploration = branch1?.explorationArea;
  const dimensions = exploration?.behavioralDimensions || [];

  // Calculate max rows needed for this branch (based on dimensions and their hints)
  const dimensionRows = dimensions.map((dim) => ({
    dim,
    hints: dim.probeHints,
  }));

  return (
    <div className="flex items-start gap-6">
      {/* Entry Question (only show on first row, span all rows visually) */}
      <div className="w-[160px] shrink-0">
        {isFirstOption ? (
          <div
            ref={(el) =>
              registerNode(
                entryNodeId,
                el,
                category.entryQuestion.responseOptions.map((r) => `resp-${r.id}`)
              )
            }
          >
            <TreeNode
              id={entryNodeId}
              label={category.entryQuestion.text}
              type="entry"
              isFixed
              onUpdate={(text) => updateEntryQuestion(categoryId, text)}
              onDelete={() => deleteCategory(categoryId)}
              onAdd={() => addResponseOption(categoryId, 'New option')}
            />
          </div>
        ) : (
          <div className="h-7" /> // Spacer for alignment
        )}
      </div>

      {/* Response Option */}
      <div className="w-[130px] shrink-0">
        <div
          ref={(el) =>
            registerNode(respNodeId, el, branch1 ? [`branch-${branch1.id}`] : [])
          }
        >
          <TreeNode
            id={respNodeId}
            label={option.label}
            type="response"
            onUpdate={(label) => updateResponseOption(categoryId, option.id, label)}
            onDelete={() => deleteResponseOption(categoryId, option.id)}
          />
        </div>
      </div>

      {/* Branch 1 Question */}
      <div className="w-[160px] shrink-0">
        {branch1 ? (
          <div
            ref={(el) =>
              registerNode(
                `branch-${branch1.id}`,
                el,
                exploration ? [`exp-${exploration.id}`] : []
              )
            }
          >
            <TreeNode
              id={`branch-${branch1.id}`}
              label={branch1.text}
              type="branch"
              isFixed
              onUpdate={(text) => updateBranch1Question(categoryId, option.id, text)}
              onAdd={() => addBranch1ResponseOption(categoryId, option.id, 'New response')}
            />
          </div>
        ) : (
          <div className="h-7" />
        )}
      </div>

      {/* Exploration Goal */}
      <div className="w-[180px] shrink-0">
        {exploration ? (
          <div
            ref={(el) =>
              registerNode(
                `exp-${exploration.id}`,
                el,
                dimensions.map((d) => `dim-${d.id}`)
              )
            }
          >
            <TreeNode
              id={`exp-${exploration.id}`}
              label={exploration.goal}
              type="exploration"
              isFixed={false}
              onUpdate={(goal) => updateExplorationGoal(categoryId, option.id, goal)}
              onAdd={() => addBehavioralDimension(categoryId, option.id, 'new-dimension')}
            />
          </div>
        ) : (
          <div className="h-7" />
        )}
      </div>

      {/* Dimensions and their Probe Hints */}
      <div className="flex gap-6">
        {/* Dimensions column */}
        <div className="w-[150px] shrink-0 flex flex-col gap-1">
          {dimensions.map((dim) => (
            <div
              key={dim.id}
              ref={(el) =>
                registerNode(
                  `dim-${dim.id}`,
                  el,
                  dim.probeHints.map((_, i) => `probe-${dim.id}-${i}`)
                )
              }
            >
              <TreeNode
                id={`dim-${dim.id}`}
                label={dim.name}
                type="dimension"
                isFixed={false}
                onUpdate={(name) =>
                  updateBehavioralDimension(categoryId, option.id, dim.id, name)
                }
                onDelete={() => deleteBehavioralDimension(categoryId, option.id, dim.id)}
                onAdd={() => addProbeHint(categoryId, option.id, dim.id, 'New probe hint')}
              />
            </div>
          ))}
        </div>

        {/* Probe Hints column */}
        <div className="w-[180px] shrink-0 flex flex-col gap-1">
          {dimensions.flatMap((dim) =>
            dim.probeHints.map((hint, i) => (
              <div
                key={`probe-${dim.id}-${i}`}
                ref={(el) => registerNode(`probe-${dim.id}-${i}`, el)}
              >
                <TreeNode
                  id={`probe-${dim.id}-${i}`}
                  label={hint}
                  type="probe"
                  isFixed={false}
                  onUpdate={(h) => updateProbeHint(categoryId, option.id, dim.id, i, h)}
                  onDelete={() => deleteProbeHint(categoryId, option.id, dim.id, i)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
