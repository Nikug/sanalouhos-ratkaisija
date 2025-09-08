import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Button } from "./components/Button";
import words from "./assets/words.json";
import fullWords from "./assets/fullWords.json";
import { TrieTree } from "./utils/tree";
import { solve } from "./utils/solver";
import type { ArrangementState, GameState } from "./types/types";
import { Solution } from "./components/Solution";

const rows = Array.from({ length: 6 }, (_, i) => i);
const columns = Array.from({ length: 5 }, (_, i) => i);
const emptyGrid = () => Array.from({ length: rows.length * columns.length }, () => "");
const allowedCharacters = "abcdefghijklmnopqrstuvwxyzåäö";

const testGrid = [
  ["r", "ö", "k", "r", "ä"],
  ["ä", "y", "y", "t", "j"],
  ["h", "p", "v", "ä", "t"],
  ["a", "d", "ä", "r", "i"],
  ["y", "k", "k", "h", "e"],
  ["s", "i", "a", "v", "a"],
];

export const App = () => {
  const [grid, setGrid] = useState<string[]>(testGrid.flat(1));
  const [solved, setSolved] = useState(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [solution, setSolution] = useState<ArrangementState | null>(null);
  const [allowLongWords, setAllowLongWords] = useState(false);

  const tree = useMemo(() => {
    const trieTree = new TrieTree();
    if (allowLongWords) {
      trieTree.insertMany(fullWords);
    } else {
      trieTree.insertMany(words);
    }
    return trieTree;
  }, [allowLongWords]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>, row: number, column: number) => {
    const index = row * columns.length + column;
    if (event.target.value.length > 0) {
      const lastCharacter = event.target.value.at(-1)!;
      const lowerCaseCharacter = lastCharacter.toLowerCase();
      if (!allowedCharacters.includes(lowerCaseCharacter)) return;

      setGrid((prev) => prev.with(index, lowerCaseCharacter));

      // Move focus to next input
      if (event.target.nextSibling?.nodeName === "INPUT") {
        const input = event.target.nextSibling as HTMLInputElement;
        input.focus();
      } else if (event.target.parentElement?.nextSibling?.firstChild?.nodeName === "INPUT") {
        const input = event.target.parentElement.nextSibling.firstChild as HTMLInputElement;
        input.focus();
      }
    }
  };

  const handleBackspace = (event: KeyboardEvent<HTMLInputElement>, row: number, column: number) => {
    if (event.key !== "Backspace") return;
    setGrid((prev) => prev.with(row * columns.length + column, ""));

    // Move focus to previous input
    const target = event.currentTarget;
    if (target.previousSibling?.nodeName === "INPUT") {
      const input = target.previousSibling as HTMLInputElement;
      input.focus();
    } else if (target.parentElement?.previousSibling?.lastChild?.nodeName === "INPUT") {
      const input = target.parentElement.previousSibling.lastChild as HTMLInputElement;
      input.focus();
    }
  };

  const clearGrid = () => {
    setGrid(emptyGrid());
    setSolved(false);
  };

  const gridIsValid = () => {
    return grid.every((cell) => cell.length === 1 && allowedCharacters.includes(cell));
  };

  const solveGrid = () => {
    const board: string[][] = [];
    for (let y = 0; y < rows.length; y++) {
      const row: string[] = [];
      for (let x = 0; x < columns.length; x++) {
        row.push(grid[y * columns.length + x]);
      }
      board.push(row);
    }

    const game = {
      board,
      width: columns.length,
      height: rows.length,
      minWordLength: 3,
      maxWordLength: allowLongWords ? 100 : 10,
    };

    const results = solve(game, tree);
    if (results.length === 0) return;

    setGame(game);
    setSolution(results[0]);
    setSolved(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-emerald-50 p-8 text-emerald-800">
      <h1 className="mb-8 text-center text-4xl font-bold">Sanalouhos-ratkaisija</h1>
      {!solved && (
        <div className="flex flex-col items-center justify-around gap-2">
          {rows.map((row) => (
            <div key={row} className="flex gap-2">
              {columns.map((column) => (
                <input
                  type="text"
                  key={`${row}-${column}`}
                  className="tile"
                  value={grid[row * columns.length + column] || ""}
                  onChange={(e) => handleChange(e, row, column)}
                  onKeyDown={(e) => handleBackspace(e, row, column)}
                  onClick={(e) => e.currentTarget.select()}
                />
              ))}
            </div>
          ))}
        </div>
      )}
      {solved && solution && game && <Solution solution={solution} board={game.board} />}
      {!solved && (
        <div className="mt-8 flex gap-2">
          <input
            id="allowLongWords"
            type="checkbox"
            checked={allowLongWords}
            onChange={(e) => setAllowLongWords(e.target.checked)}
          />
          <label htmlFor="allowLongWords" className="text-lg font-semibold">
            Salli yli 10 merkkiä pitkät sanat
          </label>
        </div>
      )}
      <div className="mt-4 flex gap-4">
        <Button variant="secondary" onClick={clearGrid}>
          Tyhjennä
        </Button>
        <Button disabled={!gridIsValid() || solved} onClick={solveGrid}>
          Ratkaise
        </Button>
      </div>
    </div>
  );
};
