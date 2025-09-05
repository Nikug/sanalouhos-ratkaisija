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
  positionHashes: string[];
}

export interface SolverState {
  board: Board;
  foundWords: Word[];
  currentWord: Word;
  visited: Set<string>;
}

export interface ArrangementState {
  remainingWords: Word[];
  usedWords: Word[];
  usedPositions: Set<string>;
}
