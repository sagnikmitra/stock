# Indian Stock Market API (0xramm) — Deep Analysis

Date audited: **April 16, 2026**

Repository: `https://github.com/0xramm/Indian-Stock-Market-API`

## What is available

- Public base URL in README: `https://nse-api-ruby.vercel.app`
- Public endpoints:
  - `GET /`
  - `GET /search?q=...`
  - `GET /stock?symbol=...&res=num|val`
  - `GET /stock/list?symbols=...&res=num|val`
  - `GET /symbols`
- Exchange handling:
  - NSE default, `.NS` explicit
  - BSE explicit via `.BO`
- No API key required.

## What is not available

- No documented historical-candle endpoint.
- No FII/DII endpoint.
- No market-breadth endpoint.
- No index time-series endpoint.

Manual endpoint probes (April 16, 2026) to common history/candle paths return `404`.

## Source-code audit result

- The public GitHub repository currently contains only `Readme.md`.
- No backend implementation files are published in the repository.
- This means behavior cannot be fully audited by source code and must be treated as a black-box hosted API.

## Practical suitability for this platform

Strong fit:

- Quote fallback (`/stock/list`) for watchlist and screener surfaces.
- Basic symbol lookup (`/symbols`, `/search`) for convenience.

Not sufficient alone for end-to-end platform:

- This platform requires historical `D1` candles for indicators, screeners, strategies, and backtests.
- Since this API does not expose historical candle series, it cannot be sole provider for full deterministic strategy/backtest flows.

## Integration decision implemented

- Integrated as **quote/search fallback provider** only.
- Capability flags intentionally set to:
  - `quotes: true`
  - `eodCandles: false`
  - `fiiDii: false`
  - `marketBreadth: false`
- Existing NSE/TwelveData/FMP candle/context providers remain primary for historical and context ingestion.

## Risk notes

- Single hosted endpoint dependency (`vercel.app`) with no published backend source.
- Potential schema drift without versioned contract.
- Should be treated as best-effort fallback; not authoritative source of record.

