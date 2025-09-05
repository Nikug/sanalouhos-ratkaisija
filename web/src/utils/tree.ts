export interface TreeNode {
  character: string;
  nodes: TreeNode[];
  isWord: boolean;
}

export type WordType = "invalid" | "word" | "partial";

const characters = "abcdefghijklmnopqrstuvwxyzåäö";

export class TrieTree {
  private root: TreeNode = { character: "", nodes: [], isWord: false };

  public insertMany(words: string[]): void {
    for (const word of words) {
      this.insert(word);
    }
  }

  public insert(word: string): void {
    let node = this.root;

    for (let i = 0; i < word.length; i++) {
      const char = word[i]!;
      const index = characters.indexOf(char);
      const isWord = i === word.length - 1;

      if (node.nodes[index]) {
        node = node.nodes[index];
        if (isWord) {
          node.isWord = true;
        }
      } else {
        node.nodes[index] = { character: char, nodes: [], isWord };
        node = node.nodes[index];
      }
    }
  }

  public checkWord(word: string): WordType {
    let node = this.root;

    for (let i = 0; i < word.length; i++) {
      const char = word[i]!;
      const index = characters.indexOf(char);
      if (node.nodes[index]) {
        node = node.nodes[index];
      } else {
        return "invalid";
      }
    }

    return node.isWord ? "word" : "partial";
  }
}
