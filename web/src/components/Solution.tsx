/* eslint-disable @eslint-react/no-array-index-key */
import type { ArrangementState, Board, Vector2 } from "@/types/types";
import clsx from "clsx";
import { useState } from "react";

interface Props {
  solution: ArrangementState;
  board: Board;
}

export const Solution = ({ solution, board }: Props) => {
  const [boardRef, setBoardRef] = useState<HTMLDivElement | null>(null);
  const [activeWord, setActiveWord] = useState<string | null>(null);

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
    <>
      <div
        ref={(element) => setBoardRef(element)}
        className="relative flex flex-col items-center justify-around gap-2"
      >
        {board.map((row, y) => (
          <div key={y} className="flex gap-2">
            {row.map((cell, x) => (
              <div key={`${x}-${y}`} className="tile" data-x={x} data-y={y}>
                <p className="z-10">{cell}</p>
              </div>
            ))}
          </div>
        ))}
        <svg
          className="pointer-events-none absolute inset-0"
          viewBox={`0 0 ${boardRef?.getBoundingClientRect().width ?? 100} ${boardRef?.getBoundingClientRect().height ?? 100}`}
          height="100%"
          width="100%"
        >
          {solution.usedWords.map((word, index) => (
            <polyline
              key={index}
              points={word.positions.map(getCoordinates).join(" ")}
              style={{
                fill: "none",
                strokeWidth: "1rem",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
              className={
                activeWord === word.word
                  ? "stroke-emerald-800 opacity-50"
                  : "stroke-gray-600 opacity-30"
              }
            />
          ))}
        </svg>
      </div>
      <div className="mt-8 mb-4 flex gap-2">
        {solution.usedWords.map((word, index) => (
          <p
            key={index}
            className={clsx("cursor-pointer text-lg font-semibold select-none", {
              "text-emerald-700": activeWord === word.word,
            })}
            onClick={() => setActiveWord((prev) => (prev === word.word ? null : word.word))}
          >
            {word.word}
          </p>
        ))}
      </div>
    </>
  );
};
