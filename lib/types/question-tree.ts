export interface QuestionTree {
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  entryQuestion: EntryQuestion;
}

export interface EntryQuestion {
  id: string;
  text: string;
  responseOptions: ResponseOption[];
}

export interface ResponseOption {
  id: string;
  label: string;
  branch1Question?: BranchQuestion;
}

export interface BranchQuestion {
  id: string;
  text: string;
  type: 'context-gathering' | 'evaluative';
  isFixed: boolean;
  responseOptions: BranchResponseOption[];
  explorationArea?: ExplorationArea;
  evaluationArea?: EvaluationArea;
}

export interface BranchResponseOption {
  id: string;
  label: string;
}

export interface ExplorationArea {
  id: string;
  goal: string;
  behavioralDimensions: BehavioralDimension[];
}

export interface EvaluationArea {
  id: string;
  evaluationDimensions: EvaluationDimension[];
  conclusionHints: string[];
}

export interface BehavioralDimension {
  id: string;
  name: string;
  probeHints: string[];
}

export interface EvaluationDimension {
  id: string;
  name: string;
  probeHints: string[];
}

// Helper type for node identification in the tree
export type NodeType = 
  | 'category'
  | 'entry-question'
  | 'response-option'
  | 'branch1-question'
  | 'branch2-question'
  | 'exploration-area'
  | 'evaluation-area'
  | 'behavioral-dimension'
  | 'evaluation-dimension'
  | 'probe-hint'
  | 'conclusion-hint';

export interface TreePath {
  categoryId: string;
  responseOptionId?: string;
  branch1QuestionId?: string;
  branch2QuestionId?: string;
  dimensionId?: string;
}

