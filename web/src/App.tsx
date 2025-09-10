import { useCallback, useState } from "react";
import { Button } from "./components/Button";
import words from "./assets/words.json";
import fullWords from "./assets/fullWords.json";
import type { ArrangementState, GameState } from "./types/types";
import { Solution } from "./components/Solution";
import { LoadingDots } from "./components/LoadingDots";
import { InputGrid } from "./components/InputGrid";
import { allowedCharacters, columns, emptyGrid, rows } from "./constants";

type SolveState = "init" | "solving" | "solved";

export const App = () => {
  const [grid, setGrid] = useState<string[]>(emptyGrid);
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

  const [worker, setWorker] = useState<Worker | undefined>(createWorker);

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
    worker?.postMessage({ game, words: allowLongWords ? fullWords : words, type: "solve" });
  };

  const cancelSolve = () => {
    worker?.terminate();
    setWorker(createWorker());
    setSolveState("init");
  };

  const closeSolution = () => {
    setSolution(null);
    setSolveState("init");
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-emerald-50 p-8 text-emerald-800">
      <h1 className="text-center text-4xl font-bold">Sanalouhos-ratkaisija</h1>
      <div className="mb-8 flex gap-1 text-sm">
        <a className="underline" href="https://github.com/Nikug/sanalouhos-ratkaisija">
          Github
        </a>
        <a className="underline" href="https://www.hs.fi/pelit/art-2000010229611.html">
          Sanalouhos
        </a>
        <a className="underline" href="https://www.kielitoimistonsanakirja.fi/#/">
          Kielitoimiston sanakirja
        </a>
      </div>

      {(solveState === "init" || solveState === "solving") && (
        <InputGrid grid={grid} setGrid={setGrid} />
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
