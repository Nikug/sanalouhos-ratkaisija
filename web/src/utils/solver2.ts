import type { TrieTree } from "./tree.ts";
import type { ArrangementState, GameState, SolverState, Vector2, Word } from "../types/types2.ts";

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

const bitPositions = Array.from({ length: 32 }).map((_, i) => 2 ** i);

const vectorHash = (vector: Vector2, gridSize: Vector2) => {
  return bitPositions[vector.x + vector.y * gridSize.x];
};

const outOfBounds = (vector: Vector2, width: number, height: number) => {
  return vector.x < 0 || vector.y < 0 || vector.x >= width || vector.y >= height;
};

const arrangementHash = (arrangement: ArrangementState, width: number, height: number) => {
  const hash = Array.from({ length: width * height }).fill("0");
  for (const word of arrangement.usedWords) {
    for (const position of word.positions) {
      hash[position.x + position.y * width] = "1";
    }
  }

  return hash.join("");
};

const findAllWords = (game: GameState, tree: TrieTree): Word[] => {
  const stack: SolverState[] = [];
  const foundWords: Map<number, Word> = new Map();
  const gridSize: Vector2 = { x: game.width, y: game.height };

  // Initialize stack with all starting positions
  for (let y = 0; y < game.height; y++) {
    for (let x = 0; x < game.width; x++) {
      stack.push({
        currentWord: {
          word: game.board[y]![x]!,
          positions: [{ x, y }],
          positionHash: vectorHash({ x, y }, gridSize),
        },
        foundWords: [],
        board: game.board,
        visited: new Set([vectorHash({ x, y }, gridSize)]),
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
      if (outOfBounds(newPosition, game.width, game.height)) continue;

      const newPositionHash = vectorHash(newPosition, gridSize);
      if (state.visited.has(newPositionHash)) continue;

      const nextCharacter = game.board[newPosition.y]![newPosition.x]!;
      const newWord = state.currentWord.word + nextCharacter;
      if (newWord.length > game.maxWordLength) continue;

      let newVisited: Set<number>;
      const wordType = tree.checkWord(newWord);

      if (wordType === "invalid") {
        continue directionLoop;
      } else if (
        wordType === "partial" ||
        (wordType === "word" && newWord.length < game.minWordLength)
      ) {
        newVisited = new Set(state.visited);
        newVisited.add(newPositionHash);

        const newState: SolverState = {
          board: state.board,
          currentWord: {
            word: newWord,
            positions: [...state.currentWord.positions, newPosition],
            positionHash: state.currentWord.positionHash | newPositionHash,
          },
          foundWords: state.foundWords,
          visited: newVisited,
        };

        stack.push(newState);
      } else if (wordType === "word") {
        newVisited = new Set(state.visited);
        newVisited.add(newPositionHash);

        const wordPositions = [...state.currentWord.positions, newPosition];
        const wordHash = state.currentWord.positionHash | newPositionHash;

        if (foundWords.has(wordHash)) continue;

        foundWords.set(wordHash, {
          word: newWord,
          positions: wordPositions,
          positionHash: wordHash,
        });

        if (newWord.length < game.maxWordLength) {
          const newState: SolverState = {
            board: state.board,
            currentWord: {
              word: newWord,
              positions: [...state.currentWord.positions, newPosition],
              positionHash: state.currentWord.positionHash | newPositionHash,
            },
            foundWords: state.foundWords,
            visited: newVisited,
          };

          stack.push(newState);
        }
      }
    }
  }

  return Array.from(foundWords.values());
};

const findAllValidArrangements = (game: GameState, words: Word[]): ArrangementState[] => {
  const results: ArrangementState[] = [];
  const gridCellCount = game.width * game.height;

  const sortedWords = words.toSorted((a, b) => a.word.length - b.word.length);

  const stack: ArrangementState[] = [];
  stack.push({
    remainingWords: sortedWords,
    usedWords: [],
    usedPositions: 0,
    usedCount: 0,
  });

  const testedArrangments: Map<string, ArrangementState> = new Map();

  while (stack.length > 0) {
    const state = stack.pop()!;

    const possibleWords = state.remainingWords.filter(
      (word) =>
        word.word.length + state.usedCount <= gridCellCount &&
        (word.positionHash & state.usedPositions) === 0,
    );

    for (let i = 0; i < possibleWords.length; i++) {
      const word = possibleWords[i]!;

      const newUsedPositions = state.usedPositions | word.positionHash;

      const newState: ArrangementState = {
        remainingWords: possibleWords.toSpliced(i, 1),
        usedWords: [...state.usedWords, word],
        usedPositions: newUsedPositions,
        usedCount: state.usedCount + word.word.length,
      };

      const key = arrangementHash(newState, game.width, game.height);
      if (testedArrangments.has(key)) continue;
      testedArrangments.set(key, newState);

      if (newState.usedCount === gridCellCount) {
        results.push(newState);
        return results;
      } else {
        stack.push(newState);
      }
    }
  }

  return results;
};

export const solve = (game: GameState, tree: TrieTree): ArrangementState[] => {
  const foundWords = findAllWords(game, tree);
  const arrangements = findAllValidArrangements(game, foundWords);

  return arrangements;
};
