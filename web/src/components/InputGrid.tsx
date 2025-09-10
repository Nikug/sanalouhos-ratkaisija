import { allowedCharacters, columns, rows } from "@/constants";
import type { ChangeEvent, Dispatch, SetStateAction, KeyboardEvent } from "react";

interface Props {
  grid: string[];
  setGrid: Dispatch<SetStateAction<string[]>>;
}

export const InputGrid = ({ grid, setGrid }: Props) => {
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

  return (
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
  );
};
