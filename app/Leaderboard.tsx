import type { SharedState } from "./GameClient";

type Props = {
  players: SharedState;
};

export default function Leaderboard({ players }: Props) {
  const rows = Object.entries(players)
    .filter(([name]) => name !== "word" && name !== "options")
    .map(([name, data]) => ({
      name,
      ...data,
    }))
    .sort((a, b) => {
      if (a.solved !== b.solved) {
        return a.solved ? -1 : 1;
      }

      const scoreA = a.guesses + a.hints * 3;
      const scoreB = b.guesses + b.hints * 3;
      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }

      if (a.guesses !== b.guesses) {
        return a.guesses - b.guesses;
      }
      if (a.hints !== b.hints) {
        return a.hints - b.hints;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="flex items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center justify-start py-6 px-6 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Leaderboard
          </h2>
        </div>

        <div className="mt-8 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Player
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Guesses
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Hints
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white text-sm dark:divide-zinc-800 dark:bg-zinc-950">
              {rows.map((row, index) => (
                <tr
                  key={row.name}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                >
                  <td className="px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-zinc-800 dark:text-zinc-100">
                    {row.guesses}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-zinc-800 dark:text-zinc-100">
                    {row.hints}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    {row.solved ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Solved
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        In progress
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
