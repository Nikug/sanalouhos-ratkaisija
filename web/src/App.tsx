import { useState, type ChangeEvent, type KeyboardEvent } from "react";

const rows = Array.from({ length: 6 }, (_, i) => i);
const columns = Array.from({ length: 5 }, (_, i) => i);
const allowedCharacters = "abcdefghijklmnopqrstuvwxyzåäö";

export const App = () => {
  const [gridText, setGridText] = useState<string[]>(
    Array.from({ length: rows.length * columns.length }, () => ""),
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>, row: number, column: number) => {
    const index = row * columns.length + column;
    if (event.target.value.length > 0) {
      const lastCharacter = event.target.value.at(-1)!;
      const lowerCaseCharacter = lastCharacter.toLowerCase();
      if (!allowedCharacters.includes(lowerCaseCharacter)) return;

      setGridText((prev) => prev.with(index, lowerCaseCharacter));

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
    setGridText((prev) => prev.with(row * columns.length + column, ""));

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
    <div className="flex min-h-screen flex-col items-center bg-emerald-50 p-8 text-emerald-800">
      <h1 className="mb-8 text-center text-4xl font-bold">Sanalouhos-ratkaisija</h1>
      <div className="flex flex-col items-center justify-around gap-2">
        {rows.map((row) => (
          <div key={row} className="flex gap-2">
            {columns.map((column) => (
              <input
                type="text"
                key={`${row}-${column}`}
                className="h-16 w-16 rounded-xl border-2 bg-emerald-100 p-2 text-center text-xl font-bold uppercase"
                value={gridText[row * columns.length + column] || ""}
                onChange={(e) => handleChange(e, row, column)}
                onKeyDown={(e) => handleBackspace(e, row, column)}
                onClick={(e) => e.currentTarget.select()}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
