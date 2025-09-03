export type Board = string[][];

export interface Vector2 {
  x: number;
  y: number;
}

export interface GameState {
  board: Board;
}

export interface Word {
  word: string;
  positions: Vector2[];
}

export interface SolverState {
  board: Board;
  foundWords: Word[];
  currentWord: Word;
}
