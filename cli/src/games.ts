import type { GameState } from "./types.ts";

export const games: GameState[] = [
  {
    board: [
      ["u", "p", "i", "o", "e"],
      ["p", "l", "u", "s", "e"],
      ["l", "a", "k", "p", "a"],
      ["k", "a", "t", "b", "i"],
      ["l", "k", "t", "l", "a"],
      ["i", "a", "i", "a", "s"],
    ],
    width: 5,
    height: 6,
    minWordLength: 3,
    maxWordLength: 10,
  },
  {
    board: [
      ["a", "k", "a", "r", "i"],
      ["l", "a", "t", "k", "p"],
      ["n", "i", "r", "p", "u"],
      ["e", "i", "a", "n", "l"],
      ["n", "ä", "i", "t", "u"],
      ["i", "v", "l", "s", "o"],
    ],
    width: 5,
    height: 6,
    minWordLength: 3,
    maxWordLength: 10,
  },
  {
    board: [
      ["i", "o", "i", "m", "ä"],
      ["v", "l", "k", "i", "t"],
      ["t", "ö", "l", "k", "h"],
      ["ä", "l", "l", "e", "ä"],
      ["i", "h", "i", "t", "v"],
      ["h", "n", "ö", "t", "y"],
    ],
    width: 5,
    height: 6,
    minWordLength: 3,
    maxWordLength: 10,
  },
  {
    board: [
      ["a", "a", "s", "i"],
      ["i", "s", "a", "a"],
      ["a", "a", "s", "i"],
      ["i", "s", "a", "a"],
    ],
    width: 4,
    height: 4,
    minWordLength: 3,
    maxWordLength: 10,
  },
];
