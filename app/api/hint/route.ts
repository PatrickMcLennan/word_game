import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";

type PlayerState = {
  guesses: number;
  hints: number;
  revealedWordPositions: number[];
  disabledOptionIndices: number[];
  solved: boolean;
};

type StateFile = {
  word: string;
  options: string;
  [player: string]: PlayerState | string;
};

export async function POST() {
  const cookieStore = await cookies();
  const playerName = cookieStore.get("player")?.value;

  const filePath = path.join(process.cwd(), "data", "state.json");
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw) as StateFile;

  const word = data.word as string;
  const options = data.options as string;

  if (typeof playerName !== "string" || !(playerName in data)) {
    return NextResponse.json({ hint: null }, { status: 400 });
  }

  const player = data[playerName] as PlayerState;

  const wordChars = word.split("");

  const availablePositions = wordChars
    .map((_, idx) => idx)
    .filter((idx) => !player.revealedWordPositions.includes(idx));

  if (availablePositions.length === 0) {
    return NextResponse.json({ hint: null });
  }

  const wordIndex =
    availablePositions[Math.floor(Math.random() * availablePositions.length)];
  const char = wordChars[wordIndex];

  const availableOptionIndices = options
    .split("")
    .map((c, idx) => ({ c, idx }))
    .filter(
      ({ c, idx }) => c === char && !player.disabledOptionIndices.includes(idx)
    )
    .map(({ idx }) => idx);

  const hintOptionIndex =
    availableOptionIndices.length > 0
      ? availableOptionIndices[
          Math.floor(Math.random() * availableOptionIndices.length)
        ]
      : null;

  const mergedPositions = new Set([...player.revealedWordPositions, wordIndex]);
  player.revealedWordPositions = Array.from(mergedPositions).sort(
    (a, b) => a - b
  );

  if (hintOptionIndex !== null) {
    const mergedDisabled = new Set([
      ...player.disabledOptionIndices,
      hintOptionIndex,
    ]);
    player.disabledOptionIndices = Array.from(mergedDisabled).sort(
      (a, b) => a - b
    );
  }

  player.hints += 1;

  player.solved =
    player.revealedWordPositions.length >= wordChars.length || player.solved;

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");

  return NextResponse.json({
    hint: {
      wordIndex,
      optionIndex: hintOptionIndex,
      char,
    },
  });
}
