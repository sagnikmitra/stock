-- Drop leftover duplicate unique index after Candle primary key compaction.
DROP INDEX IF EXISTS public."Candle_instrumentId_timeframe_ts_key";
