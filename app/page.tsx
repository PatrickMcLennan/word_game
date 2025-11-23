import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GameClient, { SharedState } from "./GameClient";
import Leaderboard from "./Leaderboard";

async function loadPlayers(): Promise<SharedState> {
  const filePath = path.join(process.cwd(), "data", "state.json");
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as SharedState;
}

async function login(formData: FormData) {
  "use server";

  const raw = (formData.get("password") as string).trim().toLowerCase();
  const password = raw.length > 0 ? raw[0]?.toUpperCase() + raw.slice(1) : raw;
  if (!password) {
    redirect("/?error=invalid");
  }

  const players = await loadPlayers();
  if (!players[password]) {
    redirect("/?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set("player", password, {
    httpOnly: true,
    path: "/",
  });

  redirect("/");
}

type HomeProps = {
  searchParams?: { error?: string };
};

export default async function Home({ searchParams }: HomeProps) {
  const players = await loadPlayers();
  const cookieStore = await cookies();
  const playerFromCookie = cookieStore.get("player")?.value;

  const error = searchParams?.error;

  const player = players[playerFromCookie ?? ""];
  const options = (players as unknown as { options?: string }).options ?? "";
  const word = (players as unknown as { word?: string }).word ?? "";

  if (!player) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex w-full max-w-sm flex-col gap-6 rounded-lg bg-white p-8 shadow dark:bg-zinc-950">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Word game
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Enter your password to join. (Password is just your player name.)
            </p>
          </div>

          {error === "invalid" && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/60 dark:bg-red-950/40 dark:text-red-200">
              Invalid password. Try again.
            </div>
          )}

          <form action={login} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-200">
              <span>Password</span>
              <input
                name="password"
                type="password"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Play
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="text-center py-4 pt-8 px-16 text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
        {player.guesses > 0
          ? `Welcome back, ${playerFromCookie}`
          : `Welcome, ${playerFromCookie}`}
      </h1>
      {player.solved && (
        <>
          <Leaderboard players={players} />
          <hr className="w-[80%] max-w-3xl mx-auto my-8 " />
        </>
      )}
      <GameClient player={player} options={options} word={word} />
    </div>
  );
}
