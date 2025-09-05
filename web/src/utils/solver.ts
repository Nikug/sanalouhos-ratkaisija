import type { TrieTree } from "./tree.ts";
import type { Board, GameState, SolverState, Vector2 } from "../types/types.ts";
import Heap from "heap";

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

const findAllEmptyCells = (board: Board, visited: Set<string>): Vector2[] => {
  const result: Vector2[] = [];
  const height = board.length;
  const width = board[0]!.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const position = { x, y };
      if (!visited.has(vectorHash(position))) {
        result.push(position);
      }
    }
  }

  return result;
};

export const solve = (game: GameState, tree: TrieTree): SolverState[] => {
  const heap = new Heap<SolverState>((a, b) => {
    // Prioritize states with overall longer words
    const aValue = a.visited.size / a.foundWords.length;
    const bValue = b.visited.size / b.foundWords.length;
    return bValue - aValue;
  });
  const results: SolverState[] = [];

  for (let y = 0; y < game.height; y++) {
    for (let x = 0; x < game.width; x++) {
      heap.push({
        currentWord: { word: game.board[y]![x]!, positions: [{ x, y }] },
        foundWords: [],
        board: game.board,
        visited: new Set([vectorHash({ x, y })]),
      });
    }
  }

  let iterations = 0;
  stackLoop: while (heap.size() > 0) {
    iterations++;
    const state = heap.pop()!;
    const currentPosition = state.currentWord.positions.at(-1);
    if (!currentPosition) continue;

    directionLoop: for (const direction of directions) {
      const newPosition = {
        x: currentPosition.x + direction.x,
        y: currentPosition.y + direction.y,
      };
      if (outOfBounds(newPosition, game.width, game.height)) continue;

      const newPositionHash = vectorHash(newPosition);
      if (state.visited.has(newPositionHash)) continue;

      const nextCharacter = game.board[newPosition.y]![newPosition.x]!;
      const newWord = state.currentWord.word + nextCharacter;
      if (newWord.length > game.maxWordLength) continue;

      let newVisited: Set<string>;
      const wordType = tree.checkWord(newWord);

      if (wordType === "invalid") {
        continue directionLoop;
      } else if (
        wordType === "partial" ||
        (wordType === "word" && newWord.length < game.minWordLength)
      ) {
        newVisited = new Set(state.visited);
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

        heap.push(newState);
      } else if (wordType === "word") {
        newVisited = new Set(state.visited);
        newVisited.add(newPositionHash);

        // Board is full, last word is valid word
        // Add to results and continue
        if (newVisited.size === game.height * game.width) {
          const wordPositions = [...state.currentWord.positions];
          wordPositions.push(newPosition);

          const newState: SolverState = {
            board: state.board,
            currentWord: {
              word: "",
              positions: [{ x: 0, y: 0 }],
            },
            foundWords: [...state.foundWords, { word: newWord, positions: wordPositions }],
            visited: newVisited,
          };
          results.push(newState);
          break stackLoop;
        }

        // Add states for all remaining empty cells
        const wordPositions = [...state.currentWord.positions];
        wordPositions.push(newPosition);

        const emptyCells = findAllEmptyCells(game.board, newVisited);
        for (const nextStartPosition of emptyCells) {
          const nextStartCharacter = game.board[nextStartPosition.y]![nextStartPosition.x]!;
          const nextStartVisited = new Set(newVisited);
          nextStartVisited.add(vectorHash(nextStartPosition));

          const newState: SolverState = {
            board: state.board,
            currentWord: {
              word: nextStartCharacter,
              positions: [nextStartPosition],
            },
            foundWords: [...state.foundWords, { word: newWord, positions: wordPositions }],
            visited: nextStartVisited,
          };

          heap.push(newState);
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

          heap.push(newState);
        }
      }
    }
  }

  console.log("iterations:", iterations);
  return results;
};
