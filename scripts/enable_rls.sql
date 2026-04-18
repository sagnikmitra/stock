-- Enable SELECT access for anon role on primary tables for demonstration
ALTER TABLE "Exchange" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select" ON "Exchange";
CREATE POLICY "Public Select" ON "Exchange" FOR SELECT TO anon USING (true);

-- Repeat for other models as needed
ALTER TABLE "Instrument" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select" ON "Instrument";
CREATE POLICY "Public Select" ON "Instrument" FOR SELECT TO anon USING (true);

ALTER TABLE "Strategy" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select" ON "Strategy";
CREATE POLICY "Public Select" ON "Strategy" FOR SELECT TO anon USING (true);
