import type { GameState, SolverState } from "./types.ts";

export const printSolution = (solution: SolverState, game: GameState) => {
  for (const word of solution.foundWords) {
    console.log(word.word);
    for (let y = 0; y < game.board.length; y++) {
      let line = "";
      for (let x = 0; x < game.board[0]!.length; x++) {
        const index = word.positions.findIndex((position) => position.x === x && position.y === y);
        if (index >= 0) {
          line += `[${word.word[index]}]`;
        } else {
          line += "[ ]";
        }
      }
      console.log(line);
    }
    console.log();
  }
};
