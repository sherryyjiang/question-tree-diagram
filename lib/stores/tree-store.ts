import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  QuestionTree,
  Category,
  EntryQuestion,
  ResponseOption,
  BranchQuestion,
  BranchResponseOption,
  Branch2Question,
  Branch2ResponseOption,
  ExplorationArea,
  EvaluationArea,
  BehavioralDimension,
  EvaluationDimension,
} from '@/lib/types/question-tree';
import { sampleTree } from '@/lib/data/sample-tree';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface TreeState {
  tree: QuestionTree;
  expandedNodes: Set<string>;

  // Category actions
  addCategory: (name: string) => void;
  updateCategory: (categoryId: string, name: string) => void;
  deleteCategory: (categoryId: string) => void;

  // Entry question actions
  updateEntryQuestion: (categoryId: string, text: string) => void;

  // Response option actions
  addResponseOption: (categoryId: string, label: string) => void;
  updateResponseOption: (categoryId: string, optionId: string, label: string) => void;
  deleteResponseOption: (categoryId: string, optionId: string) => void;

  // Branch 1 question actions
  addBranch1Question: (categoryId: string, optionId: string) => void;
  updateBranch1Question: (categoryId: string, optionId: string, text: string) => void;
  deleteBranch1Question: (categoryId: string, optionId: string) => void;

  // Exploration area actions
  addExplorationArea: (categoryId: string, optionId: string) => void;
  deleteExplorationArea: (categoryId: string, optionId: string) => void;
  addBranch1ResponseOption: (categoryId: string, optionId: string, label: string) => void;
  updateBranch1ResponseOption: (
    categoryId: string,
    optionId: string,
    responseId: string,
    label: string
  ) => void;
  deleteBranch1ResponseOption: (
    categoryId: string,
    optionId: string,
    responseId: string
  ) => void;

  // Branch 2 question actions
  addBranch2Question: (categoryId: string, optionId: string, branch1ResponseId: string) => void;
  updateBranch2Question: (
    categoryId: string,
    optionId: string,
    branch1ResponseId: string,
    text: string
  ) => void;
  deleteBranch2Question: (
    categoryId: string,
    optionId: string,
    branch1ResponseId: string
  ) => void;
  addBranch2ResponseOption: (
    categoryId: string,
    optionId: string,
    branch1ResponseId: string,
    label: string
  ) => void;
  updateBranch2ResponseOption: (
    categoryId: string,
    optionId: string,
    branch1ResponseId: string,
    responseId: string,
    label: string
  ) => void;
  deleteBranch2ResponseOption: (
    categoryId: string,
    optionId: string,
    branch1ResponseId: string,
    responseId: string
  ) => void;

  // Exploration area actions
  updateExplorationGoal: (categoryId: string, optionId: string, goal: string) => void;

  // Behavioral dimension actions
  addBehavioralDimension: (categoryId: string, optionId: string, name: string) => void;
  updateBehavioralDimension: (
    categoryId: string,
    optionId: string,
    dimensionId: string,
    name: string
  ) => void;
  deleteBehavioralDimension: (
    categoryId: string,
    optionId: string,
    dimensionId: string
  ) => void;

  // Probe hint actions
  addProbeHint: (
    categoryId: string,
    optionId: string,
    dimensionId: string,
    hint: string
  ) => void;
  updateProbeHint: (
    categoryId: string,
    optionId: string,
    dimensionId: string,
    hintIndex: number,
    hint: string
  ) => void;
  deleteProbeHint: (
    categoryId: string,
    optionId: string,
    dimensionId: string,
    hintIndex: number
  ) => void;

  // Evaluation dimension actions
  addEvaluationDimension: (categoryId: string, optionId: string, name: string) => void;
  updateEvaluationDimension: (
    categoryId: string,
    optionId: string,
    dimensionId: string,
    name: string
  ) => void;
  deleteEvaluationDimension: (
    categoryId: string,
    optionId: string,
    dimensionId: string
  ) => void;

  // Evaluation probe hint actions
  addEvalProbeHint: (
    categoryId: string,
    optionId: string,
    dimensionId: string,
    hint: string
  ) => void;
  updateEvalProbeHint: (
    categoryId: string,
    optionId: string,
    dimensionId: string,
    hintIndex: number,
    hint: string
  ) => void;
  deleteEvalProbeHint: (
    categoryId: string,
    optionId: string,
    dimensionId: string,
    hintIndex: number
  ) => void;

  // Conclusion hint actions
  addConclusionHint: (categoryId: string, optionId: string, hint: string) => void;
  updateConclusionHint: (
    categoryId: string,
    optionId: string,
    hintIndex: number,
    hint: string
  ) => void;
  deleteConclusionHint: (categoryId: string, optionId: string, hintIndex: number) => void;

  // UI state
  toggleNode: (nodeId: string) => void;
  isExpanded: (nodeId: string) => boolean;

  // Reset
  resetToSample: () => void;
}

// Helper to find and update nested structures
function findCategory(tree: QuestionTree, categoryId: string): Category | undefined {
  return tree.categories.find((c) => c.id === categoryId);
}

function findResponseOption(
  category: Category,
  optionId: string
): ResponseOption | undefined {
  return category.entryQuestion.responseOptions.find((o) => o.id === optionId);
}

export const useTreeStore = create<TreeState>()(
  persist(
    (set, get) => ({
      tree: sampleTree,
      expandedNodes: new Set<string>(),

      // Category actions
      addCategory: (name) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: [
              ...state.tree.categories,
              {
                id: generateId(),
                name,
                entryQuestion: {
                  id: generateId(),
                  text: 'Enter your question here...',
                  responseOptions: [],
                },
              },
            ],
          },
        })),

      updateCategory: (categoryId, name) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId ? { ...c, name } : c
            ),
          },
        })),

      deleteCategory: (categoryId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.filter((c) => c.id !== categoryId),
          },
        })),

      // Entry question actions
      updateEntryQuestion: (categoryId, text) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? { ...c, entryQuestion: { ...c.entryQuestion, text } }
                : c
            ),
          },
        })),

      // Response option actions - creates just the response, no nested structure
      addResponseOption: (categoryId, label) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: [
                        ...c.entryQuestion.responseOptions,
                        {
                          id: generateId(),
                          label,
                          // No branch1Question - user adds it incrementally
                        },
                      ],
                    },
                  }
                : c
            ),
          },
        })),

      // Add branch question to a response option
      addBranch1Question: (categoryId, optionId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && !o.branch1Question
                          ? {
                              ...o,
                              branch1Question: {
                                id: generateId(),
                                text: 'Enter context-gathering question...',
                                type: 'context-gathering' as const,
                                isFixed: true,
                                responseOptions: [],
                                // No explorationArea - user adds it incrementally
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // Add exploration area to a branch question
      addExplorationArea: (categoryId, optionId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question && !o.branch1Question.explorationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                explorationArea: {
                                  id: generateId(),
                                  goal: 'Enter exploration goal...',
                                  behavioralDimensions: [],
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      updateResponseOption: (categoryId, optionId, label) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId ? { ...o, label } : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      deleteResponseOption: (categoryId, optionId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.filter(
                        (o) => o.id !== optionId
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // Delete branch1 question from a response option
      deleteBranch1Question: (categoryId, optionId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId
                          ? { ...o, branch1Question: undefined }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // Delete exploration area from a branch question
      deleteExplorationArea: (categoryId, optionId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                explorationArea: undefined,
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // Branch 1 question actions
      updateBranch1Question: (categoryId, optionId, text) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question
                          ? { ...o, branch1Question: { ...o.branch1Question, text } }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      addBranch1ResponseOption: (categoryId, optionId, label) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                responseOptions: [
                                  ...o.branch1Question.responseOptions,
                                  { id: generateId(), label },
                                ],
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      updateBranch1ResponseOption: (categoryId, optionId, responseId, label) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                responseOptions: o.branch1Question.responseOptions.map(
                                  (r) => (r.id === responseId ? { ...r, label } : r)
                                ),
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      deleteBranch1ResponseOption: (categoryId, optionId, responseId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                responseOptions:
                                  o.branch1Question.responseOptions.filter(
                                    (r) => r.id !== responseId
                                  ),
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // Branch 2 question actions
      addBranch2Question: (categoryId, optionId, branch1ResponseId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                responseOptions: o.branch1Question.responseOptions.map(
                                  (r) =>
                                    r.id === branch1ResponseId && !r.branch2Question
                                      ? {
                                          ...r,
                                          branch2Question: {
                                            id: generateId(),
                                            text: 'Enter follow-up question...',
                                            type: 'context-gathering' as const,
                                            isFixed: true,
                                            responseOptions: [],
                                          },
                                        }
                                      : r
                                ),
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      updateBranch2Question: (categoryId, optionId, branch1ResponseId, text) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                responseOptions: o.branch1Question.responseOptions.map(
                                  (r) =>
                                    r.id === branch1ResponseId && r.branch2Question
                                      ? {
                                          ...r,
                                          branch2Question: {
                                            ...r.branch2Question,
                                            text,
                                          },
                                        }
                                      : r
                                ),
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      deleteBranch2Question: (categoryId, optionId, branch1ResponseId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                responseOptions: o.branch1Question.responseOptions.map(
                                  (r) =>
                                    r.id === branch1ResponseId
                                      ? { ...r, branch2Question: undefined }
                                      : r
                                ),
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      addBranch2ResponseOption: (categoryId, optionId, branch1ResponseId, label) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                responseOptions: o.branch1Question.responseOptions.map(
                                  (r) =>
                                    r.id === branch1ResponseId && r.branch2Question
                                      ? {
                                          ...r,
                                          branch2Question: {
                                            ...r.branch2Question,
                                            responseOptions: [
                                              ...r.branch2Question.responseOptions,
                                              { id: generateId(), label },
                                            ],
                                          },
                                        }
                                      : r
                                ),
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      updateBranch2ResponseOption: (
        categoryId,
        optionId,
        branch1ResponseId,
        responseId,
        label
      ) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                responseOptions: o.branch1Question.responseOptions.map(
                                  (r) =>
                                    r.id === branch1ResponseId && r.branch2Question
                                      ? {
                                          ...r,
                                          branch2Question: {
                                            ...r.branch2Question,
                                            responseOptions:
                                              r.branch2Question.responseOptions.map((ro) =>
                                                ro.id === responseId
                                                  ? { ...ro, label }
                                                  : ro
                                              ),
                                          },
                                        }
                                      : r
                                ),
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      deleteBranch2ResponseOption: (categoryId, optionId, branch1ResponseId, responseId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                responseOptions: o.branch1Question.responseOptions.map(
                                  (r) =>
                                    r.id === branch1ResponseId && r.branch2Question
                                      ? {
                                          ...r,
                                          branch2Question: {
                                            ...r.branch2Question,
                                            responseOptions:
                                              r.branch2Question.responseOptions.filter(
                                                (ro) => ro.id !== responseId
                                              ),
                                          },
                                        }
                                      : r
                                ),
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // Exploration area actions
      updateExplorationGoal: (categoryId, optionId, goal) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.explorationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                explorationArea: {
                                  ...o.branch1Question.explorationArea,
                                  goal,
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // Behavioral dimension actions
      addBehavioralDimension: (categoryId, optionId, name) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.explorationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                explorationArea: {
                                  ...o.branch1Question.explorationArea,
                                  behavioralDimensions: [
                                    ...o.branch1Question.explorationArea
                                      .behavioralDimensions,
                                    { id: generateId(), name, probeHints: [] },
                                  ],
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      updateBehavioralDimension: (categoryId, optionId, dimensionId, name) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.explorationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                explorationArea: {
                                  ...o.branch1Question.explorationArea,
                                  behavioralDimensions:
                                    o.branch1Question.explorationArea.behavioralDimensions.map(
                                      (d) => (d.id === dimensionId ? { ...d, name } : d)
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      deleteBehavioralDimension: (categoryId, optionId, dimensionId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.explorationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                explorationArea: {
                                  ...o.branch1Question.explorationArea,
                                  behavioralDimensions:
                                    o.branch1Question.explorationArea.behavioralDimensions.filter(
                                      (d) => d.id !== dimensionId
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // Probe hint actions
      addProbeHint: (categoryId, optionId, dimensionId, hint) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.explorationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                explorationArea: {
                                  ...o.branch1Question.explorationArea,
                                  behavioralDimensions:
                                    o.branch1Question.explorationArea.behavioralDimensions.map(
                                      (d) =>
                                        d.id === dimensionId
                                          ? { ...d, probeHints: [...d.probeHints, hint] }
                                          : d
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      updateProbeHint: (categoryId, optionId, dimensionId, hintIndex, hint) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.explorationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                explorationArea: {
                                  ...o.branch1Question.explorationArea,
                                  behavioralDimensions:
                                    o.branch1Question.explorationArea.behavioralDimensions.map(
                                      (d) =>
                                        d.id === dimensionId
                                          ? {
                                              ...d,
                                              probeHints: d.probeHints.map((h, i) =>
                                                i === hintIndex ? hint : h
                                              ),
                                            }
                                          : d
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      deleteProbeHint: (categoryId, optionId, dimensionId, hintIndex) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.explorationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                explorationArea: {
                                  ...o.branch1Question.explorationArea,
                                  behavioralDimensions:
                                    o.branch1Question.explorationArea.behavioralDimensions.map(
                                      (d) =>
                                        d.id === dimensionId
                                          ? {
                                              ...d,
                                              probeHints: d.probeHints.filter(
                                                (_, i) => i !== hintIndex
                                              ),
                                            }
                                          : d
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // Evaluation dimension actions
      addEvaluationDimension: (categoryId, optionId, name) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.evaluationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                evaluationArea: {
                                  ...o.branch1Question.evaluationArea,
                                  evaluationDimensions: [
                                    ...o.branch1Question.evaluationArea
                                      .evaluationDimensions,
                                    { id: generateId(), name, probeHints: [] },
                                  ],
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      updateEvaluationDimension: (categoryId, optionId, dimensionId, name) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.evaluationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                evaluationArea: {
                                  ...o.branch1Question.evaluationArea,
                                  evaluationDimensions:
                                    o.branch1Question.evaluationArea.evaluationDimensions.map(
                                      (d) => (d.id === dimensionId ? { ...d, name } : d)
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      deleteEvaluationDimension: (categoryId, optionId, dimensionId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.evaluationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                evaluationArea: {
                                  ...o.branch1Question.evaluationArea,
                                  evaluationDimensions:
                                    o.branch1Question.evaluationArea.evaluationDimensions.filter(
                                      (d) => d.id !== dimensionId
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // Evaluation probe hint actions
      addEvalProbeHint: (categoryId, optionId, dimensionId, hint) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.evaluationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                evaluationArea: {
                                  ...o.branch1Question.evaluationArea,
                                  evaluationDimensions:
                                    o.branch1Question.evaluationArea.evaluationDimensions.map(
                                      (d) =>
                                        d.id === dimensionId
                                          ? { ...d, probeHints: [...d.probeHints, hint] }
                                          : d
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      updateEvalProbeHint: (categoryId, optionId, dimensionId, hintIndex, hint) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.evaluationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                evaluationArea: {
                                  ...o.branch1Question.evaluationArea,
                                  evaluationDimensions:
                                    o.branch1Question.evaluationArea.evaluationDimensions.map(
                                      (d) =>
                                        d.id === dimensionId
                                          ? {
                                              ...d,
                                              probeHints: d.probeHints.map((h, i) =>
                                                i === hintIndex ? hint : h
                                              ),
                                            }
                                          : d
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      deleteEvalProbeHint: (categoryId, optionId, dimensionId, hintIndex) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.evaluationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                evaluationArea: {
                                  ...o.branch1Question.evaluationArea,
                                  evaluationDimensions:
                                    o.branch1Question.evaluationArea.evaluationDimensions.map(
                                      (d) =>
                                        d.id === dimensionId
                                          ? {
                                              ...d,
                                              probeHints: d.probeHints.filter(
                                                (_, i) => i !== hintIndex
                                              ),
                                            }
                                          : d
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // Conclusion hint actions
      addConclusionHint: (categoryId, optionId, hint) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.evaluationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                evaluationArea: {
                                  ...o.branch1Question.evaluationArea,
                                  conclusionHints: [
                                    ...o.branch1Question.evaluationArea.conclusionHints,
                                    hint,
                                  ],
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      updateConclusionHint: (categoryId, optionId, hintIndex, hint) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.evaluationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                evaluationArea: {
                                  ...o.branch1Question.evaluationArea,
                                  conclusionHints:
                                    o.branch1Question.evaluationArea.conclusionHints.map(
                                      (h, i) => (i === hintIndex ? hint : h)
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      deleteConclusionHint: (categoryId, optionId, hintIndex) =>
        set((state) => ({
          tree: {
            ...state.tree,
            categories: state.tree.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    entryQuestion: {
                      ...c.entryQuestion,
                      responseOptions: c.entryQuestion.responseOptions.map((o) =>
                        o.id === optionId && o.branch1Question?.evaluationArea
                          ? {
                              ...o,
                              branch1Question: {
                                ...o.branch1Question,
                                evaluationArea: {
                                  ...o.branch1Question.evaluationArea,
                                  conclusionHints:
                                    o.branch1Question.evaluationArea.conclusionHints.filter(
                                      (_, i) => i !== hintIndex
                                    ),
                                },
                              },
                            }
                          : o
                      ),
                    },
                  }
                : c
            ),
          },
        })),

      // UI state
      toggleNode: (nodeId) =>
        set((state) => {
          const newExpanded = new Set(state.expandedNodes);
          if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
          } else {
            newExpanded.add(nodeId);
          }
          return { expandedNodes: newExpanded };
        }),

      isExpanded: (nodeId) => get().expandedNodes.has(nodeId),

      // Reset
      resetToSample: () => set({ tree: sampleTree, expandedNodes: new Set() }),
    }),
    {
      name: 'question-tree-storage',
      partialize: (state) => ({ tree: state.tree }),
      // Convert Set to Array for storage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              expandedNodes: new Set(),
            },
          };
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

