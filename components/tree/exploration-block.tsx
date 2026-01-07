'use client';

import { Dices, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExplorationArea, EvaluationArea } from '@/lib/types/question-tree';
import { EditableText } from './editable-text';
import { InlineAdd } from './inline-add';
import { DimensionAccordion } from './dimension-accordion';
import { useTreeStore } from '@/lib/stores/tree-store';

interface ExplorationBlockProps {
  categoryId: string;
  optionId: string;
  explorationArea: ExplorationArea;
}

export function ExplorationBlock({
  categoryId,
  optionId,
  explorationArea,
}: ExplorationBlockProps) {
  const {
    updateExplorationGoal,
    addBehavioralDimension,
    updateBehavioralDimension,
    deleteBehavioralDimension,
    addProbeHint,
    updateProbeHint,
    deleteProbeHint,
  } = useTreeStore();

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed p-4',
        'bg-gradient-to-br from-emerald-950/20 to-teal-950/10',
        'border-emerald-800/30'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Dices className="h-4 w-4 text-emerald-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Exploration Area
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          (flexible — AI picks 2-4)
        </span>
      </div>

      {/* Exploration Goal */}
      <div className="mb-4 p-3 bg-card/40 rounded-lg border border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Exploration Goal:
          </span>
        </div>
        <EditableText
          value={explorationArea.goal}
          onSave={(goal) => updateExplorationGoal(categoryId, optionId, goal)}
          className="text-sm italic"
          placeholder="What pattern are we exploring?"
          multiline
        />
      </div>

      {/* Behavioral Dimensions */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Behavioral Dimensions:
        </div>
        {explorationArea.behavioralDimensions.map((dimension) => (
          <DimensionAccordion
            key={dimension.id}
            id={dimension.id}
            name={dimension.name}
            probeHints={dimension.probeHints}
            onUpdateName={(name) =>
              updateBehavioralDimension(categoryId, optionId, dimension.id, name)
            }
            onDelete={() =>
              deleteBehavioralDimension(categoryId, optionId, dimension.id)
            }
            onAddHint={(hint) =>
              addProbeHint(categoryId, optionId, dimension.id, hint)
            }
            onUpdateHint={(index, hint) =>
              updateProbeHint(categoryId, optionId, dimension.id, index, hint)
            }
            onDeleteHint={(index) =>
              deleteProbeHint(categoryId, optionId, dimension.id, index)
            }
            variant="behavioral"
          />
        ))}
        <InlineAdd
          placeholder="Add behavioral dimension (e.g., proximity-vs-intentionality)..."
          onAdd={(name) => addBehavioralDimension(categoryId, optionId, name)}
          onBulkAdd={(names) =>
            names.forEach((name) =>
              addBehavioralDimension(categoryId, optionId, name)
            )
          }
        />
      </div>
    </div>
  );
}

interface EvaluationBlockProps {
  categoryId: string;
  optionId: string;
  evaluationArea: EvaluationArea;
}

export function EvaluationBlock({
  categoryId,
  optionId,
  evaluationArea,
}: EvaluationBlockProps) {
  const {
    addEvaluationDimension,
    updateEvaluationDimension,
    deleteEvaluationDimension,
    addEvalProbeHint,
    updateEvalProbeHint,
    deleteEvalProbeHint,
    addConclusionHint,
    updateConclusionHint,
    deleteConclusionHint,
  } = useTreeStore();

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed p-4',
        'bg-gradient-to-br from-violet-950/20 to-purple-950/10',
        'border-violet-800/30'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Dices className="h-4 w-4 text-violet-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
          Evaluation Area
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          (flexible — AI picks from pool)
        </span>
      </div>

      {/* Evaluation Dimensions */}
      <div className="space-y-2 mb-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Evaluation Dimensions:
        </div>
        {evaluationArea.evaluationDimensions.map((dimension) => (
          <DimensionAccordion
            key={dimension.id}
            id={dimension.id}
            name={dimension.name}
            probeHints={dimension.probeHints}
            onUpdateName={(name) =>
              updateEvaluationDimension(categoryId, optionId, dimension.id, name)
            }
            onDelete={() =>
              deleteEvaluationDimension(categoryId, optionId, dimension.id)
            }
            onAddHint={(hint) =>
              addEvalProbeHint(categoryId, optionId, dimension.id, hint)
            }
            onUpdateHint={(index, hint) =>
              updateEvalProbeHint(categoryId, optionId, dimension.id, index, hint)
            }
            onDeleteHint={(index) =>
              deleteEvalProbeHint(categoryId, optionId, dimension.id, index)
            }
            variant="evaluation"
          />
        ))}
        <InlineAdd
          placeholder="Add evaluation dimension (e.g., cost-reality)..."
          onAdd={(name) => addEvaluationDimension(categoryId, optionId, name)}
          onBulkAdd={(names) =>
            names.forEach((name) =>
              addEvaluationDimension(categoryId, optionId, name)
            )
          }
        />
      </div>

      {/* Conclusion Hints */}
      <div className="p-3 bg-card/40 rounded-lg border border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Conclusion Hints:
          </span>
        </div>
        <div className="space-y-1.5">
          {evaluationArea.conclusionHints.map((hint, index) => (
            <div
              key={`conclusion-${index}`}
              className="flex items-start gap-2 group"
            >
              <span className="text-muted-foreground mt-0.5">•</span>
              <div className="flex-1 min-w-0">
                <EditableText
                  value={hint}
                  onSave={(val) =>
                    updateConclusionHint(categoryId, optionId, index, val)
                  }
                  className="text-xs"
                  placeholder="Enter conclusion hint..."
                />
              </div>
              <button
                type="button"
                onClick={() => deleteConclusionHint(categoryId, optionId, index)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/20 rounded transition-all"
              >
                <span className="text-destructive text-xs">×</span>
              </button>
            </div>
          ))}
          <InlineAdd
            placeholder="Add conclusion hint..."
            onAdd={(hint) => addConclusionHint(categoryId, optionId, hint)}
            onBulkAdd={(hints) =>
              hints.forEach((hint) =>
                addConclusionHint(categoryId, optionId, hint)
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

