import type { TrieTree } from "./tree.ts";
import type { GameState, SolverState } from "./types.ts";

export const solve = (game: GameState, tree: TrieTree) => {
  const stack: SolverState[] = [];

  for (let y = 0; y < game.board.length; y++) {
    for (let x = 0; x < game.board[y]!.length; x++) {
      stack.push({
        currentWord: { word: game.board[y]![x]!, positions: [{ x, y }] },
        foundWords: [],
        board: game.board,
      });
    }
  }

  while (stack.length > 0) {
    const state = stack.pop()!;
    console.log(state);
  }
};
