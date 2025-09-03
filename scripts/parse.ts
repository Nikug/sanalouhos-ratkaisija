import fs from "fs";

const allowedChars = "abcdefghijklmnopqrstuvwxyzåäö";
const allowedCharsSet = new Set(allowedChars.split(""));

const loadFile = (filename: string): string[] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(1, -1);
  const words = lines.map((line) => line.split("\t")[0]);

  return words;
};

const writeFile = (filename: string, data: string) => {
  fs.writeFileSync(filename, data);
};

const checkWord = (word: string): boolean => {
  for (let i = 0; i < word.length; i++) {
    if (!allowedCharsSet.has(word[i])) {
      return false;
    }
  }

  return true;
};

const getValidWords = (words: string[]): string[] => {
  const result: string[] = [];

  for (const word of words) {
    if (word.length > 10 || word.length < 3) continue;

    const lowercase = word.toLowerCase();

    if (!checkWord(lowercase)) {
      continue;
    }

    result.push(lowercase);
  }

  return result;
};

const main = () => {
  const words = loadFile("scripts/kotus.txt");
  const validWords = getValidWords(words);
  writeFile("scripts/words.json", JSON.stringify(validWords));
};

main();
