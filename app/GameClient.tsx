"use client";

import { useState } from "react";

type Placement = {
  wordIndex: number;
  optionIndex: number;
  char: string;
};

type GameState = {
  guess: string[];
  placements: Placement[];
};

type PlayerState = {
  guesses: number;
  hints: number;
  revealedWordPositions: number[];
  disabledOptionIndices: number[];
  solved: boolean;
};

export type SharedState = Record<string, PlayerState>;

type Props = {
  player: PlayerState;
  options: string;
  word: string;
};

export default function GameClient({ player, options, word }: Props) {
  const [state, setState] = useState<GameState>({
    guess: word
      .split("")
      .map((char, i) => (player.revealedWordPositions.includes(i) ? char : "")),
    placements: [],
  });

  const { guess, placements } = state;

  return (
    <div className="flex items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center justify-start py-6 px-6 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h2 className="max-w-xs text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Guess the word(s).
            {player.solved && (
              <>
                {" "}
                <span className="text-emerald-500">✓</span>
              </>
            )}
          </h2>
        </div>
        <div className="flex flex-col align-center gap-4 text-base font-medium mt-8">
          <div className="flex flex-row gap-4">
            {word
              .slice(0, 7)
              .split("")
              .map((char, i) => (
                <div
                  key={`${char}-${i}`}
                  className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-md flex items-center justify-center"
                >
                  {guess[i] ||
                    (player.revealedWordPositions.includes(i) ? char : "")}
                </div>
              ))}
          </div>
          <div className="flex flex-row gap-4">
            {word
              .slice(7)
              .split("")
              .map((char, i) => (
                <div
                  key={`${char}-${i + 7}`}
                  className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-md flex items-center justify-center"
                >
                  {guess[i + 7] ||
                    (player.revealedWordPositions.includes(i + 7) ? char : "")}
                </div>
              ))}
          </div>
        </div>
        <br />
        <br />
        <div className="flex flex-col align-center gap-4 text-base font-medium">
          <div className="flex flex-row gap-4 flex-wrap">
            {options.split("").map((char, i) => {
              const fromHistory = player.disabledOptionIndices.includes(i);
              const disabled =
                fromHistory ||
                placements.some((p) => p.optionIndex === i) ||
                player.solved;
              return (
                <button
                  key={`${char}-${i}`}
                  className={`w-10 h-10 rounded-md flex items-center justify-center cursor-pointer border ${
                    fromHistory
                      ? "border-emerald-500 dark:border-emerald-400 bg-zinc-100 dark:bg-zinc-900"
                      : "border-transparent bg-zinc-200 dark:bg-zinc-800"
                  } ${disabled ? "opacity-50" : ""}`}
                  disabled={disabled}
                  onClick={() =>
                    setState((prev) => {
                      const nextWordIndex = prev.guess.indexOf("");
                      if (nextWordIndex === -1) return prev;

                      const newGuess = [...prev.guess];
                      newGuess[nextWordIndex] = char;

                      return {
                        guess: newGuess,
                        placements: [
                          ...prev.placements,
                          { wordIndex: nextWordIndex, optionIndex: i, char },
                        ],
                      };
                    })
                  }
                >
                  {char}
                </button>
              );
            })}
          </div>
        </div>
        <br />
        <div>Guesses: {player.guesses}</div>
        <div>Hints: {player.hints}</div>
        <div className="mt-6 flex gap-3">
          <button
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-500 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-400"
            disabled={player.solved}
            onClick={() =>
              setState(() => ({
                guess: word
                  .split("")
                  .map((char, i) =>
                    player.revealedWordPositions.includes(i) ? char : ""
                  ),
                placements: [],
              }))
            }
          >
            Clear board
          </button>
          <button
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold tracking-wide text-white shadow-md transition hover:bg-emerald-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:bg-emerald-400 dark:hover:bg-emerald-500 dark:text-black"
            disabled={player.solved}
            onClick={async () => {
              const currentGuess = guess.join("");
              if (!currentGuess) return;

              try {
                await fetch("/api/guess", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    guess: currentGuess,
                    placements,
                  }),
                });
              } catch {}
              window.location.reload();
            }}
          >
            Guess
          </button>
          <button
            className="inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold tracking-wide text-white shadow-md transition hover:bg-amber-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-black"
            disabled={player.solved}
            onClick={async () => {
              try {
                await fetch("/api/hint", {
                  method: "POST",
                });
              } catch {}
              window.location.reload();
            }}
          >
            Get a hint
          </button>
        </div>
      </main>
    </div>
  );
}
