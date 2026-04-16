# WithArin Stock Market 29th Batch — Session 5 Extended Summary

Source: `witharin-session5-transcript-proper.md` (local Whisper translate pass over Session 5 Vimeo stream, lesson 2195783, video id 1176092093). Audio is code-switched Bengali/English; transcript is approximate. Summary reconstructs the teaching arc from clearly identifiable topic anchors.

## Session format and context

- Batch: Stock Market Weekend 29th Batch, Session 5 of the class-recording track.
- Length: ~4h 05m. First ~15 minutes are pre-class silence / chat-box warm-up; core teaching begins around 00:27:00 with "Good evening everyone, this is our fifth session".
- Framing: Session 5 is positioned as the **start of the strategy block**. Earlier sessions covered history, chart/candlestick patterns, support/resistance, order blocks, supply/demand zones. Session 5 shifts from "what the chart shows" to "how to actually build a repeatable trading system" around it.

## Teaching arc

### 1. What a "trading system" is

Instructor opens by telling students a trader needs a **complete trading system**, not a single setup. He enumerates its pieces repeatedly throughout the class:

1. **Stock selection** — which stock to trade at all.
2. **Strategy** — entry trigger, stop-loss placement, target placement.
3. **Position sizing** — how many shares.
4. **Risk management** — max loss per trade and portfolio-level caps.
5. **Trailing / exits** — how to ride winners.
6. **Psychology / discipline** — consistency and patience.

He stresses these are multiplicative: any one of them missing and the trader cannot be consistently profitable.

### 2. High-probability trade ingredients

The next block connects the prior sessions to the system:

- Stock selection feeds into pattern reads: **candlestick patterns, chart patterns, trendlines, support/resistance, divergence, Fibonacci**.
- Stacking multiple confirmations from these tools is what he calls a "high-probability trade" — not a guarantee, but a setup where several independent reads agree.
- Key reminder: if you cannot accept losses, the stock market is not for you. Losing trades are a cost of doing business; the system is designed to make losers small and winners larger.

### 3. RSI as the first indicator

A long teaching block is devoted to RSI (Relative Strength Index):

- How to add it in TradingView: Indicator → search RSI → Relative Strength Index.
- RSI is an **oscillator**, values 0–100, used like a pendulum.
- Levels that matter: high readings (roughly 70+) = overbought / "high momentum uptrend"; low readings (roughly 30 or below) = oversold / "high momentum downtrend".
- He demonstrates customising the RSI style and talks about adding a **moving average on RSI** and an **upper / middle / lower band** overlay to read momentum more cleanly.
- Students are asked to name stocks from the chat box and the class walks through what RSI looks like on those names (BDL, IOC mentioned as examples).
- He positions RSI as an entry filter, not a standalone trigger: pair RSI reads with trend and price-action confirmation.
- Side note: technical analysis is a deep field (he references the CMT — Chartered Market Technician program) and tells students he only wants them to know what each indicator *does*, not to chase certifications.

### 4. Bollinger Bands and indicator discipline

Bollinger Bands are introduced briefly as the next standard-issue indicator. The broader point is repeated: a student does not need every indicator — they need to know **what each indicator measures** and pick a small stable set for their own system.

### 5. Trendlines, support / resistance recap

Before the risk block, he revisits trendlines and S/R as structural anchors:

- Connect swing points to draw a trendline.
- Good trades happen near a trendline / S/R reaction, not in the middle of nowhere.
- The same logic carries from session 4: think in zones and reactions, not exact ticks.

### 6. Fibonacci retracement

A focused mini-lesson on Fibonacci:

- Quick origin note: Fibonacci series 0, 1, 1, 2, 3, 5, 8 … — he tells students to google the series if unfamiliar.
- Key retracement ratios called out: **0.236 (≈24%), 0.382, 0.5, 0.618 (≈62%)**.
- How to apply: pick a swing low and swing high, drag the Fibonacci tool between them, use the retracement levels as potential pullback / entry zones.
- Framing: Fibonacci is another confirmation tool — strongest when it lines up with prior S/R or a trendline.

### 7. Stop-loss and target — risk / reward ratio

He drills risk-reward repeatedly:

- Every trade must have an **entry, stop-loss and target defined before you click buy**. Targets are non-negotiable in the system.
- Preferred risk-reward: **3 : 1** (target distance three times the stop-loss distance). He also discusses 1 : 1 as a baseline for tight setups.
- Example walked on screen: entry ~600, stop-loss ~500 → risk = 100 → target = 900 (3R above entry), demonstrating that the target is mechanical, not a feeling.

### 8. Position sizing formula (core of the session)

This is the technical centrepiece of session 5. The formula he drills into students:

```
Risk per trade   = 2% of portfolio
Quantity         = (0.02 × Portfolio Size) / (Entry − Stop Loss)
```

Walkthrough of the example:

- Portfolio = ₹10,00,000 (10 lakh).
- Max risk per trade = 2% = ₹20,000.
- Entry = 100, Stop-loss = 90 → per-share risk = ₹10.
- Quantity = 20,000 / 10 = **2,000 shares**.
- This caps the worst-case loss on that trade to ₹20,000 no matter what the ticker does.

Key rules around this:

- "Risk is equal to strictly 2% of portfolio" — he uses the word *strictly*.
- The formula drives quantity, not the other way round. You do not decide "I want 500 shares", you decide the risk budget and let the formula pick quantity.
- Investing vs trading framing: **investing is a game of small quantity + bigger profits; trading is a game of bigger quantity + smaller profits**. Position sizing rules differ between the two.
- He also touches on the mixed case: a retail participant running a mixed portfolio of swing trades, intraday trades and longer-term investments, and why each slice needs its own sizing rules.

### 9. Excel template walkthrough

He opens his trading-plan Excel sheet and wires the formula in live:

- Input cells: Portfolio Size, Entry Price, Stop-Loss, Target (or R-multiple).
- Output cells: Maximum Risk Per Trade (auto from 2%), Quantity (auto from the formula), Risk-Reward (auto), Expected P&L at target.
- Workflow he recommends: before each real trade, put Stock, Strategy, Entry, Stop-Loss into the sheet, let it compute size and target, then place the order — never skip this step.
- He stresses using this sheet as a **pre-trade checklist**. A trade that does not pass the sheet doesn't get placed.

### 10. Annualised return reality check

Using a worked example, he contrasts disciplined trading returns against bank yields:

- Example number cited: ~390% annualised in one sample period (used as a framing number, not a promise).
- Contrast with FD / banking yields around ~4–6%.
- The point of the comparison is *why* position sizing and risk control matter — compounding at high CAGR only survives if drawdowns stay small, which only happens if every trade is sized correctly.

### 11. Discipline / respect block (middle of the class)

A long, fairly emotional block about how students should engage with the course:

- Students are told: if you miss a live class, it is **your responsibility** to watch the recording, rewind, pause, replay. Network issues, platform issues, etc., are not excuses.
- He reframes the class itself as "we are all privileged to be doing this, treat it like a business you owe effort to".
- The meta-lesson: **soft skills (discipline, ownership, respect) outweigh technical skills** long-term. A mediocre system executed with discipline beats a brilliant system executed carelessly.
- Tone is coach-to-team, not lecturer-to-audience.

### 12. Student Q&A interleaved

Across the session, students ask questions that get used as teaching moments — examples:

- A question on how exactly to calculate position sizing: answered by re-deriving the 2% formula from scratch.
- A question on RSI strategy specifics: deferred to a later class, but used to re-state that RSI alone is not a trading system.
- A question from Shudeep Chakraborty (name approximate) on stock-specific entries: answered with the same general rule — check RSI, check trend, check S/R, only then enter.
- Scope-control: when questions veer into broker / platform / account issues, he defers them to customer service rather than derailing.

### 13. Closing framing

The session ends on two repeated messages:

- **Build yourself like a business** — networking, consultation, staggered steps (step 1, step 2, step 3 …). Trading skill is one component inside a broader self-upgrade.
- **Energy flows where focus goes** — if your attention is on execution discipline, results follow; if it is on tips and noise, they do not.
- Standard sign-off: "good night, all the best".

## Main takeaways a student should write down

1. A **trading system = stock selection + strategy + position sizing + risk management + trailing + psychology**. All six, not one.
2. **RSI** is an oscillator (0–100). Use it with trend and structure, not alone. Learn overbought/oversold, divergences, and moving-average-on-RSI reads.
3. **Fibonacci retracement** levels: 0.236, 0.382, 0.5, 0.618. Drawn between swing low and swing high. Use as confluence with S/R, not as standalone triggers.
4. **Risk per trade is strictly 2% of portfolio.**
5. **Position sizing formula:** `Quantity = (0.02 × Portfolio) / (Entry − Stop Loss)`. Example: 10L portfolio, entry 100, SL 90 → 2000 shares, max loss ₹20,000.
6. Every trade must have **entry, stop-loss and target defined before execution**, with a minimum target risk-reward of 3:1 (1:1 as a fallback for tight setups).
7. **Investing** is small quantity + bigger profits. **Trading** is bigger quantity + smaller profits. Sizing rules differ.
8. Maintain an **Excel pre-trade sheet** that takes portfolio size, entry and stop-loss and auto-computes quantity, risk-reward and target. Never skip it.
9. Watch the recording if you miss live, own your problems, soft skills beat technical skills long-term.
10. Build yourself in **staggered steps**; compounding skill is the same shape as compounding capital.

## Caveats

- Underlying audio is code-switched Bengali/English. Whisper was run in `translate` mode, so the transcript is approximate English. Student names, exact Q&A phrasing and some numeric examples (currency units especially) are paraphrased or mistranscribed.
- A few numeric-looking artefacts in the raw transcript (long runs of zeros, etc.) are translation hallucinations on mixed-language audio and were ignored when reconstructing the content.
- For exact timestamps and literal quotes, refer to the raw SRT at `/private/tmp/witharin-s5/session5_v1.srt` on the transcription host rather than this markdown.
