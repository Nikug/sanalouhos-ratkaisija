/* eslint-disable @eslint-react/no-array-index-key */
import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Button } from "./components/Button";
import words from "./assets/fullWords.json";
import { TrieTree } from "./utils/tree";
import { solve } from "./utils/solver";
import { printSolution } from "./utils/util";
import type { SolverState, Vector2 } from "./types/types";

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
  const [solution, setSolution] = useState<SolverState | null>(null);
  const [boardRef, setBoardRef] = useState<HTMLDivElement | null>(null);

  const tree = useMemo(() => {
    const trieTree = new TrieTree();
    trieTree.insertMany(words);
    return trieTree;
  }, []);

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
      maxWordLength: 50,
    };

    console.time("solve");
    const results = solve(game, tree);
    console.timeEnd("solve");
    if (results.length === 0) return;

    setSolution(results[0]);
    printSolution(results[0], game);
    setSolved(true);
  };

  const getCoordinates = (position: Vector2) => {
    if (boardRef == null) return "";

    const tile = boardRef.querySelector(`[data-x='${position.x}'][data-y='${position.y}']`);
    if (tile == null) return "";

    const parentRect = boardRef.getBoundingClientRect();
    const tileRect = tile.getBoundingClientRect();
    const tileCenterX = tileRect.x + tileRect.width / 2;
    const tileCenterY = tileRect.y + tileRect.height / 2;

    return `${tileCenterX - parentRect.x},${tileCenterY - parentRect.y}`;
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
      {solved && solution && (
        <div
          ref={(element) => setBoardRef(element)}
          className="relative flex flex-col items-center justify-around gap-2"
        >
          {solution.board.map((row, y) => (
            <div key={y} className="flex gap-2">
              {row.map((cell, x) => (
                <div key={`${x}-${y}`} className="tile" data-x={x} data-y={y}>
                  <p className="z-10">{cell}</p>
                </div>
              ))}
            </div>
          ))}
          <svg
            className="pointer-events-none absolute inset-0 opacity-50"
            viewBox={`0 0 ${boardRef?.getBoundingClientRect().width ?? 100} ${boardRef?.getBoundingClientRect().height ?? 100}`}
            height="100%"
            width="100%"
          >
            {solution.foundWords.map((word, index) => (
              <polyline
                key={index}
                points={word.positions.map(getCoordinates).join(" ")}
                style={{
                  fill: "none",
                  strokeWidth: "1rem",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                }}
                className="stroke-gray-500"
              />
            ))}
          </svg>
        </div>
      )}
      {solved && solution && (
        <div className="mt-8 flex gap-2">
          {solution.foundWords.map((word, index) => (
            <p key={index} className="text-lg font-semibold">
              {word.word}
            </p>
          ))}
        </div>
      )}
      <div className="mt-8 flex gap-4">
        <Button variant="secondary" onClick={clearGrid}>
          Tyhjennä
        </Button>
        <Button disabled={!gridIsValid()} onClick={solveGrid}>
          Ratkaise
        </Button>
      </div>
    </div>
  );
};
