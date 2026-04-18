type Loader = () => Promise<unknown>;

const state = {
  payload: null as unknown | null,
  asOfEpochMs: 0,
  inflight: null as Promise<unknown> | null,
  ttlMs: 15_000,
  loader: null as Loader | null,
};

export function normalizeClampedLimit(input: string | null, defaultLimit: number, maxLimit: number): number {
  const parsed = Number(input ?? defaultLimit);
  if (!Number.isFinite(parsed)) return defaultLimit;
  return Math.max(1, Math.min(maxLimit, Math.floor(parsed)));
}

export function configureMaterializedLatest(input: {
  ttlMs: number;
  loader: Loader;
}) {
  state.ttlMs = input.ttlMs;
  state.loader = input.loader;
}

function isFresh(nowMs: number): boolean {
  return state.payload !== null && nowMs - state.asOfEpochMs < state.ttlMs;
}

function materializeOnce(): Promise<unknown> {
  if (state.inflight) return state.inflight;
  if (!state.loader) {
    return Promise.reject(new Error("materialized latest loader is not configured"));
  }

  state.inflight = state.loader()
    .then((payload) => {
      state.payload = payload;
      state.asOfEpochMs = Date.now();
      return payload;
    })
    .finally(() => {
      state.inflight = null;
    });

  return state.inflight;
}

export async function getMaterializedLatestPayload<T>(): Promise<T> {
  const now = Date.now();
  if (isFresh(now)) return state.payload as T;

  if (state.payload !== null) {
    void materializeOnce().catch(() => undefined);
    return state.payload as T;
  }

  return (await materializeOnce()) as T;
}

export const marketContextMaterializedInternals = {
  resetForTests() {
    state.payload = null;
    state.asOfEpochMs = 0;
    state.inflight = null;
  },
  primeForTests(payload: unknown, asOfEpochMs: number) {
    state.payload = payload;
    state.asOfEpochMs = asOfEpochMs;
    state.inflight = null;
  },
  getStateForTests() {
    return {
      hasPayload: state.payload !== null,
      asOfEpochMs: state.asOfEpochMs,
      hasInflight: state.inflight !== null,
    };
  },
};
