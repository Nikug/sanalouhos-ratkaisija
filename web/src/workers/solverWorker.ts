import type { GameState } from "@/types/types";
import { solve } from "@/utils/solver";
import { TrieTree } from "@/utils/tree";

export interface SolverWorkerMessage {
  game: GameState;
  words: string[];
}

self.onmessage = (event: MessageEvent<SolverWorkerMessage>) => {
  const { game, words } = event.data;

  const tree = new TrieTree();
  tree.insertMany(words);

  const results = solve(game, tree);
  self.postMessage(results);
};

export {};
