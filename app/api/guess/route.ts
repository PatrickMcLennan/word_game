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

type Placement = {
  wordIndex: number;
  optionIndex: number;
  char: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as {
    guess?: string;
    placements?: Placement[];
  };
  const guess = body?.guess;
  const placements = body?.placements;

  if (typeof guess !== "string" || !Array.isArray(placements)) {
    return NextResponse.json(
      { error: "Missing or invalid 'guess' or 'placements' in body" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const player = cookieStore.get("player")?.value;

  const filePath = path.join(process.cwd(), "data", "state.json");
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw) as StateFile;
  const word = data.word as string;

  const correct = guess === word;

  if (typeof player === "string" && player in data) {
    const playerState = data[player] as PlayerState;

    const wordChars = word.split("");
    const newWordPositions: number[] = [];
    const newDisabledOptions: number[] = [];

    for (const { wordIndex, optionIndex, char } of placements) {
      if (wordIndex < 0 || wordIndex >= wordChars.length) continue;
      if (char === wordChars[wordIndex]) {
        newWordPositions.push(wordIndex);
        newDisabledOptions.push(optionIndex);
      }
    }

    playerState.guesses += 1;

    if (newWordPositions.length > 0) {
      const mergedWordPositions = new Set([
        ...playerState.revealedWordPositions,
        ...newWordPositions,
      ]);
      playerState.revealedWordPositions = Array.from(mergedWordPositions).sort(
        (a, b) => a - b
      );
    }

    if (newDisabledOptions.length > 0) {
      const mergedDisabled = new Set([
        ...playerState.disabledOptionIndices,
        ...newDisabledOptions,
      ]);
      playerState.disabledOptionIndices = Array.from(mergedDisabled).sort(
        (a, b) => a - b
      );
    }

    playerState.solved =
      playerState.revealedWordPositions.length >= wordChars.length || correct;

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  }

  return NextResponse.json({ correct });
}
