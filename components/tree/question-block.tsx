'use client';

import { Lock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BranchQuestion } from '@/lib/types/question-tree';
import { EditableText } from './editable-text';
import { InlineAdd } from './inline-add';
import { ExplorationBlock, EvaluationBlock } from './exploration-block';
import { useTreeStore } from '@/lib/stores/tree-store';

interface QuestionBlockProps {
  categoryId: string;
  optionId: string;
  optionLabel: string;
  branchQuestion: BranchQuestion;
}

export function QuestionBlock({
  categoryId,
  optionId,
  optionLabel,
  branchQuestion,
}: QuestionBlockProps) {
  const {
    updateBranch1Question,
    addBranch1ResponseOption,
    updateBranch1ResponseOption,
    deleteBranch1ResponseOption,
  } = useTreeStore();

  const isContextGathering = branchQuestion.type === 'context-gathering';

  return (
    <div className="space-y-4">
      {/* Branch 1 Question */}
      <div
        className={cn(
          'rounded-xl border p-4 tree-node',
          'bg-gradient-to-br from-blue-950/30 to-indigo-950/20',
          'border-blue-800/40'
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Branch 1 Question
          </span>
          <span className="text-xs text-muted-foreground">
            (Context Gathering)
          </span>
        </div>

        <div className="text-xs text-muted-foreground mb-2">
          Shown for: <span className="text-foreground">{optionLabel}</span>
        </div>

        {/* Question Text */}
        <div className="p-3 bg-card/50 rounded-lg border border-border/30 mb-4">
          <EditableText
            value={branchQuestion.text}
            onSave={(text) =>
              updateBranch1Question(categoryId, optionId, text)
            }
            className="text-sm"
            placeholder="Enter your context-gathering question..."
          />
        </div>

        {/* Response Options */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Response Options:
          </div>
          <div className="flex flex-wrap gap-2">
            {branchQuestion.responseOptions.map((response) => (
              <div
                key={response.id}
                className={cn(
                  'group flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                  'bg-card/60 border border-border/50 text-sm'
                )}
              >
                <span className="text-muted-foreground">○</span>
                <EditableText
                  value={response.label}
                  onSave={(label) =>
                    updateBranch1ResponseOption(
                      categoryId,
                      optionId,
                      response.id,
                      label
                    )
                  }
                  className="text-sm"
                  placeholder="Option..."
                />
                <button
                  type="button"
                  onClick={() =>
                    deleteBranch1ResponseOption(
                      categoryId,
                      optionId,
                      response.id
                    )
                  }
                  className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 hover:bg-destructive/20 rounded transition-all"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
          <InlineAdd
            placeholder="Add response option..."
            onAdd={(label) =>
              addBranch1ResponseOption(categoryId, optionId, label)
            }
            onBulkAdd={(labels) =>
              labels.forEach((label) =>
                addBranch1ResponseOption(categoryId, optionId, label)
              )
            }
          />
        </div>
      </div>

      {/* Arrow connector */}
      <div className="flex justify-center">
        <div className="w-0.5 h-6 bg-border/50 relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border/50" />
        </div>
      </div>

      {/* Exploration Area */}
      {branchQuestion.explorationArea && (
        <ExplorationBlock
          categoryId={categoryId}
          optionId={optionId}
          explorationArea={branchQuestion.explorationArea}
        />
      )}

      {/* Arrow connector to Evaluation */}
      {branchQuestion.evaluationArea && (
        <>
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-border/50 relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border/50" />
            </div>
          </div>

          {/* Evaluation Area */}
          <EvaluationBlock
            categoryId={categoryId}
            optionId={optionId}
            evaluationArea={branchQuestion.evaluationArea}
          />
        </>
      )}
    </div>
  );
}

