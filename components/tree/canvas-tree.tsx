'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';
import { Plus, Download, Upload, RotateCcw, ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTreeStore } from '@/lib/stores/tree-store';
import { CanvasNode } from './canvas-node';
import type { Category, ResponseOption, BehavioralDimension, QuestionTree } from '@/lib/types/question-tree';

interface NodePosition {
  x: number;
  y: number;
}

interface Connection {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

// Layout constants
const NODE_WIDTH = 280;
const NODE_HEIGHT = 90;
const H_GAP = 40;
const V_GAP = 25;
const INITIAL_X = 40;
const INITIAL_Y = 60;

// History for undo/redo
interface HistoryState {
  tree: QuestionTree;
  positions: Map<string, NodePosition>;
}

const MAX_HISTORY = 50;

export function CanvasTree() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const [connections, setConnections] = useState<Connection[]>([]);
  
  // Undo/redo history
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false);

  const {
    tree,
    addCategory,
    updateCategory,
    deleteCategory,
    updateEntryQuestion,
    addResponseOption,
    updateResponseOption,
    deleteResponseOption,
    addBranch1Question,
    updateBranch1Question,
    deleteBranch1Question,
    addExplorationArea,
    deleteExplorationArea,
    updateExplorationGoal,
    addBehavioralDimension,
    updateBehavioralDimension,
    deleteBehavioralDimension,
    addProbeHint,
    updateProbeHint,
    deleteProbeHint,
    resetToSample,
  } = useTreeStore();

  // Canvas panning via drag
  const bindCanvas = useDrag(
    ({ offset: [x, y], event }) => {
      // Only pan if clicking on canvas background, not nodes
      if ((event?.target as HTMLElement)?.closest('[data-node-id]')) return;
      setCanvasOffset({ x, y });
    },
    {
      from: () => [canvasOffset.x, canvasOffset.y],
    }
  );

  // Scroll wheel for panning
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    // Shift+scroll for horizontal, normal scroll for vertical
    if (e.shiftKey) {
      setCanvasOffset((prev) => ({
        x: prev.x - e.deltaY,
        y: prev.y,
      }));
    } else {
      setCanvasOffset((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  // Save to history when tree changes
  useEffect(() => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }
    
    // Add to history
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({
        tree: JSON.parse(JSON.stringify(tree)),
        positions: new Map(nodePositions),
      });
      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [tree]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    
    isUndoRedo.current = true;
    const prevState = history[historyIndex - 1];
    if (prevState) {
      useTreeStore.setState({ tree: prevState.tree });
      setNodePositions(new Map(prevState.positions));
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    
    isUndoRedo.current = true;
    const nextState = history[historyIndex + 1];
    if (nextState) {
      useTreeStore.setState({ tree: nextState.tree });
      setNodePositions(new Map(nextState.positions));
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Calculate initial node positions based on tree structure
  const calculatePositions = useCallback(() => {
    const positions = new Map<string, NodePosition>();
    let globalY = INITIAL_Y;

    tree.categories.forEach((category) => {
      // Entry question position
      const entryId = `entry-${category.id}`;
      const entryY = globalY;
      positions.set(entryId, { x: INITIAL_X, y: entryY });

      let categoryMaxY = entryY;

      // Response options and their branches
      let responseY = entryY;
      category.entryQuestion.responseOptions.forEach((option) => {
        // Response option
        const respId = `resp-${option.id}`;
        if (!nodePositions.has(respId)) {
          positions.set(respId, { x: INITIAL_X + NODE_WIDTH + H_GAP, y: responseY });
        } else {
          positions.set(respId, nodePositions.get(respId)!);
        }

        let branchMaxY = responseY;

        // Branch 1
        if (option.branch1Question) {
          const branchId = `branch-${option.branch1Question.id}`;
          if (!nodePositions.has(branchId)) {
            positions.set(branchId, { x: INITIAL_X + 2 * (NODE_WIDTH + H_GAP), y: responseY });
          } else {
            positions.set(branchId, nodePositions.get(branchId)!);
          }

          // Exploration
          const exp = option.branch1Question.explorationArea;
          if (exp) {
            const expId = `exp-${exp.id}`;
            if (!nodePositions.has(expId)) {
              positions.set(expId, { x: INITIAL_X + 3 * (NODE_WIDTH + H_GAP), y: responseY });
            } else {
              positions.set(expId, nodePositions.get(expId)!);
            }

            // Dimensions - stack vertically
            let dimY = responseY;
            exp.behavioralDimensions.forEach((dim) => {
              const dimId = `dim-${dim.id}`;
              if (!nodePositions.has(dimId)) {
                positions.set(dimId, { x: INITIAL_X + 4 * (NODE_WIDTH + H_GAP), y: dimY });
              } else {
                positions.set(dimId, nodePositions.get(dimId)!);
              }

              // Probe hints - stack vertically next to dimension
              let probeY = dimY;
              dim.probeHints.forEach((_, hintIndex) => {
                const probeId = `probe-${dim.id}-${hintIndex}`;
                if (!nodePositions.has(probeId)) {
                  positions.set(probeId, { x: INITIAL_X + 5 * (NODE_WIDTH + H_GAP), y: probeY });
                } else {
                  positions.set(probeId, nodePositions.get(probeId)!);
                }
                probeY += NODE_HEIGHT + V_GAP;
              });

              // Move to next dimension row
              const probeCount = Math.max(1, dim.probeHints.length);
              dimY += probeCount * (NODE_HEIGHT + V_GAP);
              branchMaxY = Math.max(branchMaxY, dimY - V_GAP);
            });
          }
        }

        // Next response starts after all children of current response
        responseY = branchMaxY + NODE_HEIGHT + V_GAP * 2;
        categoryMaxY = Math.max(categoryMaxY, branchMaxY);
      });

      // Next category starts after this one
      globalY = categoryMaxY + NODE_HEIGHT + V_GAP * 4;
    });

    setNodePositions(positions);
  }, [tree, nodePositions]);

  // Recalculate positions when tree changes
  useEffect(() => {
    if (nodePositions.size === 0) {
      calculatePositions();
    }
  }, [tree, calculatePositions, nodePositions.size]);

  // Update connections when positions change
  useEffect(() => {
    const newConnections: Connection[] = [];

    tree.categories.forEach((category) => {
      const entryId = `entry-${category.id}`;
      const entryPos = nodePositions.get(entryId);

      category.entryQuestion.responseOptions.forEach((option) => {
        const respId = `resp-${option.id}`;
        const respPos = nodePositions.get(respId);

        if (entryPos && respPos) {
          newConnections.push({
            from: { x: entryPos.x + NODE_WIDTH, y: entryPos.y + NODE_HEIGHT / 2 },
            to: { x: respPos.x, y: respPos.y + NODE_HEIGHT / 2 },
          });
        }

        if (option.branch1Question) {
          const branchId = `branch-${option.branch1Question.id}`;
          const branchPos = nodePositions.get(branchId);

          if (respPos && branchPos) {
            newConnections.push({
              from: { x: respPos.x + NODE_WIDTH, y: respPos.y + NODE_HEIGHT / 2 },
              to: { x: branchPos.x, y: branchPos.y + NODE_HEIGHT / 2 },
            });
          }

          const exp = option.branch1Question.explorationArea;
          if (exp) {
            const expId = `exp-${exp.id}`;
            const expPos = nodePositions.get(expId);

            if (branchPos && expPos) {
              newConnections.push({
                from: { x: branchPos.x + NODE_WIDTH, y: branchPos.y + NODE_HEIGHT / 2 },
                to: { x: expPos.x, y: expPos.y + NODE_HEIGHT / 2 },
              });
            }

            exp.behavioralDimensions.forEach((dim) => {
              const dimId = `dim-${dim.id}`;
              const dimPos = nodePositions.get(dimId);

              if (expPos && dimPos) {
                newConnections.push({
                  from: { x: expPos.x + NODE_WIDTH, y: expPos.y + NODE_HEIGHT / 2 },
                  to: { x: dimPos.x, y: dimPos.y + NODE_HEIGHT / 2 },
                });
              }

              dim.probeHints.forEach((_, hintIndex) => {
                const probeId = `probe-${dim.id}-${hintIndex}`;
                const probePos = nodePositions.get(probeId);

                if (dimPos && probePos) {
                  newConnections.push({
                    from: { x: dimPos.x + NODE_WIDTH, y: dimPos.y + NODE_HEIGHT / 2 },
                    to: { x: probePos.x, y: probePos.y + NODE_HEIGHT / 2 },
                  });
                }
              });
            });
          }
        }
      });
    });

    setConnections(newConnections);
  }, [tree, nodePositions]);

  function updateNodePosition(nodeId: string, pos: NodePosition) {
    setNodePositions((prev) => new Map(prev).set(nodeId, pos));
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
          setNodePositions(new Map()); // Reset positions
        }
      } catch (err) {
        console.error('Failed to import:', err);
      }
    };
    input.click();
  }

  function handleReset() {
    resetToSample();
    setNodePositions(new Map());
  }

  function handleResetView() {
    setCanvasOffset({ x: 0, y: 0 });
    setZoom(1);
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-white/10 bg-black/50 backdrop-blur z-50">
        <div className="flex h-11 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-white/90">
              Peek Question Tree
            </h1>
            <span className="text-[10px] text-white/40 px-2 py-0.5 bg-white/5 rounded-full">
              {tree.categories.length} categories
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 mr-2 px-1 py-1 bg-white/5 rounded">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  canUndo ? "hover:bg-white/10 text-white/70" : "text-white/20 cursor-not-allowed"
                )}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  canRedo ? "hover:bg-white/10 text-white/70" : "text-white/20 cursor-not-allowed"
                )}
                title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-0.5 mr-2 px-2 py-1 bg-white/5 rounded">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                className="p-1 hover:bg-white/10 rounded"
              >
                <ZoomOut className="h-3.5 w-3.5 text-white/60" />
              </button>
              <span className="text-[10px] text-white/60 w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
                className="p-1 hover:bg-white/10 rounded"
              >
                <ZoomIn className="h-3.5 w-3.5 text-white/60" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="p-1 hover:bg-white/10 rounded ml-1"
                title="Reset view"
              >
                <Maximize2 className="h-3.5 w-3.5 text-white/60" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 px-4 py-1.5 border-t border-white/5 text-[9px]">
          <span className="text-white/30">Legend:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-900/70 border border-amber-500/60" />
            <span className="text-white/50">Entry</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-800/80 border border-slate-500/60" />
            <span className="text-white/50">Response</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-900/70 border border-blue-500/60" />
            <span className="text-white/50">Branch</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-900/70 border border-emerald-500/60 border-dashed" />
            <span className="text-white/50">Exploration</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-teal-900/70 border border-teal-500/60 border-dashed" />
            <span className="text-white/50">Dimension</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-violet-900/70 border border-violet-500/60 border-dashed" />
            <span className="text-white/50">Probe</span>
          </div>
          <span className="text-white/20 ml-4">Scroll or drag to pan • Drag nodes • Double-click to edit • Ctrl+Z undo</span>
        </div>
      </header>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        {...bindCanvas()}
      >
        {/* Canvas with zoom and pan */}
        <div
          ref={canvasRef}
          className="relative w-full h-full"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              width: '4000px',
              height: '4000px',
            }}
          />

          {/* SVG Connections */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '4000px', height: '4000px', overflow: 'visible' }}
          >
            {connections.map((conn, i) => {
              const midX = (conn.from.x + conn.to.x) / 2;
              return (
                <path
                  key={i}
                  d={`M ${conn.from.x} ${conn.from.y} C ${midX} ${conn.from.y}, ${midX} ${conn.to.y}, ${conn.to.x} ${conn.to.y}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {tree.categories.map((category) => (
            <CategoryNodes
              key={category.id}
              category={category}
              nodePositions={nodePositions}
              updateNodePosition={updateNodePosition}
              updateCategory={updateCategory}
              deleteCategory={deleteCategory}
              updateEntryQuestion={updateEntryQuestion}
              addResponseOption={addResponseOption}
              updateResponseOption={updateResponseOption}
              deleteResponseOption={deleteResponseOption}
              addBranch1Question={addBranch1Question}
              updateBranch1Question={updateBranch1Question}
              deleteBranch1Question={deleteBranch1Question}
              addExplorationArea={addExplorationArea}
              deleteExplorationArea={deleteExplorationArea}
              updateExplorationGoal={updateExplorationGoal}
              addBehavioralDimension={addBehavioralDimension}
              updateBehavioralDimension={updateBehavioralDimension}
              deleteBehavioralDimension={deleteBehavioralDimension}
              addProbeHint={addProbeHint}
              updateProbeHint={updateProbeHint}
              deleteProbeHint={deleteProbeHint}
            />
          ))}

          {/* Add Category Node */}
          <div
            className="absolute"
            style={{
              transform: `translate(${INITIAL_X}px, ${INITIAL_Y + tree.categories.length * 300}px)`,
            }}
          >
            <button
              type="button"
              onClick={() => addCategory('New Category')}
              className="flex items-center gap-2 px-4 py-3 text-sm border-2 border-dashed border-white/20 rounded-lg hover:border-white/40 hover:bg-white/5 text-white/50 hover:text-white/80 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category nodes renderer
interface CategoryNodesProps {
  category: Category;
  nodePositions: Map<string, NodePosition>;
  updateNodePosition: (nodeId: string, pos: NodePosition) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  updateEntryQuestion: (categoryId: string, text: string) => void;
  addResponseOption: (categoryId: string, label: string) => void;
  updateResponseOption: (categoryId: string, optionId: string, label: string) => void;
  deleteResponseOption: (categoryId: string, optionId: string) => void;
  addBranch1Question: (categoryId: string, optionId: string) => void;
  updateBranch1Question: (categoryId: string, optionId: string, text: string) => void;
  deleteBranch1Question: (categoryId: string, optionId: string) => void;
  addExplorationArea: (categoryId: string, optionId: string) => void;
  deleteExplorationArea: (categoryId: string, optionId: string) => void;
  updateExplorationGoal: (categoryId: string, optionId: string, goal: string) => void;
  addBehavioralDimension: (categoryId: string, optionId: string, name: string) => void;
  updateBehavioralDimension: (categoryId: string, optionId: string, dimensionId: string, name: string) => void;
  deleteBehavioralDimension: (categoryId: string, optionId: string, dimensionId: string) => void;
  addProbeHint: (categoryId: string, optionId: string, dimensionId: string, hint: string) => void;
  updateProbeHint: (categoryId: string, optionId: string, dimensionId: string, hintIndex: number, hint: string) => void;
  deleteProbeHint: (categoryId: string, optionId: string, dimensionId: string, hintIndex: number) => void;
}

function CategoryNodes({
  category,
  nodePositions,
  updateNodePosition,
  deleteCategory,
  updateEntryQuestion,
  addResponseOption,
  updateResponseOption,
  deleteResponseOption,
  addBranch1Question,
  updateBranch1Question,
  deleteBranch1Question,
  addExplorationArea,
  deleteExplorationArea,
  updateExplorationGoal,
  addBehavioralDimension,
  updateBehavioralDimension,
  deleteBehavioralDimension,
  addProbeHint,
  updateProbeHint,
  deleteProbeHint,
}: CategoryNodesProps) {
  const entryId = `entry-${category.id}`;
  const entryPos = nodePositions.get(entryId) || { x: INITIAL_X, y: INITIAL_Y };

  return (
    <>
      {/* Entry Question */}
      <CanvasNode
        id={entryId}
        label={category.entryQuestion.text}
        type="entry"
        isFixed
        position={entryPos}
        onPositionChange={(pos) => updateNodePosition(entryId, pos)}
        onUpdate={(text) => updateEntryQuestion(category.id, text)}
        onDelete={() => deleteCategory(category.id)}
        onAdd={() => addResponseOption(category.id, 'New response')}
        childIds={category.entryQuestion.responseOptions.map((o) => `resp-${o.id}`)}
      />

      {/* Response Options and their children */}
      {category.entryQuestion.responseOptions.map((option) => (
        <ResponseNodes
          key={option.id}
          categoryId={category.id}
          option={option}
          nodePositions={nodePositions}
          updateNodePosition={updateNodePosition}
          updateResponseOption={updateResponseOption}
          deleteResponseOption={deleteResponseOption}
          addBranch1Question={addBranch1Question}
          updateBranch1Question={updateBranch1Question}
          deleteBranch1Question={deleteBranch1Question}
          addExplorationArea={addExplorationArea}
          deleteExplorationArea={deleteExplorationArea}
          updateExplorationGoal={updateExplorationGoal}
          addBehavioralDimension={addBehavioralDimension}
          updateBehavioralDimension={updateBehavioralDimension}
          deleteBehavioralDimension={deleteBehavioralDimension}
          addProbeHint={addProbeHint}
          updateProbeHint={updateProbeHint}
          deleteProbeHint={deleteProbeHint}
        />
      ))}
    </>
  );
}

// Response nodes renderer
interface ResponseNodesProps {
  categoryId: string;
  option: ResponseOption;
  nodePositions: Map<string, NodePosition>;
  updateNodePosition: (nodeId: string, pos: NodePosition) => void;
  updateResponseOption: (categoryId: string, optionId: string, label: string) => void;
  deleteResponseOption: (categoryId: string, optionId: string) => void;
  addBranch1Question: (categoryId: string, optionId: string) => void;
  updateBranch1Question: (categoryId: string, optionId: string, text: string) => void;
  deleteBranch1Question: (categoryId: string, optionId: string) => void;
  addExplorationArea: (categoryId: string, optionId: string) => void;
  deleteExplorationArea: (categoryId: string, optionId: string) => void;
  updateExplorationGoal: (categoryId: string, optionId: string, goal: string) => void;
  addBehavioralDimension: (categoryId: string, optionId: string, name: string) => void;
  updateBehavioralDimension: (categoryId: string, optionId: string, dimensionId: string, name: string) => void;
  deleteBehavioralDimension: (categoryId: string, optionId: string, dimensionId: string) => void;
  addProbeHint: (categoryId: string, optionId: string, dimensionId: string, hint: string) => void;
  updateProbeHint: (categoryId: string, optionId: string, dimensionId: string, hintIndex: number, hint: string) => void;
  deleteProbeHint: (categoryId: string, optionId: string, dimensionId: string, hintIndex: number) => void;
}

function ResponseNodes({
  categoryId,
  option,
  nodePositions,
  updateNodePosition,
  updateResponseOption,
  deleteResponseOption,
  addBranch1Question,
  updateBranch1Question,
  deleteBranch1Question,
  addExplorationArea,
  deleteExplorationArea,
  updateExplorationGoal,
  addBehavioralDimension,
  updateBehavioralDimension,
  deleteBehavioralDimension,
  addProbeHint,
  updateProbeHint,
  deleteProbeHint,
}: ResponseNodesProps) {
  const respId = `resp-${option.id}`;
  const respPos = nodePositions.get(respId) || { x: 0, y: 0 };
  const branch1 = option.branch1Question;
  const exp = branch1?.explorationArea;
  const dims = exp?.behavioralDimensions || [];

  return (
    <>
      {/* Response - shows Add button if no branch question yet */}
      <CanvasNode
        id={respId}
        label={option.label}
        type="response"
        position={respPos}
        onPositionChange={(pos) => updateNodePosition(respId, pos)}
        onUpdate={(label) => updateResponseOption(categoryId, option.id, label)}
        onDelete={() => deleteResponseOption(categoryId, option.id)}
        onAdd={!branch1 ? () => addBranch1Question(categoryId, option.id) : undefined}
        childIds={branch1 ? [`branch-${branch1.id}`] : []}
      />

      {/* Branch 1 - shows Add button if no exploration yet */}
      {branch1 && (
        <CanvasNode
          id={`branch-${branch1.id}`}
          label={branch1.text}
          type="branch"
          isFixed
          position={nodePositions.get(`branch-${branch1.id}`) || { x: 0, y: 0 }}
          onPositionChange={(pos) => updateNodePosition(`branch-${branch1.id}`, pos)}
          onUpdate={(text) => updateBranch1Question(categoryId, option.id, text)}
          onDelete={() => deleteBranch1Question(categoryId, option.id)}
          onAdd={!exp ? () => addExplorationArea(categoryId, option.id) : undefined}
          childIds={exp ? [`exp-${exp.id}`] : []}
        />
      )}

      {/* Exploration */}
      {exp && (
        <CanvasNode
          id={`exp-${exp.id}`}
          label={exp.goal}
          type="exploration"
          isFixed={false}
          position={nodePositions.get(`exp-${exp.id}`) || { x: 0, y: 0 }}
          onPositionChange={(pos) => updateNodePosition(`exp-${exp.id}`, pos)}
          onUpdate={(goal) => updateExplorationGoal(categoryId, option.id, goal)}
          onDelete={() => deleteExplorationArea(categoryId, option.id)}
          onAdd={() => addBehavioralDimension(categoryId, option.id, 'New dimension')}
          childIds={dims.map((d) => `dim-${d.id}`)}
        />
      )}

      {/* Dimensions */}
      {dims.map((dim) => (
        <DimensionNodes
          key={dim.id}
          categoryId={categoryId}
          optionId={option.id}
          dim={dim}
          nodePositions={nodePositions}
          updateNodePosition={updateNodePosition}
          updateBehavioralDimension={updateBehavioralDimension}
          deleteBehavioralDimension={deleteBehavioralDimension}
          addProbeHint={addProbeHint}
          updateProbeHint={updateProbeHint}
          deleteProbeHint={deleteProbeHint}
        />
      ))}
    </>
  );
}

// Dimension nodes renderer
interface DimensionNodesProps {
  categoryId: string;
  optionId: string;
  dim: BehavioralDimension;
  nodePositions: Map<string, NodePosition>;
  updateNodePosition: (nodeId: string, pos: NodePosition) => void;
  updateBehavioralDimension: (categoryId: string, optionId: string, dimensionId: string, name: string) => void;
  deleteBehavioralDimension: (categoryId: string, optionId: string, dimensionId: string) => void;
  addProbeHint: (categoryId: string, optionId: string, dimensionId: string, hint: string) => void;
  updateProbeHint: (categoryId: string, optionId: string, dimensionId: string, hintIndex: number, hint: string) => void;
  deleteProbeHint: (categoryId: string, optionId: string, dimensionId: string, hintIndex: number) => void;
}

function DimensionNodes({
  categoryId,
  optionId,
  dim,
  nodePositions,
  updateNodePosition,
  updateBehavioralDimension,
  deleteBehavioralDimension,
  addProbeHint,
  updateProbeHint,
  deleteProbeHint,
}: DimensionNodesProps) {
  const dimId = `dim-${dim.id}`;

  return (
    <>
      {/* Dimension */}
      <CanvasNode
        id={dimId}
        label={dim.name}
        type="dimension"
        isFixed={false}
        position={nodePositions.get(dimId) || { x: 0, y: 0 }}
        onPositionChange={(pos) => updateNodePosition(dimId, pos)}
        onUpdate={(name) => updateBehavioralDimension(categoryId, optionId, dim.id, name)}
        onDelete={() => deleteBehavioralDimension(categoryId, optionId, dim.id)}
        onAdd={() => addProbeHint(categoryId, optionId, dim.id, 'New probe hint')}
        childIds={dim.probeHints.map((_, i) => `probe-${dim.id}-${i}`)}
      />

      {/* Probe hints */}
      {dim.probeHints.map((hint, i) => (
        <CanvasNode
          key={`probe-${dim.id}-${i}`}
          id={`probe-${dim.id}-${i}`}
          label={hint}
          type="probe"
          isFixed={false}
          position={nodePositions.get(`probe-${dim.id}-${i}`) || { x: 0, y: 0 }}
          onPositionChange={(pos) => updateNodePosition(`probe-${dim.id}-${i}`, pos)}
          onUpdate={(h) => updateProbeHint(categoryId, optionId, dim.id, i, h)}
          onDelete={() => deleteProbeHint(categoryId, optionId, dim.id, i)}
        />
      ))}
    </>
  );
}

