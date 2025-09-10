import { useCallback, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Button } from "./components/Button";
import words from "./assets/words.json";
import fullWords from "./assets/fullWords.json";
import type { ArrangementState, GameState } from "./types/types";
import { Solution } from "./components/Solution";
import { LoadingDots } from "./components/LoadingDots";

const rows = Array.from({ length: 6 }, (_, i) => i);
const columns = Array.from({ length: 5 }, (_, i) => i);
const emptyGrid = () => Array.from({ length: rows.length * columns.length }, () => "");
const allowedCharacters = "abcdefghijklmnopqrstuvwxyzåäö";

type SolveState = "init" | "solving" | "solved";

const testGrid = [
  ["u", "p", "i", "o", "e"],
  ["p", "l", "u", "s", "e"],
  ["l", "a", "k", "p", "a"],
  ["k", "a", "t", "b", "i"],
  ["l", "k", "t", "l", "a"],
  ["i", "a", "i", "a", "s"],
];

export const App = () => {
  const [grid, setGrid] = useState<string[]>(testGrid.flat(1));
  const [solveState, setSolveState] = useState<SolveState>("init");
  const [game, setGame] = useState<GameState | null>(null);
  const [solution, setSolution] = useState<ArrangementState | null>(null);
  const [solveStart, setSolveStart] = useState<number>(0);
  const [solveEnd, setSolveEnd] = useState<number>(0);
  const [allowLongWords, setAllowLongWords] = useState(false);

  const solveDuration = solveEnd - solveStart;

  const createWorker = useCallback(() => {
    if (!window.Worker) return;

    const worker = new Worker(new URL("./workers/solverWorker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent<ArrangementState[]>) => {
      const solution = event.data[0];
      if (solution == null) return;

      if (event.data[0]) {
        setSolution(event.data[0]);
        setSolveState("solved");
        setSolveEnd(performance.now());
      } else {
        setSolution(null);
        setSolveState("init");
        setSolveEnd(performance.now());
      }
    };

    return worker;
  }, []);

  const worker = useRef<Worker>(createWorker());

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
    setSolveState("init");
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

    setGame(game);
    setSolveState("solving");
    setSolveStart(performance.now());
    worker.current?.postMessage({ game, words: allowLongWords ? fullWords : words, type: "solve" });
  };

  const cancelSolve = () => {
    worker.current?.terminate();
    worker.current = createWorker();
    setSolveState("init");
  };

  const closeSolution = () => {
    setSolution(null);
    setSolveState("init");
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-emerald-50 p-8 text-emerald-800">
      <h1 className="mb-8 text-center text-4xl font-bold">Sanalouhos-ratkaisija</h1>
      {(solveState === "init" || solveState === "solving") && (
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
      {solveState === "solving" && (
        <div className="mt-4 flex flex-col items-center">
          <p>Ratkaistaan</p>
          <span className="text-lg font-semibold">
            <LoadingDots />
          </span>
        </div>
      )}
      {solveState === "solved" && solution && game && (
        <Solution solution={solution} board={game.board} duration={solveDuration} />
      )}
      {solveState === "init" && (
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
        {solveState === "solving" && (
          <Button variant="secondary" onClick={cancelSolve}>
            Peruuta
          </Button>
        )}
        {solveState === "solved" && (
          <Button variant="secondary" onClick={closeSolution}>
            Sulje ratkaisu
          </Button>
        )}
        {solveState === "init" && (
          <Button variant="secondary" onClick={clearGrid}>
            Tyhjennä
          </Button>
        )}
        {solveState === "init" && (
          <Button disabled={!gridIsValid()} onClick={solveGrid}>
            Ratkaise
          </Button>
        )}
      </div>
    </div>
  );
};
