export interface TreeNode {
  character: string;
  nodes: TreeNode[];
  isWord: boolean;
}

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

      if (index === -1) {
        console.log(word);
      }

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

  public search(usedChars: string[], remainingChars: string[]): string[] {
    const result: string[] = [];

    const testedChars = new Set<string>();

    for (const char of remainingChars) {
      if (testedChars.has(char)) continue;

      const allowedChars = [...usedChars, char];
      testedChars.add(char);

      this.walk(this.root, [], result, allowedChars, usedChars.length + 1);
    }

    return result;
  }

  private walk(
    node: TreeNode,
    path: string[],
    results: string[],
    allowedChars: string[],
    wordLength: number,
  ): void {
    // Base case
    if (!node || path.length >= wordLength) {
      return;
    }

    const allowedCharIndex = allowedChars.indexOf(node.character);
    if (node.character !== "" && allowedCharIndex === -1) {
      return;
    }

    let newAllowedChars = allowedChars;
    if (allowedCharIndex !== -1) {
      newAllowedChars = allowedChars.toSpliced(allowedCharIndex, 1);
    }

    // Pre recurse
    if (node.character !== "") {
      path.push(node.character);
    }

    if (node.isWord && path.length === wordLength) {
      results.push(path.join(""));
    }

    // Recurse
    for (const child of node.nodes) {
      if (child && newAllowedChars.includes(child.character)) {
        this.walk(child, path, results, newAllowedChars, wordLength);
      }
    }

    // Post recurse
    path.pop();
  }
}
