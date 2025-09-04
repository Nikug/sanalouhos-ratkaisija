import wordsJson from "../scripts/words.json" with { type: "json" };
import { TrieTree } from "./tree.ts";
import { solve } from "./solver.ts";
import { printSolution } from "./util.ts";
import { games } from "./games.ts";

const words: string[] = wordsJson;

const main = () => {
  const game = games[1]!;

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
