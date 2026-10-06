export type Board = string[][];

export interface Vector2 {
  x: number;
  y: number;
}

export interface GameState {
  board: Board;
  width: number;
  height: number;
  minWordLength: number;
  maxWordLength: number;
}

export interface Word {
  word: string;
  positions: Vector2[];
  positionHash: number;
}

export interface SolverState {
  board: Board;
  foundWords: Word[];
  currentWord: Word;
  visited: Set<number>;
}

export interface ArrangementState {
  remainingWords: Word[];
  usedWords: Word[];
  usedPositions: number;
  usedCount: number;
}
