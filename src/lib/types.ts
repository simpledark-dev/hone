export type ExerciseType = 'letters' | 'listening' | 'shapes';

export const EXERCISE_TYPES: ExerciseType[] = ['letters', 'listening', 'shapes'];

export type SessionMode = 'mixed' | ExerciseType;

/** One numeric answer the user must give. */
export interface AnswerSlot {
  id: string;
  /** Short label shown on the slot chip, e.g. "G", "Vowels", "red circles". */
  label: string;
  answer: number;
  /** Optional swatch colour (shapes exercise). */
  color?: string;
}

interface BaseExercise {
  id: string;
  type: ExerciseType;
  level: number;
  /** Headline instruction, e.g. "Count every G and T". */
  prompt: string;
  /** One-line hint shown under the prompt. */
  hint?: string;
  slots: AnswerSlot[];
  /** Reference time in ms; faster, fully correct answers earn a speed bonus. */
  parMs: number;
}

export interface LetterCountExercise extends BaseExercise {
  type: 'letters';
  passage: string;
  targets: string[];
}

export type ListeningMode = 'targets' | 'vowels' | 'vowelsConsonants';

export interface ListeningExercise extends BaseExercise {
  type: 'listening';
  mode: ListeningMode;
  sequence: string[];
  intervalMs: number;
  targets: string[];
}

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'diamond' | 'hexagon';
export type ColorName = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'teal';

export interface Shape {
  id: number;
  kind: ShapeKind;
  color: ColorName;
  x: number;
  y: number;
  /** Radius of the bounding circle, in viewBox units. */
  r: number;
  rotation: number;
}

export interface ShapeQuery {
  color?: ColorName;
  kind?: ShapeKind;
}

export interface VisualCountExercise extends BaseExercise {
  type: 'shapes';
  shapes: Shape[];
  width: number;
  height: number;
  queries: ShapeQuery[];
}

export type Exercise = LetterCountExercise | ListeningExercise | VisualCountExercise;

export interface RoundResult {
  exerciseId: string;
  type: ExerciseType;
  level: number;
  given: number[];
  expected: number[];
  /** True only when every slot is right. */
  correct: boolean;
  slotsCorrect: number;
  slotsTotal: number;
  timeMs: number;
  score: number;
}

export interface SessionRecord {
  id: string;
  mode: SessionMode;
  startedAt: number;
  endedAt: number;
  rounds: RoundResult[];
  score: number;
  /** Slot-level accuracy 0..1. */
  accuracy: number;
  durationMs: number;
}

export interface Progress {
  levels: Record<ExerciseType, number>;
  streaks: Record<ExerciseType, number>;
}
