import type { GameState } from "./types.ts";
import wordsJson from "../scripts/words.json" with { type: "json" };
import { TrieTree } from "./tree.ts";
import { solve } from "./solver.ts";
import { printSolution } from "./util.ts";

const words: string[] = wordsJson;

const main = () => {
  const game: GameState = {
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
  };

  // const game: GameState = {
  //   board: [
  //     ["i", "o", "i", "m", "ä"],
  //     ["v", "l", "k", "i", "t"],
  //     ["t", "ö", "l", "k", "h"],
  //     ["ä", "l", "l", "e", "ä"],
  //     ["i", "h", "i", "t", "v"],
  //     ["h", "n", "ö", "t", "y"],
  //   ],
  //   width: 5,
  //   height: 6,
  //   minWordLength: 3,
  //   maxWordLength: 10,
  // };

  // const game: GameState = {
  //   board: [
  //     ["a", "a", "s", "i"],
  //     ["i", "s", "a", "a"],
  //     ["a", "a", "s", "i"],
  //     ["i", "s", "a", "a"],
  //   ],
  //   width: 4,
  //   height: 4,
  //   minWordLength: 3,
  //   maxWordLength: 10,
  // };

  console.time("tree");
  const tree = new TrieTree();
  tree.insertMany(words);
  console.timeEnd("tree");

  console.time("solve");
  const results = solve(game, tree);
  console.timeEnd("solve");

  if (results.length === 0) {
    console.log("No solution found");
    return;
  }

  printSolution(results[0]!, game);
  console.log("words:", results[0]!.foundWords.map((word) => word.word).join(", "));
};

main();
