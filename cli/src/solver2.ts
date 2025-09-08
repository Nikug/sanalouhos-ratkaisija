import type { TrieTree } from "./tree.ts";
import type { ArrangementState, GameState, SolverState, Vector2, Word } from "./types.ts";

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

const arrangementHash = (arrangement: ArrangementState, width: number, height: number) => {
  let hash = Array.from({ length: width * height }).fill("0");
  for (const word of arrangement.usedWords) {
    for (const position of word.positions) {
      hash[position.x + position.y * width] = "1";
    }
  }

  return hash.join("");
};

const findAllWords = (game: GameState, tree: TrieTree): Word[] => {
  const stack: SolverState[] = [];
  const foundWords: Map<string, Word> = new Map();

  // Initialize stack with all starting positions
  for (let y = 0; y < game.height; y++) {
    for (let x = 0; x < game.width; x++) {
      stack.push({
        currentWord: {
          word: game.board[y]![x]!,
          positions: [{ x, y }],
          positionHashes: [vectorHash({ x, y })],
        },
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

        const newState: SolverState = {
          board: state.board,
          currentWord: {
            word: newWord,
            positions: [...state.currentWord.positions, newPosition],
            positionHashes: [...state.currentWord.positionHashes, newPositionHash],
          },
          foundWords: state.foundWords,
          visited: newVisited,
        };

        stack.push(newState);
      } else if (wordType === "word") {
        newVisited = new Set(state.visited);
        newVisited.add(newPositionHash);

        const wordPositions = [...state.currentWord.positions, newPosition];
        const wordPositionHashes = [...state.currentWord.positionHashes, newPositionHash];

        const wordHash = wordPositionHashes.join(",");
        if (foundWords.has(wordHash)) continue;

        foundWords.set(wordHash, {
          word: newWord,
          positions: wordPositions,
          positionHashes: wordPositionHashes,
        });

        if (newWord.length < game.maxWordLength) {
          const newState: SolverState = {
            board: state.board,
            currentWord: {
              word: newWord,
              positions: [...state.currentWord.positions, newPosition],
              positionHashes: [...state.currentWord.positionHashes, newPositionHash],
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

  const sortedWords = words.toSorted((a, b) => a.word.length - b.word.length);

  const stack: ArrangementState[] = [];
  stack.push({
    remainingWords: sortedWords,
    usedWords: [],
    usedPositions: new Set(),
  });

  const testedArrangments: Map<string, ArrangementState> = new Map();

  while (stack.length > 0) {
    const state = stack.pop()!;

    const possibleWords = state.remainingWords.filter(
      (word) =>
        word.word.length + state.usedPositions.size <= game.width * game.height &&
        word.positionHashes.every((hash) => !state.usedPositions.has(hash)),
    );

    for (let i = 0; i < possibleWords.length; i++) {
      const word = { ...possibleWords[i]! };

      const newUsedPositions = new Set(state.usedPositions);
      word.positionHashes.forEach((hash) => newUsedPositions.add(hash));

      const newState: ArrangementState = {
        remainingWords: possibleWords.toSpliced(i, 1),
        usedWords: [...state.usedWords, word],
        usedPositions: newUsedPositions,
      };

      const key = arrangementHash(newState, game.width, game.height);
      if (testedArrangments.has(key)) continue;
      testedArrangments.set(key, newState);

      if (newUsedPositions.size === game.height * game.width) {
        results.push(newState);
        return results;
      } else {
        stack.push(newState);
      }
    }
  }

  return results;
};

export const solve = (game: GameState, tree: TrieTree): SolverState[] => {
  console.time("find words");
  const foundWords = findAllWords(game, tree);
  console.timeEnd("find words");
  console.log("foundWords", foundWords.length);

  console.time("find arrangements");
  const arrangements = findAllValidArrangements(game, foundWords);
  console.timeEnd("find arrangements");
  console.log("arrangements:", arrangements[0]?.usedWords.map((word) => word.word).join(", "));

  if (!arrangements[0]) return [];

  return [
    {
      board: game.board,
      foundWords: arrangements[0]!.usedWords,
      currentWord: {
        word: "",
        positions: [{ x: 0, y: 0 }],
        positionHashes: [],
      },
      visited: new Set(),
    },
  ];
};
