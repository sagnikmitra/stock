-- Compact Candle storage: use natural candle key as primary key and remove redundant index.
-- Candle has no child tables referencing its surrogate id; queries/upserts already use (instrumentId, timeframe, ts).
ALTER TABLE public."Candle" DROP CONSTRAINT IF EXISTS "Candle_pkey";
ALTER TABLE public."Candle" DROP COLUMN IF EXISTS id;
ALTER TABLE public."Candle" DROP CONSTRAINT IF EXISTS "Candle_instrumentId_timeframe_ts_key";
ALTER TABLE public."Candle" ADD CONSTRAINT "Candle_pkey" PRIMARY KEY ("instrumentId", timeframe, ts);
DROP INDEX IF EXISTS public."Candle_instrumentId_ts_idx";
