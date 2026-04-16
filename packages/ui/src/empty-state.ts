/** Empty state display config */
export interface EmptyState {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export const EMPTY_STATES = {
  strategies: {
    title: "No strategies found",
    description: "Seed the database to load course-derived strategies.",
  },
  screeners: {
    title: "No screeners configured",
    description: "Run the seed to create screener definitions.",
  },
  digests: {
    title: "No digests yet",
    description: "Run the pre-market cron to generate your first digest.",
  },
  watchlists: {
    title: "No watchlists",
    description: "Create a watchlist to start tracking stocks.",
    actionLabel: "Create Watchlist",
    actionHref: "/watchlists/new",
  },
  backtests: {
    title: "No backtests",
    description: "Run a backtest from the strategy detail page.",
  },
} as const;
