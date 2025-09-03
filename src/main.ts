import type { GameState } from "./types.ts";
import wordsJson from "../scripts/words.json" with { type: "json" };
import { TrieTree } from "./tree.ts";
import { solve } from "./solver.ts";

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
  };

  const tree = new TrieTree();
  tree.insertMany(words);
  solve(game, tree);
};

main();
