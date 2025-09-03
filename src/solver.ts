import type { TrieTree } from "./tree.ts";
import type { Board, GameState, SolverState, Vector2 } from "./types.ts";

const directions: Vector2[] = [
  { x: 0, y: -1 }, // up,
  { x: 1, y: -1 }, // up right,
  { x: 1, y: 0 }, // right
  { x: 1, y: 1 }, //down right
  { x: 0, y: 1 }, //down
  { x: -1, y: 1 }, //down left
  { x: -1, y: 0 }, //left
  { x: -1, y: -1 }, //up left
];

const vectorHash = (vector: Vector2) => {
  return `${vector.x},${vector.y}`;
};

const outOfBounds = (vector: Vector2, width: number, height: number) => {
  return vector.x < 0 || vector.y < 0 || vector.x >= width || vector.y >= height;
};

const findEmptyCell = (board: Board, visited: Set<String>): Vector2 | null => {
  const height = board.length;
  const width = board[0]!.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!visited.has(vectorHash({ x, y }))) {
        return { x, y };
      }
    }
  }

  return null;
};

export const solve = (game: GameState, tree: TrieTree): SolverState[] => {
  const stack: SolverState[] = [];
  const results: SolverState[] = [];

  for (let y = 0; y < game.height; y++) {
    for (let x = 0; x < game.width; x++) {
      stack.push({
        currentWord: { word: game.board[y]![x]!, positions: [{ x, y }] },
        foundWords: [],
        board: game.board,
        visited: new Set([vectorHash({ x, y })]),
      });
    }
  }

  while (stack.length > 0) {
    const state = stack.pop()!;
    const currentPosition = state.currentWord.positions.at(-1);
    if (!currentPosition) continue;

    directionLoop: for (const direction of directions) {
      const newPosition = {
        x: currentPosition.x + direction.x,
        y: currentPosition.y + direction.y,
      };
      const newPositionHash = vectorHash(newPosition);

      if (outOfBounds(newPosition, game.width, game.height) || state.visited.has(newPositionHash))
        continue;

      const nextCharacter = game.board[newPosition.y]![newPosition.x]!;
      const newWord = state.currentWord.word + nextCharacter;

      const wordType = tree.checkWord(newWord);
      switch (wordType) {
        case "invalid":
          continue directionLoop;
        case "word":
          if (newWord.length < game.minWordLength) {
            // Same handling as in partial word
            const newVisited = new Set(state.visited);
            newVisited.add(newPositionHash);

            // Board is full, but last word is partial, continue
            if (newVisited.size === game.height * game.width) {
              continue directionLoop;
            }

            const newState: SolverState = {
              board: state.board,
              currentWord: {
                word: newWord,
                positions: [...state.currentWord.positions, newPosition],
              },
              foundWords: state.foundWords,
              visited: newVisited,
            };

            stack.push(newState);
            continue directionLoop;
          }

          const newVisited = new Set(state.visited);
          newVisited.add(newPositionHash);

          // Board is full, last word is valid word
          if (newVisited.size === game.height * game.width) {
            results.push(state);
            continue directionLoop;
          }

          // We found word, but it is not max length
          // Continue building this word to be longer
          if (newWord.length < game.maxWordLength) {
            const newState: SolverState = {
              board: state.board,
              currentWord: {
                word: newWord,
                positions: [...state.currentWord.positions, newPosition],
              },
              foundWords: state.foundWords,
              visited: newVisited,
            };

            stack.push(newState);
          }

          // Add state where we start looking at the next empty cell
          const nextStartPosition = findEmptyCell(game.board, newVisited);
          if (!nextStartPosition) {
            throw "Could not find next start position";
          }
          const nextStartCharacter = game.board[nextStartPosition.y]![nextStartPosition.x]!;
          if (!nextStartCharacter) {
            throw "Could not get next character";
          }

          const wordPositions = [...state.currentWord.positions];
          wordPositions.push(newPosition);

          const newState: SolverState = {
            board: state.board,
            currentWord: {
              word: nextStartCharacter,
              positions: [nextStartPosition],
            },
            foundWords: [...state.foundWords, { word: newWord, positions: wordPositions }],
            visited: newVisited,
          };

          stack.push(newState);

          break;
        case "partial":
          if (newWord.length < game.maxWordLength) {
            const newVisited = new Set(state.visited);
            newVisited.add(newPositionHash);

            // Board is full, but last word is partial, continue
            if (newVisited.size === game.height * game.width) {
              continue directionLoop;
            }

            const newState: SolverState = {
              board: state.board,
              currentWord: {
                word: newWord,
                positions: [...state.currentWord.positions, newPosition],
              },
              foundWords: state.foundWords,
              visited: newVisited,
            };

            stack.push(newState);
          }
          break;
      }
    }
  }

  return results;
};
