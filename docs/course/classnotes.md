---
title: "Stock Market Notes — Master Ultra Combined Notes"
version: "v2_extended_current_conversation_merge"
base_file: "notes-extended(1).md"
merge_scope:
  - handwritten PDF reconstruction already present in base file
  - current conversation uploaded text files
  - current conversation uploaded image slide
  - referenced session-level markdown context
status: "supersedes notes-extended(1) for study use"
---

# Stock Market Notes — Master Ultra Combined Notes

> This file extends `notes-extended(1).md` into a larger combined study + execution notebook.
> The original reconstruction is preserved below, and new merged sections are added afterward.

---
title: "Stock Market Notes — Master Unabridged Reconstruction"
document_type: "evidence_linked_markdown_reconstruction"
primary_source: "Stock Market Notes.pdf"
secondary_sources:
  - "witharin-lesson-2043795-extended-summary.md"
  - "witharin-lesson-2043795-transcript-proper.md"
  - "witharin-session4-extended-summary.md"
  - "witharin-session4-transcript-proper.md"
  - "witharin-session5-extended-summary.md"
  - "witharin-session5-transcript-proper.md"
  - "witharin-session6-extended-summary.md"
  - "witharin-session6-transcript-proper.md"
  - "witharin-session7-extended-summary.md"
  - "witharin-session7-transcript-proper.md"
  - "witharin-session8-extended-summary.md"
  - "witharin-session8-transcript-proper.md"
  - "witharin-session9-extended-summary.md"
  - "witharin-session9-transcript-proper.md"
reconstruction_mode: "forensic + normalized + evidence-linked + machine-readable"
intended_use:
  - "deep study"
  - "curriculum reconstruction"
  - "LLM ingestion"
  - "Codex / Claude Code context file"
warning: "This is a contextual digital reconstruction, not a raw literal OCR truth dump. Ambiguities are preserved and resolved explicitly."
---

# Stock Market Notes — Master Unabridged Reconstruction

## Purpose of this file

This is the **single, merged, hyper-detailed master markdown** version of the handwritten PDF reconstruction.

It is designed to be:

- **page-faithful enough** to preserve the notebook logic,
- **clean enough** to study from,
- **explicit enough** about ambiguities,
- **detailed enough** to reflect all relevant uploaded markdown context,
- and **structured enough** to be directly usable by Codex, Claude Code, Cursor, or any retrieval / knowledge-base workflow.

This file merges four layers into one deliverable:

1. **The handwritten-page reconstruction** from the PDF.
2. **Normalized conceptual explanation** so the shorthand becomes readable.
3. **Source pointers** showing which uploaded markdown files best support each section.
4. **Machine-readable strategy schemas** for downstream coding/knowledge use.

## Reconstruction contract

This file follows a strict honesty rule:

- If a note is clearly written and supported elsewhere, it is treated as **high confidence**.
- If a note is visible but compressed or partly unclear, it is treated as **medium confidence**.
- If a note conflicts with cleaner summary material, the conflict is **kept in the file**, not hidden.
- Where the notebook is strong and the external markdown is weak, the notebook stays primary.
- Where the notebook is shorthand and the summaries are much clearer, the summaries are used to normalize the meaning.

## Full source inventory

- `Stock Market Notes.pdf` — Primary handwritten source. 16 pages. Contains the original note skeleton, class labels, formulas, rough thresholds, and diagrams.
- `witharin-lesson-2043795-extended-summary.md` — Orientation / introductory webinar context. Useful mainly for broad stock-market basics, inflation, compounding, and course framing. Not the strongest match for the handwritten pages, but relevant to the ecosystem framing.
- `witharin-lesson-2043795-transcript-proper.md` — Rawer companion to the introductory webinar. Use only when the summary is too compressed.
- `witharin-session4-extended-summary.md` — Best corroboration for Page 6–8 themes: support/resistance, order blocks, supply/demand, patience, liquidity hunts, and TradingView discipline.
- `witharin-session4-transcript-proper.md` — Lower-level support for Session 4 when you need rough literal phrasing or to inspect how a point may have been spoken rather than summarized.
- `witharin-session5-extended-summary.md` — Best corroboration for Page 9–10: trading system design, RSI, Fibonacci, position sizing, 2% portfolio risk, and pre-trade sheet workflow.
- `witharin-session5-transcript-proper.md` — Lower-level support for Session 5 when the summary needs more texture around RSI, position sizing, and trade workflow.
- `witharin-session6-extended-summary.md` — Best corroboration for Page 10–11: multi-bagger breakout and monthly Bollinger Band investment strategy.
- `witharin-session6-transcript-proper.md` — Lower-level support for Session 6; useful when checking whether a handwritten threshold may be a mistranscribed number.
- `witharin-session7-extended-summary.md` — Best corroboration for Page 11–12: buying in the dips, bulls slow/bears fast, stay with Nifty, divergence, and cross strategy.
- `witharin-session7-transcript-proper.md` — Lower-level support for Session 7 where the summary is not enough.
- `witharin-session8-extended-summary.md` — Best corroboration for Page 13–14: pre-market context, GIFT Nifty, Dow futures, FII/FPI flow, ABC strategy.
- `witharin-session8-transcript-proper.md` — Noisier source, but still helpful for anchor terms that survive the rough translation pass.
- `witharin-session9-extended-summary.md` — Best corroboration for Page 14–16: breakout checklist, BTST, risk taxonomy, alpha/beta, trend continuation, SMA/EMA systems, mutual-fund sourcing.
- `witharin-session9-transcript-proper.md` — Lower-level support for Session 9 when trying to preserve the order of ideas or scanner workflow.

## Source pointer matrix

| Handwritten page(s) | Reconstructed class/topic | Best corroborating markdown files | Why they matter |
|---|---|---|---|
| 1 | Class 1 — market basics | `Stock Market Notes.pdf`; `witharin-lesson-2043795-extended-summary.md`; `witharin-lesson-2043795-transcript-proper.md` | Market structure, primary vs secondary market, basic investing/trading framing. |
| 2–3 | Class 2 — indicators and reversal patterns | `Stock Market Notes.pdf` | These pages are mostly notebook-driven. External summaries do not strongly cover the exact early-class indicator shorthand, so reconstruction is page-led. |
| 4–6 | Class 3 — trade categories, momentum, candlestick patterns, Class 4 transition | `Stock Market Notes.pdf`; `witharin-session4-extended-summary.md`; `witharin-session4-transcript-proper.md` | Later summaries help validate the move from pattern recognition to zones/levels and confirm the support-resistance / order-flow bridge. |
| 6–8 | Class 4 — support/resistance, FVG, order blocks, demand/supply, continuation structures | `witharin-session4-extended-summary.md`; `witharin-session4-transcript-proper.md`; `Stock Market Notes.pdf` | Strongest alignment for zone logic, DBR/RBR/RBD/DBD, liquidity hunts, patience, and platform/indicator discipline. |
| 9–10 | Class 5 — trading system, RSI, Fibonacci, position sizing, trailing | `witharin-session5-extended-summary.md`; `witharin-session5-transcript-proper.md`; `Stock Market Notes.pdf` | Strong alignment and highest-confidence quantitative reconstruction. |
| 10–11 | Class 6 — investment strategy block | `witharin-session6-extended-summary.md`; `witharin-session6-transcript-proper.md`; `Stock Market Notes.pdf` | Strong alignment for multi-bagger breakout and monthly Bollinger Band strategy. |
| 11–12 | Class 7 — swing trading block | `witharin-session7-extended-summary.md`; `witharin-session7-transcript-proper.md`; `Stock Market Notes.pdf` | Strong alignment for Buying in the Dips, Nifty filter, divergence, and Cross Strategy. |
| 13–14 | Class 8 — context and ABC strategy | `witharin-session8-extended-summary.md`; `witharin-session8-transcript-proper.md`; `Stock Market Notes.pdf` | Needed for pre-market context, FII/FPI cues, and 50 SMA + lower BB + green candle logic. |
| 14–16 | Class 9 — breakout/BTST/continuation/MA systems | `witharin-session9-extended-summary.md`; `witharin-session9-transcript-proper.md`; `Stock Market Notes.pdf` | Strong alignment for breakout checklist, BTST, alpha/beta, trend continuation, 13/34 SMA, 44 SMA, 9/15 EMA, and fund-based sourcing. |

## Pointer rules for future editors / Codex / Claude Code

Use this document as an **evidence-linked reconstruction**, not as unquestionable ground truth.

When extending or editing it:

1. **Never silently overwrite notebook ambiguity.**
   - If a handwritten threshold conflicts with a cleaner session summary, keep both and resolve explicitly.
2. **Prefer extended summaries over raw translated transcripts** when the summary is clearly aligned and the transcript is noisy.
3. **Prefer the handwritten page** when the external markdown does not actually cover the same idea.
4. **Keep page numbers stable.**
   - Every notebook-derived section should continue to identify which PDF page it came from.
5. **Keep strategy rules machine-readable.**
   - Thresholds, entry conditions, stop-loss rules, and trailing logic should always appear in one structured block.
6. **Do not collapse investing, swing, and intraday into one rule-set.**
   - The course itself keeps them separate. Your reconstruction should too.
7. **Treat return examples as illustrations, not expectations.**
8. **Do not normalize away course-specific jargon** such as DBR, RBR, RBD, DBD, BTST, MBB, or “stay with Nifty”.

# Part 1 — Clean page-by-page reconstruction with source-linked reading

# Page-by-page OCR reconstruction

---

## Page 1 — Class 1: Market basics

### Clean OCR reconstruction

**Debt**
- Bond
- Debt funding instruments are implied as loan-like capital

**Equity**
- FFF / Friends, Family, Fools
- Angel
- Venture
- Private Equity
- IPO
- FPO
- Public

**Stock exchange structure**
- Listing
- Secondary market
- Stock exchange
- Primary market

**Historical notes**
- Oldest stock exchange → Antwerp (1460) *(as written in notes)*
- Oldest existing stock exchange → Amsterdam (1602)
- “Bourse” noted as exchange terminology

**Indian market structure**
- NSE (1992)
  - Most advanced
  - ~2700 companies
  - Nifty 50
- BSE (1875)
  - ~6000 companies
  - Sensex 30

**Intermediation chain**
- Stock exchange → Broker → Sub-broker → Retail trader

**Broker types**
- Full-fledged brokers
- Discount brokers

**3-in-1 account**
- Demat
- DP
- Trading

**Depositories**
- NSDL (linked in notes with NSE)
- CDSL (linked in notes with BSE)

**Analysis split**
- Technical
  - Visual
  - Short to medium term
  - Scalping / Intraday / Swing
  - TradingView
- Fundamental
  - Core
  - Long term
  - Value
  - Price
  - “Benefit / Cost” concept written under value

### Expanded digital reconstruction

This page is basically a **foundation map of the stock market ecosystem**.

#### 1. Debt vs Equity
The notes start by contrasting **debt** and **equity**.

- **Debt** means borrowed capital. A bond is the simplest example mentioned.
- **Equity** means ownership capital.

The equity funding ladder written in the notes follows the typical startup/company capital journey:

1. Friends, Family, Fools
2. Angel investors
3. Venture capital
4. Private equity
5. IPO / FPO
6. Public market participation

This is a rough progression from private capital to public listing.

#### 2. Primary market vs secondary market
The page clearly distinguishes:

- **Primary market** — where securities are issued for the first time (IPO, FPO)
- **Secondary market** — where already-issued securities trade between investors on an exchange

That is why “IPO/FPO” appears on the primary side, and “listing / stock exchange” on the secondary side.

#### 3. Exchange history
Two historical notes appear:

- Oldest stock exchange → Antwerp (1460)
- Oldest existing stock exchange → Amsterdam (1602)

The intent of the note is obvious: one is trying to capture the **historical roots of organized securities trading**.

#### 4. Indian exchanges
The notes compare NSE and BSE in a very classroom-style way:

**NSE**
- Newer
- More advanced technologically
- Associated with Nifty 50

**BSE**
- Older
- Much larger company count in note shorthand
- Associated with Sensex 30

This is a basic exam/interview-style comparison, not a full market microstructure discussion.

#### 5. Broker and account structure
The notes are trying to make a beginner understand that you do not trade “with the exchange directly”.

The chain is:
**Exchange → broker/intermediary → client**

And to operate practically, you need:

- **Trading account** — to place trades
- **Demat account** — to hold securities in electronic form
- **DP relationship** — depository participant connection to NSDL/CDSL

#### 6. Technical vs fundamental analysis
The page ends with a very important conceptual split:

**Technical analysis**
- price/chart based
- visual
- short to medium horizon
- suited for scalping, intraday, swing
- TradingView noted as platform

**Fundamental analysis**
- business/value based
- core/intrinsic understanding
- longer-term orientation
- distinction between **value** and **price**

This distinction matches the later session summaries: technical for structure/timing, fundamental for conviction and longer holding.

### OCR ambiguity note
There is a small boxed sketch near the center-left involving “investment / business / employment / self employment”-type terms, but the handwriting is too unclear to reliably reconstruct literally. I have not invented content there.

---

## Page 2 — Class 2: Basic indicators and reversal patterns

### Clean OCR reconstruction

Top-left candle anatomy:
- High
- Close/Open
- Open/Close
- Low

**Indicators**
1. Moving Average
   - “Normally based on closing price”
   - 9 SMA
   - 20 SMA
   - Buy signal on bullish cross
   - Sell signal on bearish cross
   - “Signal not trigger”

2. MACD
   - Moving Average Convergence Divergence
   - MACD line vs signal line
   - Buy / Sell depending on crossover

3. Head & Shoulder pattern
   - “a part of reversal pattern”
   - Shoulder
   - Head
   - Shoulder
   - Neckline
   - Breakdown / breakout marked
   - Band range = target range
   - “Watch 100 charts per week”

4. Inverse head and shoulder

### Expanded digital reconstruction

This page introduces a beginner to the idea that **indicators are aids, not standalone certainty machines**.

#### 1. Candle anatomy
The sketch at the top-left shows the four basic candle references:

- High
- Low
- Open
- Close

This is the visual grammar needed before talking about patterns.

#### 2. Moving average
The note says:

- “Moving average (normally based on closing price)”
- 9 SMA
- 20 SMA
- crossover gives buy/sell indication
- “signal not trigger”

That last line matters. The intent is:

> A moving average crossover can **alert** you to a possible shift, but it should not be treated as the only reason to enter.

That is consistent with the later classes, where trend, momentum, support/resistance, and confirmation are always layered.

#### 3. MACD
The handwritten note expands MACD correctly as:

**Moving Average Convergence Divergence**

The page shows:
- bullish crossover → buy
- bearish crossover → sell

Again, likely intended as a **signal layer**, not a complete system.

#### 4. Head and shoulders
The page clearly draws:
- left shoulder
- head
- right shoulder
- neckline

Then it marks:
- breakdown zone
- target range

This is standard head-and-shoulders logic:
- neckline break confirms the reversal
- target is often estimated using the distance from head to neckline, projected downward

The note “watch 100 charts per week” is basically practice advice: pattern recognition improves through repetition.

#### 5. Inverse head and shoulders
The page closes by introducing the bullish mirror image:
- inverse head and shoulders
- typically used as a bullish reversal pattern after decline

---

## Page 3 — Continuation of Class 2 patterns

### Clean OCR reconstruction

5. Triple top & bottom
- top / bottom labels shown
- target projection drawn

6. V-reversal
- “one spike”

### Expanded digital reconstruction

This page is short but important.

#### 1. Triple top / triple bottom
The drawing suggests:
- repeated resistance tests on top
- repeated support tests on bottom
- eventual breakout/breakdown
- target projection from the range

Triple top usually implies bearish reversal if support breaks.  
Triple bottom usually implies bullish reversal if resistance breaks.

#### 2. V-reversal
The note “one spike” is shorthand for a **sharp, fast reversal without long consolidation**.

That usually means:
- not much time to accumulate
- fast sentiment shift
- harder entries if one is waiting for textbook pullbacks

---

## Page 4 — Class 3: Trade categories, trend, momentum, Dow Theory

### Clean OCR reconstruction

**Equity market trades**
- Intraday
  - Long or short
- Swing
  - Long ✓
  - Short X *(as written)*
- Long / investing
  - Long ✓
  - Short X

**Examples**
- Long position and short position sketches

**Stock market**
- trend market + momentum
- momentum = velocity of price change

**Timeframe nesting**
- Monthly → Daily → Hourly → 5 min
- For taking a 5 min trade, check hourly trend

**Dow Theory**
- Good stock:
  - Higher high
  - Higher low
  - M-RSI > 60
- Bad stock:
  - Lower high
  - Lower low
  - M-RSI < 60

**Candlestick patterns**
- Hammer
  - bullish
  - “price will go up from here”
- Hanging man
  - bearish

### Expanded digital reconstruction

This page shifts from isolated indicators into **market framing**.

#### 1. Types of equity participation
The notes divide activity into three buckets:

**Intraday**
- same-day trading
- long or short

**Swing**
- multi-day to multi-week trading
- note seems to emphasize long-side swing trading

**Long-term / investing**
- long only

The “short X” marks under swing and long-term are not universal market truths. They are best read as **course-specific preference**:
- intraday can be both-sided
- swing and investing are taught mostly from the long side

That matches later session summaries.

#### 2. Trend + momentum
The page says:

> Stock market = trend + momentum

and defines momentum as:

> velocity of price change

This is consistent with later strategy classes:
- trend tells direction
- momentum tells strength and speed

#### 3. Multiple timeframe logic
A very important note appears:

- Monthly → Daily → Hourly → 5 min
- If taking a 5-minute trade, check hourly trend

This is classic **top-down analysis**:
- higher timeframe provides bias
- lower timeframe provides execution

#### 4. Dow Theory shorthand
The page reduces trend quality to structure:

**Good stock**
- Higher Highs
- Higher Lows
- Monthly RSI > 60

**Bad stock**
- Lower Highs
- Lower Lows
- Monthly RSI < 60

This is very aligned with the later swing and trend-continuation notes.

#### 5. Candle pattern introduction
This page starts the candlestick section with:
- Hammer → bullish
- Hanging Man → bearish

The note “price will go up from here” is clearly shorthand for the hammer showing buying rejection from lower levels.

---

## Page 5 — Class 3 continuation: Single-candle and double-candle patterns

### Clean OCR reconstruction

**Single-candle patterns**
- Inverted hammer → bullish
- Shooting star → bearish
- Standard doji → reversal
- Long-legged doji → reversal
- Dragonfly → bullish reversal
- Gravestone → bearish reversal
- 4-price doji
  - open = high = close = low

**Effectiveness note**
- bullish candle after up move → “very effective”
- bullish candle in wrong context → “less effective”
- “and vice versa”

**Marubozu**
- Bullish marubozu
- Bearish marubozu

**Double candlestick patterns**
- Bullish engulfing
- Bearish engulfing
- Harami (“pregnant woman” mnemonic)

### Expanded digital reconstruction

This page is a dense candlestick cheat sheet.

#### 1. Reversal candles
The note-set is trying to teach two things at once:
- what the candle looks like
- when it matters

The contextual note “very effective / less effective / vice versa” matters more than the names.

A candle is not powerful just because of its shape.  
Its usefulness depends on:
- where it appears
- what trend preceded it
- whether it appears at support/resistance or exhaustion

#### 2. Doji family
The page lists several doji variants:
- standard doji
- long-legged doji
- dragonfly doji
- gravestone doji
- four-price doji

The educational purpose is to show:
- indecision
- rejection
- exhaustion
- context-specific reversal risk

#### 3. Marubozu
A marubozu is a full-body candle with little or no wick, used to show strong directional control.

- bullish marubozu = strong buyer dominance
- bearish marubozu = strong seller dominance

#### 4. Double-candle patterns
The notes include:
- bullish engulfing
- bearish engulfing
- harami

The “pregnant woman” mnemonic is standard classroom shorthand for **harami**.

---

## Page 6 — Class 3 to Class 4 transition

### Clean OCR reconstruction

**Triple candlestick patterns**
- Morning Star (Bullish)
- Evening Star (Bearish)

**20 days moving average strategy**
- Use when HHHL pattern (good stock)
- Take entry
- Stop loss lower than previous low
- “Exit when??”
- “Where green candle crosses 20 DMA after a higher low”

**Class 4**
1. Support & resistance
   - can be ascending / descending too

2. Fair Value Gap
   - Bullish FVG
   - Opposite is bearish
   - “at reversal point”

3. Breakout probability (expo)
- For institutions to make money, retail traders have to lose money
- Stop-loss hunting
- First they will hit stop-loss, then take the stock up

### Expanded digital reconstruction

This is a very important transition page.

#### 1. Triple-candle reversals
Two classical 3-candle reversals are listed:

- Morning Star → bullish reversal
- Evening Star → bearish reversal

These patterns prepare the student to think in terms of **sequence**, not only single candles.

#### 2. 20 DMA strategy
The handwritten logic appears to be:

- use only in strong-trend stocks
- strong stock = HHHL structure
- wait for a pullback
- enter when bullish candle reclaims / crosses 20 DMA after higher low
- stop-loss below previous low

This is a very standard trend-following pullback strategy.

The “Exit when??” note suggests the student had not fully captured the exit rule.

#### 3. Support and resistance
The note “can be ascending / descending too” is important.  
It means the teacher likely explained that support/resistance need not always be perfectly horizontal; they may also appear as sloping structures or channels.

#### 4. Fair Value Gap
The notes clearly mark:
- bullish FVG
- opposite is bearish
- often relevant near reversal / imbalance zones

Later session material does not center FVG heavily, so this page preserves the handwritten shorthand rather than over-expanding it.

#### 5. Stop-loss hunting / institutional behavior
This page contains a critical market-behavior idea:

> Institutions often take price into obvious stop-loss zones first, then move price in the intended direction.

That connects directly with later notes about:
- placing stops below swing low
- avoiding overly obvious levels
- waiting for better confirmation

---

## Page 7 — Class 4: Order blocks, demand/supply, pending-area concept, EMA

### Clean OCR reconstruction

4. Order block
- big candle crosses last swing bar
- reversal
- price falling
- big volume
- volume dry up
- may have to wait for days / months
- institutions moving in a staggered way

Supply zone / Demand zone sketched

5. Demand & Supply Zone
- Pending Area Concept
- We generally follow T+2 policy
- We don’t enter at T+3 or beyond
- Example:
  - Total corpus 1000 cr
  - Invested 300 cr
  - Pending 700 cr
  - Invested 400 cr
  - Pending 300 cr
- Pattern for demand
- Pattern for supply

Demand supply vs Support resistance
- Demand/supply: more test = weaker
- Support/resistance: more test = stronger

6. Exponential moving average
- latest → more weight
- 50 EMA over 200 EMA → Buy
- 50 EMA below 200 EMA → Sell

### Expanded digital reconstruction

This page contains some of the more useful structural thinking in the whole set.

#### 1. Order block idea
The notes suggest the teacher explained order blocks as:

- price falls into a zone
- a strong reversal candle appears
- volume spikes, then may dry up
- large players may accumulate in parts, not all at once
- the move may require patience over multiple bars/days

That fits the later session summary of order blocks as reversal-cluster zones.

#### 2. Demand/supply zone logic
The page distinguishes **zones** from lines.

There is also a capital-flow explanation using the “pending area concept”:
- institutions may want to deploy a large corpus
- not all buying happens in one shot
- some amount is invested, some remains pending
- therefore zones can be revisited

This is a useful interpretation:
- a zone is not magical
- it reflects incomplete or staged order execution

#### 3. T+2 and “do not enter at T+3”
This note is ambiguous, but the likely intended meaning is:
- a setup is strongest close to the original demand/supply event
- if too much time has passed, the edge decays

I would treat this as **medium-confidence shorthand**, not a rigid universal rule.

#### 4. Demand/supply vs support/resistance
This is one of the most interesting handwritten distinctions:

- **Demand/supply zone** → more tests = weaker
- **Support/resistance line** → more tests = stronger

This is not a universally accepted law, but it reflects a practical trading heuristic:

- repeated tapping into a zone consumes resting orders
- repeated recognition of a classical level makes the level more obvious to the market

#### 5. EMA crossover
The final section explains EMA as:
- more weight to latest prices
- faster than SMA for recent movement
- 50 EMA / 200 EMA directional cross used as trend filter

---

## Page 8 — Class 4 continuation: stop-loss placement, exits, continuation patterns

### Clean OCR reconstruction

- Always set stop-loss below swing low to avoid stop-loss hunting
- And set stop-loss below round figure

**When to sell?**
- Volatility stop (Vstop) indicator
- Hold as long as green

**Curvature notes**
- Deep U → more convincing
- shallow U → less convincing

**Saucer**
- not reversal pattern
- continuation pattern
- has to cross this line

**Patterns**
- Symmetrical triangle
- Ascending triangle
- Descending triangle

### Expanded digital reconstruction

This page is about **trade management and continuation structure**.

#### 1. Stop-loss placement
The notes give two practical rules:

- stop below swing low
- stop below round figure

The intent is to avoid:
- obvious retail clustering
- easy stop hunts near psychologically neat levels

#### 2. When to sell
The page gives one explicit exit tool:
- volatility stop / Vstop
- hold while indicator stays green

That ties into later pages where Supertrend and trailing logic are also used.

#### 3. Deep-U / saucer
The page visually compares:
- deep U = more convincing
- shallow curve = less convincing

Then it labels **saucer** as:
- not a reversal pattern
- continuation pattern

That is consistent with many momentum frameworks:
- rounded continuation after consolidation
- breakout over neckline / reference line confirms continuation

#### 4. Triangle patterns
The page finishes with three classic structures:

- symmetrical triangle
- ascending triangle
- descending triangle

These are continuation/breakout frameworks rather than isolated candle signals.

---

## Page 9 — Class 5: Trading system, RSI zones, risk-reward, Fibonacci, position sizing

### Clean OCR reconstruction

**Trading system**
- Stock selection
- Good strategy
- Position sizing
- Risk management

**Stock market = Trend + Momentum**

**RSI indicator**
- No trade zone
- RSI upper band (60)
- RSI lower band (40)
- momentum uptrend / momentum downtrend

**Risk Reward Ratio**
- If SL = R then target = 3R
- Price has to touch support/resistance or trendline, then only take trade

**Trendlines with breaks**
- check for green breaks & red breaks

**Fibonacci Retracement**
- common 50%
- minimum 33%
- maximum 62%
- if retracement > 62%, original trend is over
- gives idea about target when taking a trade

**Position sizing**
- Investing vs Trading
- Investing = long term / wealth
- Trading = short to medium term / income

**Risk**
- risk per trade = 2% of portfolio max

**Quantity formula**
- Quantity = (0.02 × portfolio size) / (Entry − Stop Loss)

### Expanded digital reconstruction

This is one of the strongest pages in the note-set.

#### 1. Trading system components
The page reduces the system to four immediate components:
- stock selection
- strategy
- position sizing
- risk management

Later summaries expand this further to include psychology and trailing.

#### 2. RSI zone model
The handwritten model appears to be:

- above 60 → bullish momentum zone
- below 40 → bearish momentum zone
- 40–60 → no-trade / low-conviction zone

This matches the summary logic better than the classic 70/30 retail default.

#### 3. Risk-reward
The page is explicit:

- define SL = R
- target = 3R

That means the course strongly favored **3:1 reward-to-risk framing**.

The note also says:
- only take trade when price touches structure (support/resistance or trendline)

That means entries are not supposed to happen in “empty air”.

#### 4. Fibonacci retracement
The handwriting says:
- common 50%
- minimum 33%
- maximum 62%

This differs from textbook Fibonacci levels, but in practice it is a simplified classroom range:
- one-third pullback
- half pullback
- deeper but still acceptable pullback near 62%

The note:
> if retracement > 62%, original trend is over

should be treated as a **heuristic**, not a law.

#### 5. Position sizing
This page correctly captures the core formula:

\[
\text{Quantity} = \frac{0.02 \times \text{Portfolio Size}}{\text{Entry - Stop Loss}}
\]

That is exactly aligned with the later session summary.

---

## Page 10 — Class 5 example and Class 6 strategy map

### Clean OCR reconstruction

**Quantity example**
- Entry = 100
- S.L. = 90
- Portfolio = 10 lakh
- Quantity (max) = 0.02 × 10,00,000 / (100 − 90) = 2000

**Trailing**
- As price moves up → move SL to NPNL
- (No profit no loss)
- Keep shifting SL like this

**Multi-bagger**
- grown multiple times
- How to identify multi-bagger stocks?
- Homework: what is common among multi-bagger stocks?

**Class 6**
- Strategy
  - Investment
  - Swing
  - Intraday

**1) Multi-bagger strategy (monthly candle)**
- One common pattern → sideways movement for many years
- Conversion of neutral/dead stock to a good stock
- Check out IPOs of 3–4 years or older
- Site: Chittorgarh.com
- Draw horizontal lines at highest & lowest
- for all the companies from 2005 to 2022
- Then wait for price to cross the highest line
- This is known as multi-bagger breakout
- Verify for momentum using RSI

### Expanded digital reconstruction

This page finishes the math from Class 5 and starts the investment-strategy block.

#### 1. Quantity worked example
The formula is applied exactly:
- 2% risk of ₹10 lakh = ₹20,000
- per-share risk = ₹10
- max quantity = 2000

This is high-confidence and consistent with the cleaner summary material.

#### 2. Trailing stop logic
The notes say:
- as price rises, shift stop-loss upward
- move to no-profit-no-loss first
- continue shifting

This is a simple way to teach **capital protection after confirmation**.

#### 3. Multi-bagger strategy — conceptual core
The page asks:
> what is common among multi-bagger stocks?

Then answers:
- years of sideways behavior
- “dead stock” becoming “good stock”
- breakout from a long base

That directly matches the later session summary for Session 6.

---

## Page 11 — Class 6: Bollinger Band investment strategy and Class 7 swing setup

### Clean OCR reconstruction

**2) Bollinger Band Strategy**
- Use indicator: Bollinger Bands

**Price conditions**
- Price > 50 *(handwritten)*
- Daily volume > 100000
- Monthly RSI > 55 *(handwritten)*
- Monthly high crosses upper Bollinger

**How to know?**
- use scanner
- chartink.com/screener/bb-strategy

**Use strategy only on**
- last or penultimate day of the month

**Place your entry**
- 1% above high

**Stop-loss alternatives**
1. Middle band of Bollinger
2. Previous swing low (monthly)
3. Previous swing low (daily)
4. Supertrend (uptrend line)

**Class 7 swing strategies**
- We will use daily timeframe
- but first identify monthly RSI > 60
- (1) Buying in the dips
- Entry when RSI < 40
- Exit when RSI > 60
- crossing from below / crossing from above
- Continue to do stop-loss trailing daily
- Set first stop-loss at previous swing low

### Expanded digital reconstruction

This page is one of the places where the handwriting and the cleaner summary **partly conflict**.

#### High-confidence elements
These are consistent across both:
- Bollinger Band-based investment strategy
- monthly framework
- daily volume filter
- monthly RSI filter
- upper Bollinger Band breakout
- use scanner
- only evaluate near month-end
- entry 1% above trigger
- stop-loss can be swing-low-based or indicator-based

#### Ambiguous numeric conflict
The handwritten page says roughly:
- Price > 50
- Monthly RSI > 55

But the cleaned session summary says the more likely normalized conditions were:
- **Price ≥ 100**
- **Monthly RSI ≥ 50**

So the handwriting here should be treated as **compressed / possibly miscopied**.  
For actual normalized reconstruction, the safer version is:

- Price floor filter
- Volume > 1 lakh
- Monthly RSI in positive zone
- Monthly high crossing upper Bollinger Band
- month-end evaluation only
- 1% breakout buffer

#### Swing strategy note conflict
The page writes:
- monthly RSI > 60
- daily entry when RSI < 40
- exit when RSI > 60

But the cleaner swing summary describes the main setup more broadly as:
- monthly RSI ≥ 60
- shift to daily chart
- wait for dip/pullback
- enter on bullish resolution of the dip
- trail from daily swing structure

So the “RSI<40 / RSI>60” note was likely the student’s personal shorthand, not the complete formal rule.

---

## Page 12 — Class 7: Nifty filter, divergence, cross strategy

### Clean OCR reconstruction

2. Bulls are slow and Bears are superfast

3. Nifty is the king of the jungle
- Stay with Nifty
- not a good time to take long position in M-60 stocks *(if Nifty weak, implied)*

4. Divergence
- disagreement between price & indicator
- Bullish divergence
- Bearish divergence

1. Trend reversal strategy
- conditions
- daily volume > 100k

2. Cross Strategy
- Place Bollinger Bands
- Look for green candle near the lower Bollinger Band
- Draw previous trendline (downward)
- Draw VWAP (check if it moves through the same zone)
- It works better if lower BB is trending upward
- basically momentum is upward, trend is momentarily downward

### Expanded digital reconstruction

This page aligns strongly with the Session 7 summary.

#### 1. Bulls slow, bears fast
This is a behavioral framing rule:
- uptrends often build gradually
- downtrends can collapse quickly

That affects:
- how one trails longs
- how fast one cuts breakdowns
- why dip-buying must still respect risk

#### 2. Stay with Nifty
The note says:
> Nifty is the king of the jungle

Meaning:
- broad-market direction matters
- do not force long trades if the index backdrop is against you

This is a major filter carried into later setups.

#### 3. Divergence
The page defines divergence correctly as:
- disagreement between price and indicator

Likely intended examples:
- bullish divergence = price weaker, RSI stronger
- bearish divergence = price stronger, RSI weaker

#### 4. Cross strategy
This page compresses the cross strategy very effectively:

- lower Bollinger Band interaction
- green candle appears nearby
- downward trendline is crossed
- VWAP is also reclaimed / intersected
- best when lower BB itself is not sloping down aggressively

That matches the later cleaned summary almost exactly.

---

## Page 13 — Class 8: progression logic, market context, momentum filters

### Clean OCR reconstruction

**Class 8**

Month 1,2 → 5%  
3,4 → 10%  
5,6 → 20%  
7,8 → 30%  
9,10 → 40%  
11,12 → 50%

- Money flows from impatient to patient

**SGX Nifty & GIFT Nifty**
- show early trends (most important)

**Oil price**
- inverse correlation with Nifty

**Gold price**
- inverse correlation with Nifty

**Dow Jones**
- direct correlation

**E-mini Dow Jones futures**
- direct correlation
- YM1!

**Moneycontrol**
- Market action
- 52-week high
- high momentum
- note daily / weekly / monthly frames

- See companies making QoQ & YoY profits
- profitability

4. Never buy at resistance, sell at support

5. Buy 15% above support level
- [support + 15% (resistance − support)] *(implied formula shorthand)*

**ATR indicator**
- Average true range
- (Target/Resistance − Entry) / ATR = no. of days required to reach target

1. Delivery percentage (NSE India website)
- should be > 45% at reversal

2. Volume should be > moving average

3. Closing should be above 5-day EMA

- If I want to trade during sideways movement *(written as a note)*

### Expanded digital reconstruction

This page mixes **context reading**, **stock selection**, and **trade quality filters**.

#### 1. “Money flows from impatient to patient”
This is more than motivation. It is the psychological anchor for:
- waiting
- discipline
- not chasing
- letting setups mature

#### 2. Pre-market context read
The page clearly identifies the market context checklist:
- SGX/GIFT Nifty for early domestic bias
- oil and gold as inverse risk-off cues
- Dow / E-mini Dow futures as direct global-equity cues

This aligns well with the cleaned Class 8 summary.

#### 3. Momentum + profitability
The page mixes technical and fundamental screening:
- 52-week high
- high momentum
- QoQ and YoY profit growth

That means the teacher was not recommending purely blind chart-chasing; there was some attempt to combine price behavior with improving business performance.

#### 4. Buy zone calculation
The line:
> Buy 15% above support level

likely means the trader should not buy exactly at support or exactly at resistance, but somewhere within a structured range using a measured zone.

A reasonable normalized interpretation is:
- define support and resistance
- calculate the band
- enter after price moves meaningfully away from support rather than at arbitrary midpoints

#### 5. Sideways-market breakout filters
The lower section gives practical breakout-quality filters:
- delivery >45%
- volume above average
- close above short-term EMA

These are very useful quality checks for range breakouts.

---

## Page 14 — Class 8 continuation and Class 9 breakout framework

### Clean OCR reconstruction

**Optional condition**
- Check last 1 month data
- identify the highest delivery percentage date
- if entry candle’s closing is above that date’s closing
- then take entry

**Volume matrix**
- Price ↑ Volume ↑ → Bullish confirmation
- Price ↓ Volume ↑ → Bearish confirmation
- Price ↑ Volume ↓ → Weak uptrend
- Price ↓ Volume ↓ → Weak downtrend

- FII + → Bullish
- FII − → Bearish
- FII − , DII + → Resilient

**3) ABC Strategy**
- Average / 50 days SMA
- Lower Bollinger Band
- Green candle
- these things converge

**Class 9**
How to identify real breakout?

1. Big green candle
2. Body shall be at least 70%
3. Volume higher than previous day
4. Delivery > 35%
5. Close at least 1% above resistance level
6. Market condition shall be positive

### Expanded digital reconstruction

This page is strong and mostly clear.

#### 1. Highest-delivery-date filter
This is an advanced entry refinement:
- look back over recent period
- find the strongest delivery participation day
- use that close as a quality threshold

That is actually a pretty good institutional-interest filter.

#### 2. Volume-price relationship
This section is textbook market logic and very practical:

- price up + volume up = conviction
- price down + volume up = strong selling
- price up + volume down = weak move
- price down + volume down = weak decline

#### 3. FII / DII interpretation
The note:
- FII positive = bullish
- FII negative = bearish
- FII negative, DII positive = resilient

is a simplified but useful framework for Indian market context.

#### 4. ABC strategy
This page compresses the ABC setup into three converging elements:
- 50 SMA
- lower Bollinger Band
- green candle

That is very consistent with the cleaned Class 8 summary.

#### 5. Real breakout checklist
This is one of the highest-confidence sections in the whole note-set and matches the cleaned summary almost perfectly.

---

## Page 15 — Class 9: breakout probability, BTST, risk types, alpha-beta screener

### Clean OCR reconstruction

- If there is doubt, but subsequent reversal upward from previous resistance, then you can enter

**What increases breakout probability?**
- gap closing
- ranging / ramping action under resistance

5. BTST
- Buy Today Sell Tomorrow
- Moneycontrol → All stats → Top Gainers + Volume Shockers
- find common
- Not on Friday
- or any day before holiday
- or day before expiry
- Best to take trade in the first two weeks
- take trade in 2nd half, exit in 1st half

**Corporate risk**
- Market risk
- Credit risk
- Operational risk

**Systemic risk**
- non-diversifiable
- example: war

**Non-systematic risk**
- company-specific

6. tickertip / tickertape type screener
- stock screener
- start screening

**Alpha (α)**
- stock return − market return
- 15% or more

**Beta (β)**
- stock price volatility relative to market
- 0 to 1 or 1.5 *(handwriting unclear)*

- Safest → Large cap → then do fundamental analysis

- Keep every strategy separate

### Expanded digital reconstruction

This page joins several Session 9 concepts.

#### 1. Breakout probability increases when…
The page suggests two pre-breakout conditions:
- resistance is being approached repeatedly
- price compresses / ranges / ramps beneath resistance
- prior gap dynamics are resolving

That is structurally sensible. A compressed move beneath resistance often improves breakout odds.

#### 2. BTST workflow
The handwritten workflow is strong and practical:

- use Moneycontrol market statistics
- intersect top gainers and volume shockers
- avoid poor timing windows:
  - Friday
  - pre-holiday
  - pre-expiry

This closely matches the cleaner session summary.

#### 3. Risk classification
The page splits risk into:
- market risk
- credit risk
- operational risk
- systemic risk
- non-systematic risk

This is not just academic; it teaches the student that not all losses come from chart failure.

#### 4. Alpha and beta
The page gives:
- alpha = stock return minus market return
- beta = volatility relative to market

The “15% or more” line likely belongs to alpha screening.  
The safer large-cap-first note reflects an attempt to reduce noise.

#### 5. Keep every strategy separate
This is one of the best lines in the entire note set.

It means:
- do not mix rules from different systems
- do not contaminate one setup with another
- back-test and evaluate each edge independently

That is real process discipline.

---

## Page 16 — Class 9: trend continuation, SMA/EMA setups, mutual-fund idea sourcing

### Clean OCR reconstruction

7. Trend Continuation Strategy
- Monthly RSI > 60
- Green candle
- Daily close crossed
- Supertrend (7,2?) *(uncertain)*
- Close above green line is also OK

8. SMA Strategy (13–34)
- Use when 200 SMA is in uptrend
- Look for deep U cut
- then both continue uptrend

9. SMA strategy (44)
- 44 SMA should be in uptrend
- Price slightly crosses 44 SMA from up / then rebounds
- use as support

10. 9–15 EMA Strategy
- 9 cuts 15 from below
- and green candle above green supertrend
- in 4H chart
- should coincide

11. Best mutual funds in India
- choose diverse fund
- detailed portfolio analysis
- find common stocks
- then do fundamental analysis

### Expanded digital reconstruction

This page is a clean closing summary of advanced Session 9 ideas.

#### 1. Trend continuation strategy
The core logic is:

- monthly RSI > 60 for primary strength
- daily confirmation via green candle / trend indicator
- supertrend used as filter and trail

This directly matches the later summary.

#### 2. 13/34 SMA with 200 SMA
This is a classic trend-following setup:
- 200 SMA defines primary uptrend
- 13 and 34 SMA give tactical entry
- “deep U cut” likely means a healthy pullback/recovery structure rather than a flat crossover in chop

#### 3. 44 SMA strategy
The note suggests the stock:
- remains in uptrend
- pulls back into 44 SMA
- rebounds from it as dynamic support

That is a clean single-MA trend continuation framework.

#### 4. 9/15 EMA strategy on 4H
This is a faster swing version:
- 9 EMA crosses above 15 EMA
- supertrend is green
- 4-hour timeframe
- confluence required

#### 5. Mutual-fund-driven stock discovery
This is one of the smartest non-obvious ideas in the notes:
- start with diversified / quality funds
- study their detailed holdings
- find repeated common stocks
- only then do fundamental analysis

That means the fund manager’s portfolio is being used as a **pre-filtered idea universe**.

---

## Page-by-page source pointers

### Pointer block by page cluster

#### Pages 1–3
- **Primary evidence**: `Stock Market Notes.pdf`
- **Role of external markdown**: weak-to-light support only
- **Why**: early indicator and reversal-pattern shorthand is mostly notebook-native
- **Confidence**: medium overall, high on obvious labels, lower on tiny shorthand

#### Pages 4–8
- **Primary evidence**: `Stock Market Notes.pdf`
- **Best corroboration**: `witharin-session4-extended-summary.md`, `witharin-session4-transcript-proper.md`
- **Why**: strong alignment on support/resistance, order blocks, demand/supply, liquidity hunts, patience, and indicator discipline
- **Confidence**: high on the big concepts, medium on a few compressed handwritten sub-notes

#### Pages 9–10
- **Primary evidence**: `Stock Market Notes.pdf`
- **Best corroboration**: `witharin-session5-extended-summary.md`, `witharin-session5-transcript-proper.md`
- **Why**: strongest quantitative alignment in the whole set
- **Confidence**: high

#### Pages 10–11
- **Primary evidence**: `Stock Market Notes.pdf`
- **Best corroboration**: `witharin-session6-extended-summary.md`, `witharin-session6-transcript-proper.md`
- **Why**: direct match for MBB + monthly BB strategy
- **Confidence**: high, with a few numeric-threshold ambiguities called out later

#### Pages 11–12
- **Primary evidence**: `Stock Market Notes.pdf`
- **Best corroboration**: `witharin-session7-extended-summary.md`, `witharin-session7-transcript-proper.md`
- **Why**: direct match for Buying in the Dips, Nifty filter, divergence, Cross Strategy
- **Confidence**: high

#### Pages 13–14
- **Primary evidence**: `Stock Market Notes.pdf`
- **Best corroboration**: `witharin-session8-extended-summary.md`, `witharin-session8-transcript-proper.md`
- **Why**: needed to decode the pre-market and ABC-strategy shorthand
- **Confidence**: medium-high because Session 8 transcript quality is noisier, but summary alignment is strong

#### Pages 14–16
- **Primary evidence**: `Stock Market Notes.pdf`
- **Best corroboration**: `witharin-session9-extended-summary.md`, `witharin-session9-transcript-proper.md`
- **Why**: direct match for breakout, BTST, alpha/beta, trend continuation, MA/EMA systems, mutual-fund sourcing
- **Confidence**: high

# Part 2 — Strict forensic pagewise transcription layer

This section is kept so downstream users can still see the more page-faithful OCR-style reconstruction instead of only the cleaned teaching version.

## Part A — Strict pagewise OCR transcription and normalized reading


## Page 1 — Class 1: Market basics

### 1) Literal note-style OCR transcript

**Debt**
- Bond
- Debt funding instruments are implied as loan-like capital

**Equity**
- FFF / Friends, Family, Fools
- Angel
- Venture
- Private Equity
- IPO
- FPO
- Public

**Stock exchange structure**
- Listing
- Secondary market
- Stock exchange
- Primary market

**Historical notes**
- Oldest stock exchange → Antwerp (1460) *(as written in notes)*
- Oldest existing stock exchange → Amsterdam (1602)
- “Bourse” noted as exchange terminology

**Indian market structure**
- NSE (1992)
  - Most advanced
  - ~2700 companies
  - Nifty 50
- BSE (1875)
  - ~6000 companies
  - Sensex 30

**Intermediation chain**
- Stock exchange → Broker → Sub-broker → Retail trader

**Broker types**
- Full-fledged brokers
- Discount brokers

**3-in-1 account**
- Demat
- DP
- Trading

**Depositories**
- NSDL (linked in notes with NSE)
- CDSL (linked in notes with BSE)

**Analysis split**
- Technical
  - Visual
  - Short to medium term
  - Scalping / Intraday / Swing
  - TradingView
- Fundamental
  - Core
  - Long term
  - Value
  - Price
  - “Benefit / Cost” concept written under value


### 2) Normalized reading

This page is basically a **foundation map of the stock market ecosystem**.

#### 1. Debt vs Equity
The notes start by contrasting **debt** and **equity**.

- **Debt** means borrowed capital. A bond is the simplest example mentioned.
- **Equity** means ownership capital.

The equity funding ladder written in the notes follows the typical startup/company capital journey:

1. Friends, Family, Fools
2. Angel investors
3. Venture capital
4. Private equity
5. IPO / FPO
6. Public market participation

This is a rough progression from private capital to public listing.

#### 2. Primary market vs secondary market
The page clearly distinguishes:

- **Primary market** — where securities are issued for the first time (IPO, FPO)
- **Secondary market** — where already-issued securities trade between investors on an exchange

That is why “IPO/FPO” appears on the primary side, and “listing / stock exchange” on the secondary side.

#### 3. Exchange history
Two historical notes appear:

- Oldest stock exchange → Antwerp (1460)
- Oldest existing stock exchange → Amsterdam (1602)

The intent of the note is obvious: one is trying to capture the **historical roots of organized securities trading**.

#### 4. Indian exchanges
The notes compare NSE and BSE in a very classroom-style way:

**NSE**
- Newer
- More advanced technologically
- Associated with Nifty 50

**BSE**
- Older
- Much larger company count in note shorthand
- Associated with Sensex 30

This is a basic exam/interview-style comparison, not a full market microstructure discussion.

#### 5. Broker and account structure
The notes are trying to make a beginner understand that you do not trade “with the exchange directly”.

The chain is:
**Exchange → broker/intermediary → client**

And to operate practically, you need:

- **Trading account** — to place trades
- **Demat account** — to hold securities in electronic form
- **DP relationship** — depository participant connection to NSDL/CDSL

#### 6. Technical vs fundamental analysis
The page ends with a very important conceptual split:

**Technical analysis**
- price/chart based
- visual
- short to medium horizon
- suited for scalping, intraday, swing
- TradingView noted as platform

**Fundamental analysis**
- business/value based
- core/intrinsic understanding
- longer-term orientation
- distinction between **value** and **price**

This distinction matches the later session summaries: technical for structure/timing, fundamental for conviction and longer holding.


### 3) Confidence / ambiguity notes

There is a small boxed sketch near the center-left involving “investment / business / employment / self employment”-type terms, but the handwriting is too unclear to reliably reconstruct literally. I have not invented content there.


### 4) Session mapping / context link

- Maps to the market-basics foundation: debt vs equity, primary vs secondary market, exchange/broker/demat structure, and technical vs fundamental split.


---

## Page 2 — Class 2: Basic indicators and reversal patterns

### 1) Literal note-style OCR transcript

Top-left candle anatomy:
- High
- Close/Open
- Open/Close
- Low

**Indicators**
1. Moving Average
   - “Normally based on closing price”
   - 9 SMA
   - 20 SMA
   - Buy signal on bullish cross
   - Sell signal on bearish cross
   - “Signal not trigger”

2. MACD
   - Moving Average Convergence Divergence
   - MACD line vs signal line
   - Buy / Sell depending on crossover

3. Head & Shoulder pattern
   - “a part of reversal pattern”
   - Shoulder
   - Head
   - Shoulder
   - Neckline
   - Breakdown / breakout marked
   - Band range = target range
   - “Watch 100 charts per week”

4. Inverse head and shoulder


### 2) Normalized reading

This page introduces a beginner to the idea that **indicators are aids, not standalone certainty machines**.

#### 1. Candle anatomy
The sketch at the top-left shows the four basic candle references:

- High
- Low
- Open
- Close

This is the visual grammar needed before talking about patterns.

#### 2. Moving average
The note says:

- “Moving average (normally based on closing price)”
- 9 SMA
- 20 SMA
- crossover gives buy/sell indication
- “signal not trigger”

That last line matters. The intent is:

> A moving average crossover can **alert** you to a possible shift, but it should not be treated as the only reason to enter.

That is consistent with the later classes, where trend, momentum, support/resistance, and confirmation are always layered.

#### 3. MACD
The handwritten note expands MACD correctly as:

**Moving Average Convergence Divergence**

The page shows:
- bullish crossover → buy
- bearish crossover → sell

Again, likely intended as a **signal layer**, not a complete system.

#### 4. Head and shoulders
The page clearly draws:
- left shoulder
- head
- right shoulder
- neckline

Then it marks:
- breakdown zone
- target range

This is standard head-and-shoulders logic:
- neckline break confirms the reversal
- target is often estimated using the distance from head to neckline, projected downward

The note “watch 100 charts per week” is basically practice advice: pattern recognition improves through repetition.

#### 5. Inverse head and shoulders
The page closes by introducing the bullish mirror image:
- inverse head and shoulders
- typically used as a bullish reversal pattern after decline

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to the early indicator/pattern block: moving averages, MACD, reversal patterns, and chart-reading grammar.


---

## Page 3 — Continuation of Class 2 patterns

### 1) Literal note-style OCR transcript

5. Triple top & bottom
- top / bottom labels shown
- target projection drawn

6. V-reversal
- “one spike”


### 2) Normalized reading

This page is short but important.

#### 1. Triple top / triple bottom
The drawing suggests:
- repeated resistance tests on top
- repeated support tests on bottom
- eventual breakout/breakdown
- target projection from the range

Triple top usually implies bearish reversal if support breaks.  
Triple bottom usually implies bullish reversal if resistance breaks.

#### 2. V-reversal
The note “one spike” is shorthand for a **sharp, fast reversal without long consolidation**.

That usually means:
- not much time to accumulate
- fast sentiment shift
- harder entries if one is waiting for textbook pullbacks

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to the early indicator/pattern block: moving averages, MACD, reversal patterns, and chart-reading grammar.


---

## Page 4 — Class 3: Trade categories, trend, momentum, Dow Theory

### 1) Literal note-style OCR transcript

**Equity market trades**
- Intraday
  - Long or short
- Swing
  - Long ✓
  - Short X *(as written)*
- Long / investing
  - Long ✓
  - Short X

**Examples**
- Long position and short position sketches

**Stock market**
- trend market + momentum
- momentum = velocity of price change

**Timeframe nesting**
- Monthly → Daily → Hourly → 5 min
- For taking a 5 min trade, check hourly trend

**Dow Theory**
- Good stock:
  - Higher high
  - Higher low
  - M-RSI > 60
- Bad stock:
  - Lower high
  - Lower low
  - M-RSI < 60

**Candlestick patterns**
- Hammer
  - bullish
  - “price will go up from here”
- Hanging man
  - bearish


### 2) Normalized reading

This page shifts from isolated indicators into **market framing**.

#### 1. Types of equity participation
The notes divide activity into three buckets:

**Intraday**
- same-day trading
- long or short

**Swing**
- multi-day to multi-week trading
- note seems to emphasize long-side swing trading

**Long-term / investing**
- long only

The “short X” marks under swing and long-term are not universal market truths. They are best read as **course-specific preference**:
- intraday can be both-sided
- swing and investing are taught mostly from the long side

That matches later session summaries.

#### 2. Trend + momentum
The page says:

> Stock market = trend + momentum

and defines momentum as:

> velocity of price change

This is consistent with later strategy classes:
- trend tells direction
- momentum tells strength and speed

#### 3. Multiple timeframe logic
A very important note appears:

- Monthly → Daily → Hourly → 5 min
- If taking a 5-minute trade, check hourly trend

This is classic **top-down analysis**:
- higher timeframe provides bias
- lower timeframe provides execution

#### 4. Dow Theory shorthand
The page reduces trend quality to structure:

**Good stock**
- Higher Highs
- Higher Lows
- Monthly RSI > 60

**Bad stock**
- Lower Highs
- Lower Lows
- Monthly RSI < 60

This is very aligned with the later swing and trend-continuation notes.

#### 5. Candle pattern introduction
This page starts the candlestick section with:
- Hammer → bullish
- Hanging Man → bearish

The note “price will go up from here” is clearly shorthand for the hammer showing buying rejection from lower levels.

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to the candlestick and market-framing block: trade categories, Dow Theory style trend structure, and single/double/triple candle patterns.


---

## Page 5 — Class 3 continuation: Single-candle and double-candle patterns

### 1) Literal note-style OCR transcript

**Single-candle patterns**
- Inverted hammer → bullish
- Shooting star → bearish
- Standard doji → reversal
- Long-legged doji → reversal
- Dragonfly → bullish reversal
- Gravestone → bearish reversal
- 4-price doji
  - open = high = close = low

**Effectiveness note**
- bullish candle after up move → “very effective”
- bullish candle in wrong context → “less effective”
- “and vice versa”

**Marubozu**
- Bullish marubozu
- Bearish marubozu

**Double candlestick patterns**
- Bullish engulfing
- Bearish engulfing
- Harami (“pregnant woman” mnemonic)


### 2) Normalized reading

This page is a dense candlestick cheat sheet.

#### 1. Reversal candles
The note-set is trying to teach two things at once:
- what the candle looks like
- when it matters

The contextual note “very effective / less effective / vice versa” matters more than the names.

A candle is not powerful just because of its shape.  
Its usefulness depends on:
- where it appears
- what trend preceded it
- whether it appears at support/resistance or exhaustion

#### 2. Doji family
The page lists several doji variants:
- standard doji
- long-legged doji
- dragonfly doji
- gravestone doji
- four-price doji

The educational purpose is to show:
- indecision
- rejection
- exhaustion
- context-specific reversal risk

#### 3. Marubozu
A marubozu is a full-body candle with little or no wick, used to show strong directional control.

- bullish marubozu = strong buyer dominance
- bearish marubozu = strong seller dominance

#### 4. Double-candle patterns
The notes include:
- bullish engulfing
- bearish engulfing
- harami

The “pregnant woman” mnemonic is standard classroom shorthand for **harami**.

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to the candlestick and market-framing block: trade categories, Dow Theory style trend structure, and single/double/triple candle patterns.


---

## Page 6 — Class 3 to Class 4 transition

### 1) Literal note-style OCR transcript

**Triple candlestick patterns**
- Morning Star (Bullish)
- Evening Star (Bearish)

**20 days moving average strategy**
- Use when HHHL pattern (good stock)
- Take entry
- Stop loss lower than previous low
- “Exit when??”
- “Where green candle crosses 20 DMA after a higher low”

**Class 4**
1. Support & resistance
   - can be ascending / descending too

2. Fair Value Gap
   - Bullish FVG
   - Opposite is bearish
   - “at reversal point”

3. Breakout probability (expo)
- For institutions to make money, retail traders have to lose money
- Stop-loss hunting
- First they will hit stop-loss, then take the stock up


### 2) Normalized reading

This is a very important transition page.

#### 1. Triple-candle reversals
Two classical 3-candle reversals are listed:

- Morning Star → bullish reversal
- Evening Star → bearish reversal

These patterns prepare the student to think in terms of **sequence**, not only single candles.

#### 2. 20 DMA strategy
The handwritten logic appears to be:

- use only in strong-trend stocks
- strong stock = HHHL structure
- wait for a pullback
- enter when bullish candle reclaims / crosses 20 DMA after higher low
- stop-loss below previous low

This is a very standard trend-following pullback strategy.

The “Exit when??” note suggests the student had not fully captured the exit rule.

#### 3. Support and resistance
The note “can be ascending / descending too” is important.  
It means the teacher likely explained that support/resistance need not always be perfectly horizontal; they may also appear as sloping structures or channels.

#### 4. Fair Value Gap
The notes clearly mark:
- bullish FVG
- opposite is bearish
- often relevant near reversal / imbalance zones

Later session material does not center FVG heavily, so this page preserves the handwritten shorthand rather than over-expanding it.

#### 5. Stop-loss hunting / institutional behavior
This page contains a critical market-behavior idea:

> Institutions often take price into obvious stop-loss zones first, then move price in the intended direction.

That connects directly with later notes about:
- placing stops below swing low
- avoiding overly obvious levels
- waiting for better confirmation

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to the candlestick and market-framing block: trade categories, Dow Theory style trend structure, and single/double/triple candle patterns.
- Maps to Session 4 themes: support/resistance, order blocks, fair value gap, demand/supply zones, stop-loss hunting, and continuation structures.


---

## Page 7 — Class 4: Order blocks, demand/supply, pending-area concept, EMA

### 1) Literal note-style OCR transcript

4. Order block
- big candle crosses last swing bar
- reversal
- price falling
- big volume
- volume dry up
- may have to wait for days / months
- institutions moving in a staggered way

Supply zone / Demand zone sketched

5. Demand & Supply Zone
- Pending Area Concept
- We generally follow T+2 policy
- We don’t enter at T+3 or beyond
- Example:
  - Total corpus 1000 cr
  - Invested 300 cr
  - Pending 700 cr
  - Invested 400 cr
  - Pending 300 cr
- Pattern for demand
- Pattern for supply

Demand supply vs Support resistance
- Demand/supply: more test = weaker
- Support/resistance: more test = stronger

6. Exponential moving average
- latest → more weight
- 50 EMA over 200 EMA → Buy
- 50 EMA below 200 EMA → Sell


### 2) Normalized reading

This page contains some of the more useful structural thinking in the whole set.

#### 1. Order block idea
The notes suggest the teacher explained order blocks as:

- price falls into a zone
- a strong reversal candle appears
- volume spikes, then may dry up
- large players may accumulate in parts, not all at once
- the move may require patience over multiple bars/days

That fits the later session summary of order blocks as reversal-cluster zones.

#### 2. Demand/supply zone logic
The page distinguishes **zones** from lines.

There is also a capital-flow explanation using the “pending area concept”:
- institutions may want to deploy a large corpus
- not all buying happens in one shot
- some amount is invested, some remains pending
- therefore zones can be revisited

This is a useful interpretation:
- a zone is not magical
- it reflects incomplete or staged order execution

#### 3. T+2 and “do not enter at T+3”
This note is ambiguous, but the likely intended meaning is:
- a setup is strongest close to the original demand/supply event
- if too much time has passed, the edge decays

I would treat this as **medium-confidence shorthand**, not a rigid universal rule.

#### 4. Demand/supply vs support/resistance
This is one of the most interesting handwritten distinctions:

- **Demand/supply zone** → more tests = weaker
- **Support/resistance line** → more tests = stronger

This is not a universally accepted law, but it reflects a practical trading heuristic:

- repeated tapping into a zone consumes resting orders
- repeated recognition of a classical level makes the level more obvious to the market

#### 5. EMA crossover
The final section explains EMA as:
- more weight to latest prices
- faster than SMA for recent movement
- 50 EMA / 200 EMA directional cross used as trend filter

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to Session 4 themes: support/resistance, order blocks, fair value gap, demand/supply zones, stop-loss hunting, and continuation structures.


---

## Page 8 — Class 4 continuation: stop-loss placement, exits, continuation patterns

### 1) Literal note-style OCR transcript

- Always set stop-loss below swing low to avoid stop-loss hunting
- And set stop-loss below round figure

**When to sell?**
- Volatility stop (Vstop) indicator
- Hold as long as green

**Curvature notes**
- Deep U → more convincing
- shallow U → less convincing

**Saucer**
- not reversal pattern
- continuation pattern
- has to cross this line

**Patterns**
- Symmetrical triangle
- Ascending triangle
- Descending triangle


### 2) Normalized reading

This page is about **trade management and continuation structure**.

#### 1. Stop-loss placement
The notes give two practical rules:

- stop below swing low
- stop below round figure

The intent is to avoid:
- obvious retail clustering
- easy stop hunts near psychologically neat levels

#### 2. When to sell
The page gives one explicit exit tool:
- volatility stop / Vstop
- hold while indicator stays green

That ties into later pages where Supertrend and trailing logic are also used.

#### 3. Deep-U / saucer
The page visually compares:
- deep U = more convincing
- shallow curve = less convincing

Then it labels **saucer** as:
- not a reversal pattern
- continuation pattern

That is consistent with many momentum frameworks:
- rounded continuation after consolidation
- breakout over neckline / reference line confirms continuation

#### 4. Triangle patterns
The page finishes with three classic structures:

- symmetrical triangle
- ascending triangle
- descending triangle

These are continuation/breakout frameworks rather than isolated candle signals.

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to Session 4 themes: support/resistance, order blocks, fair value gap, demand/supply zones, stop-loss hunting, and continuation structures.


---

## Page 9 — Class 5: Trading system, RSI zones, risk-reward, Fibonacci, position sizing

### 1) Literal note-style OCR transcript

**Trading system**
- Stock selection
- Good strategy
- Position sizing
- Risk management

**Stock market = Trend + Momentum**

**RSI indicator**
- No trade zone
- RSI upper band (60)
- RSI lower band (40)
- momentum uptrend / momentum downtrend

**Risk Reward Ratio**
- If SL = R then target = 3R
- Price has to touch support/resistance or trendline, then only take trade

**Trendlines with breaks**
- check for green breaks & red breaks

**Fibonacci Retracement**
- common 50%
- minimum 33%
- maximum 62%
- if retracement > 62%, original trend is over
- gives idea about target when taking a trade

**Position sizing**
- Investing vs Trading
- Investing = long term / wealth
- Trading = short to medium term / income

**Risk**
- risk per trade = 2% of portfolio max

**Quantity formula**
- Quantity = (0.02 × portfolio size) / (Entry − Stop Loss)


### 2) Normalized reading

This is one of the strongest pages in the note-set.

#### 1. Trading system components
The page reduces the system to four immediate components:
- stock selection
- strategy
- position sizing
- risk management

Later summaries expand this further to include psychology and trailing.

#### 2. RSI zone model
The handwritten model appears to be:

- above 60 → bullish momentum zone
- below 40 → bearish momentum zone
- 40–60 → no-trade / low-conviction zone

This matches the summary logic better than the classic 70/30 retail default.

#### 3. Risk-reward
The page is explicit:

- define SL = R
- target = 3R

That means the course strongly favored **3:1 reward-to-risk framing**.

The note also says:
- only take trade when price touches structure (support/resistance or trendline)

That means entries are not supposed to happen in “empty air”.

#### 4. Fibonacci retracement
The handwriting says:
- common 50%
- minimum 33%
- maximum 62%

This differs from textbook Fibonacci levels, but in practice it is a simplified classroom range:
- one-third pullback
- half pullback
- deeper but still acceptable pullback near 62%

The note:
> if retracement > 62%, original trend is over

should be treated as a **heuristic**, not a law.

#### 5. Position sizing
This page correctly captures the core formula:

\[
\text{Quantity} = \frac{0.02 \times \text{Portfolio Size}}{\text{Entry - Stop Loss}}
\]

That is exactly aligned with the later session summary.

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to Session 5 themes: trading system design, RSI as a momentum filter, risk-reward, Fibonacci, position sizing, and trailing stop logic.


---

## Page 10 — Class 5 example and Class 6 strategy map

### 1) Literal note-style OCR transcript

**Quantity example**
- Entry = 100
- S.L. = 90
- Portfolio = 10 lakh
- Quantity (max) = 0.02 × 10,00,000 / (100 − 90) = 2000

**Trailing**
- As price moves up → move SL to NPNL
- (No profit no loss)
- Keep shifting SL like this

**Multi-bagger**
- grown multiple times
- How to identify multi-bagger stocks?
- Homework: what is common among multi-bagger stocks?

**Class 6**
- Strategy
  - Investment
  - Swing
  - Intraday

**1) Multi-bagger strategy (monthly candle)**
- One common pattern → sideways movement for many years
- Conversion of neutral/dead stock to a good stock
- Check out IPOs of 3–4 years or older
- Site: Chittorgarh.com
- Draw horizontal lines at highest & lowest
- for all the companies from 2005 to 2022
- Then wait for price to cross the highest line
- This is known as multi-bagger breakout
- Verify for momentum using RSI


### 2) Normalized reading

This page finishes the math from Class 5 and starts the investment-strategy block.

#### 1. Quantity worked example
The formula is applied exactly:
- 2% risk of ₹10 lakh = ₹20,000
- per-share risk = ₹10
- max quantity = 2000

This is high-confidence and consistent with the cleaner summary material.

#### 2. Trailing stop logic
The notes say:
- as price rises, shift stop-loss upward
- move to no-profit-no-loss first
- continue shifting

This is a simple way to teach **capital protection after confirmation**.

#### 3. Multi-bagger strategy — conceptual core
The page asks:
> what is common among multi-bagger stocks?

Then answers:
- years of sideways behavior
- “dead stock” becoming “good stock”
- breakout from a long base

That directly matches the later session summary for Session 6.

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to Session 5 themes: trading system design, RSI as a momentum filter, risk-reward, Fibonacci, position sizing, and trailing stop logic.
- Maps to Session 6 themes: investment strategies, multi-bagger breakout, monthly Bollinger Band strategy, month-end evaluation, and scanner-driven discipline.


---

## Page 11 — Class 6: Bollinger Band investment strategy and Class 7 swing setup

### 1) Literal note-style OCR transcript

**2) Bollinger Band Strategy**
- Use indicator: Bollinger Bands

**Price conditions**
- Price > 50 *(handwritten)*
- Daily volume > 100000
- Monthly RSI > 55 *(handwritten)*
- Monthly high crosses upper Bollinger

**How to know?**
- use scanner
- chartink.com/screener/bb-strategy

**Use strategy only on**
- last or penultimate day of the month

**Place your entry**
- 1% above high

**Stop-loss alternatives**
1. Middle band of Bollinger
2. Previous swing low (monthly)
3. Previous swing low (daily)
4. Supertrend (uptrend line)

**Class 7 swing strategies**
- We will use daily timeframe
- but first identify monthly RSI > 60
- (1) Buying in the dips
- Entry when RSI < 40
- Exit when RSI > 60
- crossing from below / crossing from above
- Continue to do stop-loss trailing daily
- Set first stop-loss at previous swing low


### 2) Normalized reading

This page is one of the places where the handwriting and the cleaner summary **partly conflict**.

#### High-confidence elements
These are consistent across both:
- Bollinger Band-based investment strategy
- monthly framework
- daily volume filter
- monthly RSI filter
- upper Bollinger Band breakout
- use scanner
- only evaluate near month-end
- entry 1% above trigger
- stop-loss can be swing-low-based or indicator-based

#### Ambiguous numeric conflict
The handwritten page says roughly:
- Price > 50
- Monthly RSI > 55

But the cleaned session summary says the more likely normalized conditions were:
- **Price ≥ 100**
- **Monthly RSI ≥ 50**

So the handwriting here should be treated as **compressed / possibly miscopied**.  
For actual normalized reconstruction, the safer version is:

- Price floor filter
- Volume > 1 lakh
- Monthly RSI in positive zone
- Monthly high crossing upper Bollinger Band
- month-end evaluation only
- 1% breakout buffer

#### Swing strategy note conflict
The page writes:
- monthly RSI > 60
- daily entry when RSI < 40
- exit when RSI > 60

But the cleaner swing summary describes the main setup more broadly as:
- monthly RSI ≥ 60
- shift to daily chart
- wait for dip/pullback
- enter on bullish resolution of the dip
- trail from daily swing structure

So the “RSI<40 / RSI>60” note was likely the student’s personal shorthand, not the complete formal rule.

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to Session 6 themes: investment strategies, multi-bagger breakout, monthly Bollinger Band strategy, month-end evaluation, and scanner-driven discipline.
- Maps to Session 7 themes: swing trading, monthly RSI 60 pre-filter, buying in the dips, Nifty tailwind, divergence, and cross strategy.


---

## Page 12 — Class 7: Nifty filter, divergence, cross strategy

### 1) Literal note-style OCR transcript

2. Bulls are slow and Bears are superfast

3. Nifty is the king of the jungle
- Stay with Nifty
- not a good time to take long position in M-60 stocks *(if Nifty weak, implied)*

4. Divergence
- disagreement between price & indicator
- Bullish divergence
- Bearish divergence

1. Trend reversal strategy
- conditions
- daily volume > 100k

2. Cross Strategy
- Place Bollinger Bands
- Look for green candle near the lower Bollinger Band
- Draw previous trendline (downward)
- Draw VWAP (check if it moves through the same zone)
- It works better if lower BB is trending upward
- basically momentum is upward, trend is momentarily downward


### 2) Normalized reading

This page aligns strongly with the Session 7 summary.

#### 1. Bulls slow, bears fast
This is a behavioral framing rule:
- uptrends often build gradually
- downtrends can collapse quickly

That affects:
- how one trails longs
- how fast one cuts breakdowns
- why dip-buying must still respect risk

#### 2. Stay with Nifty
The note says:
> Nifty is the king of the jungle

Meaning:
- broad-market direction matters
- do not force long trades if the index backdrop is against you

This is a major filter carried into later setups.

#### 3. Divergence
The page defines divergence correctly as:
- disagreement between price and indicator

Likely intended examples:
- bullish divergence = price weaker, RSI stronger
- bearish divergence = price stronger, RSI weaker

#### 4. Cross strategy
This page compresses the cross strategy very effectively:

- lower Bollinger Band interaction
- green candle appears nearby
- downward trendline is crossed
- VWAP is also reclaimed / intersected
- best when lower BB itself is not sloping down aggressively

That matches the later cleaned summary almost exactly.

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to Session 7 themes: swing trading, monthly RSI 60 pre-filter, buying in the dips, Nifty tailwind, divergence, and cross strategy.


---

## Page 13 — Class 8: progression logic, market context, momentum filters

### 1) Literal note-style OCR transcript

**Class 8**

Month 1,2 → 5%  
3,4 → 10%  
5,6 → 20%  
7,8 → 30%  
9,10 → 40%  
11,12 → 50%

- Money flows from impatient to patient

**SGX Nifty & GIFT Nifty**
- show early trends (most important)

**Oil price**
- inverse correlation with Nifty

**Gold price**
- inverse correlation with Nifty

**Dow Jones**
- direct correlation

**E-mini Dow Jones futures**
- direct correlation
- YM1!

**Moneycontrol**
- Market action
- 52-week high
- high momentum
- note daily / weekly / monthly frames

- See companies making QoQ & YoY profits
- profitability

4. Never buy at resistance, sell at support

5. Buy 15% above support level
- [support + 15% (resistance − support)] *(implied formula shorthand)*

**ATR indicator**
- Average true range
- (Target/Resistance − Entry) / ATR = no. of days required to reach target

1. Delivery percentage (NSE India website)
- should be > 45% at reversal

2. Volume should be > moving average

3. Closing should be above 5-day EMA

- If I want to trade during sideways movement *(written as a note)*


### 2) Normalized reading

This page mixes **context reading**, **stock selection**, and **trade quality filters**.

#### 1. “Money flows from impatient to patient”
This is more than motivation. It is the psychological anchor for:
- waiting
- discipline
- not chasing
- letting setups mature

#### 2. Pre-market context read
The page clearly identifies the market context checklist:
- SGX/GIFT Nifty for early domestic bias
- oil and gold as inverse risk-off cues
- Dow / E-mini Dow futures as direct global-equity cues

This aligns well with the cleaned Class 8 summary.

#### 3. Momentum + profitability
The page mixes technical and fundamental screening:
- 52-week high
- high momentum
- QoQ and YoY profit growth

That means the teacher was not recommending purely blind chart-chasing; there was some attempt to combine price behavior with improving business performance.

#### 4. Buy zone calculation
The line:
> Buy 15% above support level

likely means the trader should not buy exactly at support or exactly at resistance, but somewhere within a structured range using a measured zone.

A reasonable normalized interpretation is:
- define support and resistance
- calculate the band
- enter after price moves meaningfully away from support rather than at arbitrary midpoints

#### 5. Sideways-market breakout filters
The lower section gives practical breakout-quality filters:
- delivery >45%
- volume above average
- close above short-term EMA

These are very useful quality checks for range breakouts.

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to Session 8 themes: GIFT Nifty / Dow / gold / crude pre-market context, FII flow awareness, and ABC strategy.


---

## Page 14 — Class 8 continuation and Class 9 breakout framework

### 1) Literal note-style OCR transcript

**Optional condition**
- Check last 1 month data
- identify the highest delivery percentage date
- if entry candle’s closing is above that date’s closing
- then take entry

**Volume matrix**
- Price ↑ Volume ↑ → Bullish confirmation
- Price ↓ Volume ↑ → Bearish confirmation
- Price ↑ Volume ↓ → Weak uptrend
- Price ↓ Volume ↓ → Weak downtrend

- FII + → Bullish
- FII − → Bearish
- FII − , DII + → Resilient

**3) ABC Strategy**
- Average / 50 days SMA
- Lower Bollinger Band
- Green candle
- these things converge

**Class 9**
How to identify real breakout?

1. Big green candle
2. Body shall be at least 70%
3. Volume higher than previous day
4. Delivery > 35%
5. Close at least 1% above resistance level
6. Market condition shall be positive


### 2) Normalized reading

This page is strong and mostly clear.

#### 1. Highest-delivery-date filter
This is an advanced entry refinement:
- look back over recent period
- find the strongest delivery participation day
- use that close as a quality threshold

That is actually a pretty good institutional-interest filter.

#### 2. Volume-price relationship
This section is textbook market logic and very practical:

- price up + volume up = conviction
- price down + volume up = strong selling
- price up + volume down = weak move
- price down + volume down = weak decline

#### 3. FII / DII interpretation
The note:
- FII positive = bullish
- FII negative = bearish
- FII negative, DII positive = resilient

is a simplified but useful framework for Indian market context.

#### 4. ABC strategy
This page compresses the ABC setup into three converging elements:
- 50 SMA
- lower Bollinger Band
- green candle

That is very consistent with the cleaned Class 8 summary.

#### 5. Real breakout checklist
This is one of the highest-confidence sections in the whole note-set and matches the cleaned summary almost perfectly.

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to Session 8 themes: GIFT Nifty / Dow / gold / crude pre-market context, FII flow awareness, and ABC strategy.
- Maps to Session 9 themes: breakout rules, BTST, risk taxonomy, alpha-beta screening, trend continuation, and MA/EMA-based swing setups.


---

## Page 15 — Class 9: breakout probability, BTST, risk types, alpha-beta screener

### 1) Literal note-style OCR transcript

- If there is doubt, but subsequent reversal upward from previous resistance, then you can enter

**What increases breakout probability?**
- gap closing
- ranging / ramping action under resistance

5. BTST
- Buy Today Sell Tomorrow
- Moneycontrol → All stats → Top Gainers + Volume Shockers
- find common
- Not on Friday
- or any day before holiday
- or day before expiry
- Best to take trade in the first two weeks
- take trade in 2nd half, exit in 1st half

**Corporate risk**
- Market risk
- Credit risk
- Operational risk

**Systemic risk**
- non-diversifiable
- example: war

**Non-systematic risk**
- company-specific

6. tickertip / tickertape type screener
- stock screener
- start screening

**Alpha (α)**
- stock return − market return
- 15% or more

**Beta (β)**
- stock price volatility relative to market
- 0 to 1 or 1.5 *(handwriting unclear)*

- Safest → Large cap → then do fundamental analysis

- Keep every strategy separate


### 2) Normalized reading

This page joins several Session 9 concepts.

#### 1. Breakout probability increases when…
The page suggests two pre-breakout conditions:
- resistance is being approached repeatedly
- price compresses / ranges / ramps beneath resistance
- prior gap dynamics are resolving

That is structurally sensible. A compressed move beneath resistance often improves breakout odds.

#### 2. BTST workflow
The handwritten workflow is strong and practical:

- use Moneycontrol market statistics
- intersect top gainers and volume shockers
- avoid poor timing windows:
  - Friday
  - pre-holiday
  - pre-expiry

This closely matches the cleaner session summary.

#### 3. Risk classification
The page splits risk into:
- market risk
- credit risk
- operational risk
- systemic risk
- non-systematic risk

This is not just academic; it teaches the student that not all losses come from chart failure.

#### 4. Alpha and beta
The page gives:
- alpha = stock return minus market return
- beta = volatility relative to market

The “15% or more” line likely belongs to alpha screening.  
The safer large-cap-first note reflects an attempt to reduce noise.

#### 5. Keep every strategy separate
This is one of the best lines in the entire note set.

It means:
- do not mix rules from different systems
- do not contaminate one setup with another
- back-test and evaluate each edge independently

That is real process discipline.

---


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to Session 9 themes: breakout rules, BTST, risk taxonomy, alpha-beta screening, trend continuation, and MA/EMA-based swing setups.


---

## Page 16 — Class 9: trend continuation, SMA/EMA setups, mutual-fund idea sourcing

### 1) Literal note-style OCR transcript

7. Trend Continuation Strategy
- Monthly RSI > 60
- Green candle
- Daily close crossed
- Supertrend (7,2?) *(uncertain)*
- Close above green line is also OK

8. SMA Strategy (13–34)
- Use when 200 SMA is in uptrend
- Look for deep U cut
- then both continue uptrend

9. SMA strategy (44)
- 44 SMA should be in uptrend
- Price slightly crosses 44 SMA from up / then rebounds
- use as support

10. 9–15 EMA Strategy
- 9 cuts 15 from below
- and green candle above green supertrend
- in 4H chart
- should coincide

11. Best mutual funds in India
- choose diverse fund
- detailed portfolio analysis
- find common stocks
- then do fundamental analysis


### 2) Normalized reading

This page is a clean closing summary of advanced Session 9 ideas.

#### 1. Trend continuation strategy
The core logic is:

- monthly RSI > 60 for primary strength
- daily confirmation via green candle / trend indicator
- supertrend used as filter and trail

This directly matches the later summary.

#### 2. 13/34 SMA with 200 SMA
This is a classic trend-following setup:
- 200 SMA defines primary uptrend
- 13 and 34 SMA give tactical entry
- “deep U cut” likely means a healthy pullback/recovery structure rather than a flat crossover in chop

#### 3. 44 SMA strategy
The note suggests the stock:
- remains in uptrend
- pulls back into 44 SMA
- rebounds from it as dynamic support

That is a clean single-MA trend continuation framework.

#### 4. 9/15 EMA strategy on 4H
This is a faster swing version:
- 9 EMA crosses above 15 EMA
- supertrend is green
- 4-hour timeframe
- confluence required

#### 5. Mutual-fund-driven stock discovery
This is one of the smartest non-obvious ideas in the notes:
- start with diversified / quality funds
- study their detailed holdings
- find repeated common stocks
- only then do fundamental analysis

That means the fund manager’s portfolio is being used as a **pre-filtered idea universe**.

---

# Fully normalized class-by-class reconstruction

This section rewrites the notes as a cleaner study guide.

---

## Class 1 — Market foundations

### Core ideas
- Debt vs equity
- Funding ladder from private capital to public listing
- Primary market vs secondary market
- Role of stock exchanges
- NSE vs BSE basics
- Role of brokers and sub-brokers
- Demat, DP, trading account
- Technical vs fundamental analysis

### What a student should retain
- Primary market = issue of securities
- Secondary market = trading of listed securities
- Technical = price, chart, timing
- Fundamental = business, value, conviction

---

## Class 2 — Starter indicators and reversal patterns

### Core ideas
- Candle anatomy
- Moving average crossovers
- MACD crossover logic
- Head & shoulders
- Inverse head & shoulders
- Triple top / triple bottom
- V-reversal

### What a student should retain
- Indicators give clues, not certainty
- Structure matters more than isolated crosses
- Reversal patterns need neckline/level confirmation

---

## Class 3 — Trade types, momentum and candlestick language

### Core ideas
- Intraday vs swing vs investing
- Trend + momentum framing
- Top-down timeframes
- Dow Theory (HH-HL vs LH-LL)
- Hammer, hanging man, inverted hammer, shooting star
- Doji family
- Marubozu
- Engulfing and Harami
- Morning star / evening star
- 20 DMA pullback strategy

### What a student should retain
- Good stock = strong structure + supportive momentum
- Candles are context tools, not magic
- Pullback entries are stronger than random breakouts in the middle of nowhere

---

## Class 4 — Zones, order flow, and continuation structure

### Core ideas
- Support/resistance
- Fair value gap
- Breakout probability
- Stop-loss hunting
- Order blocks
- Demand/supply zones
- EMA crossover
- Stop placement
- Vstop / volatility stop
- Saucer
- Triangle patterns

### What a student should retain
- Think in zones, not single exact ticks
- Institutions often move in stages
- Obvious stops get hunted
- Not every bullish-looking curve is reversal; some are continuation structures

---

## Class 5 — Build the trading system

### Core ideas
- Trading system components
- RSI zones: above 60 / below 40
- Risk-reward
- Fibonacci retracement
- Position sizing formula
- Investing vs trading capital logic
- Trailing stop mechanics

### Essential formulas

#### Risk per trade
\[
\text{Risk per trade} = 2\% \text{ of portfolio}
\]

#### Position size
\[
\text{Quantity} = \frac{0.02 \times \text{Portfolio Size}}{\text{Entry - Stop Loss}}
\]

#### Reward-to-risk framing
If stop-loss distance = \( R \), then preferred target = \( 3R \)

### What a student should retain
- Never enter without entry, stop, target
- Risk is fixed first
- Quantity comes from risk, not from emotion

---

## Class 6 — Investment strategies

### Strategy 1: Multi-bagger breakout
- Look for years of sideways price action
- Prefer older listed stocks / past IPO cohorts
- Draw base boundaries
- Enter on decisive breakout of the upper boundary
- Confirm momentum using RSI
- Hold as long as structure remains intact

### Strategy 2: Monthly Bollinger Band breakout
- Use Bollinger Bands
- Use month-end / near month-end evaluation
- Use liquidity + price + momentum filters
- Enter 1% above trigger
- Trail with structure / band / supertrend

### What a student should retain
- Multi-baggers usually emerge from long boredom before strong trend
- Monthly setups demand patience
- Scanner-driven discipline matters

---

## Class 7 — Swing trading systems

### Strategy 1: Buying in the dips
- Monthly RSI > 60
- Shift to daily chart
- Wait for controlled pullback
- Enter on bullish resolution
- Stop below daily swing low
- Trail daily

### Strategic principles
- Bulls are slow, bears are fast
- Stay with Nifty
- Divergence is disagreement between price and indicator

### Strategy 2: Cross strategy
- Lower Bollinger Band interaction
- Green candle appears
- Downtrend line is broken
- VWAP is reclaimed
- Best when lower BB is not falling sharply

### What a student should retain
- Do not fight the broad index
- Swing entries are better after dips, not after emotional chasing
- Confluence matters

---

## Class 8 — Context, internals, and ABC strategy

### Context checklist
- GIFT / SGX Nifty
- Dow / E-mini Dow futures
- Gold
- Oil
- 52-week highs
- QoQ / YoY profitability
- FII / DII behavior
- Delivery percentage
- Volume vs average
- Close vs 5 EMA

### ABC strategy
- 50 SMA
- lower Bollinger Band
- green candle
- confluence around one zone

### What a student should retain
- Good setups improve when market context agrees
- Volume confirms price
- Delivery confirms seriousness
- FII/DII context adds bias quality

---

## Class 9 — Breakouts, BTST, screening, trend continuation

### Real breakout checklist
1. Big green candle
2. Body at least ~70% of total range
3. Volume above previous day
4. Delivery above threshold
5. Close at least 1% above resistance
6. Market condition positive

### BTST
- Use intersection of top gainers + volume shockers
- Avoid Friday / pre-holiday / pre-expiry
- Timing matters

### Risk concepts
- market risk
- credit risk
- operational risk
- systemic risk
- unsystematic risk

### Screening concepts
- alpha = stock return − market return
- beta = volatility relative to market
- prefer safer large-cap universes first

### Continuation systems
- Monthly RSI + Supertrend continuation
- 13/34 SMA with 200 SMA
- 44 SMA pullback rebound
- 9/15 EMA on 4H with Supertrend confirmation

### Mutual-fund stock idea workflow
- study diversified funds
- inspect holdings
- find repeated/common stocks
- then do fundamental analysis

---

# Key formulas and rules extracted from the handwritten notes

## 1. Position sizing
\[
\text{Quantity} = \frac{0.02 \times \text{Portfolio Size}}{\text{Entry - Stop Loss}}
\]

## 2. Risk cap
- Maximum risk per trade = **2% of portfolio**

## 3. Reward expectation
- Prefer **3R target** for **1R risk**

## 4. Fibonacci heuristic from notes
- shallow pullback ~ 33%
- common pullback ~ 50%
- deep but acceptable pullback ~ 62%
- beyond that, trend quality weakens materially

## 5. Breakout quality filters
- body strength
- volume confirmation
- delivery confirmation
- market condition positive
- close above resistance by buffer

---

# Ambiguities and corrections log

This section is important because the handwritten PDF is not perfectly literal.

## Likely ambiguous / inconsistent items

### 1. Bollinger Band price threshold
- Handwritten note suggests **Price > 50**
- Cleaner session summary suggests **Price ≥ 100**
- Treat the **price filter concept** as real, but the exact number as **uncertain in handwriting**

### 2. Monthly RSI threshold in BB strategy
- Handwriting suggests **Monthly RSI > 55**
- Cleaner summary suggests **Monthly RSI ≥ 50**
- Use **positive monthly RSI filter** as the reliable takeaway

### 3. Swing strategy daily RSI < 40 / > 60 rule
- Present in handwriting
- Cleaner summary frames the setup as **buying the dip after monthly RSI > 60**, not a pure daily RSI crossover system
- Treat the handwritten RSI lines as **student shorthand**, not necessarily the full official rule

### 4. “Oldest stock exchange” note
- Antwerp and Amsterdam are both written
- The intended meaning is historical origin vs oldest continuously existing exchange
- Do not use the line as an exam-grade historical citation without independent verification

### 5. Tickertape vs tickertip screener
- Handwriting is not fully clear
- Cleaner summary referenced a screener workflow for alpha/beta
- Treat the **alpha-beta screener concept** as reliable, not the exact site spelling from the note

### 6. Some portfolio / T+2 / pending-area logic
- The core idea of staggered institutional execution is clear
- The exact mechanics in the handwritten shorthand are not fully literal
- Best treated as **conceptual**, not rule-based

---

# Final reconstructed study sheet

If I had to compress the whole PDF into one clean professional summary, it would be this:

1. Learn the market structure first: debt, equity, primary, secondary, exchanges, brokers, demat, trading.
2. Understand charts visually: candles, moving averages, MACD, basic reversal structures.
3. Understand trend quality: HH-HL vs LH-LL, monthly RSI support, top-down timeframe alignment.
4. Learn candlestick and pattern context: do not read shapes in isolation.
5. Learn zones and liquidity: support/resistance, fair value gap, order block, demand/supply, stop-loss hunting.
6. Build a proper trading system: stock selection, strategy, position sizing, risk management, trailing.
7. Fix risk mathematically: 2% portfolio risk, quantity from entry-stop distance.
8. Distinguish investing from trading:
   - investing = patience + conviction + structural breakout
   - trading = shorter horizon + tighter management
9. For investment setups:
   - multi-year base breakout
   - Bollinger Band monthly breakout
10. For swing setups:
   - buy dips in strong stocks
   - use Nifty as directional filter
   - use divergence as supporting evidence
   - use cross strategy and ABC strategy for confluence
11. For breakouts:
   - require strong candle, strong volume, delivery confirmation, positive market context
12. For faster trades:
   - BTST only with careful timing
13. For screening:
   - use alpha, beta, large-cap preference, mutual-fund holding overlap
14. Keep each strategy separate. Do not mash them together.
15. The notes repeatedly imply the real edge is not “indicator discovery”; it is:
   - patience
   - discipline
   - context
   - structure
   - capital preservation

---

# Deliverable note

This is a **reconstructed digital study document**, not a verbatim legal-grade transcription of every handwritten stroke.  
For Classes 4–9, the reconstruction is materially strengthened by the uploaded summary/transcript files.  
For Classes 1–3, reconstruction relies more heavily on the handwritten pages themselves and later recaps.


### 3) Confidence / ambiguity notes

- No page-specific ambiguity note was explicitly recorded in the first-pass file. That does **not** mean the page is perfect; it only means there was no separate note written for it. Use the handwriting-aware bullets above as the raw source of truth.


### 4) Session mapping / context link

- Maps to the market-basics foundation: debt vs equity, primary vs secondary market, exchange/broker/demat structure, and technical vs fundamental split.
- Maps to the early indicator/pattern block: moving averages, MACD, reversal patterns, and chart-reading grammar.
- Maps to the candlestick and market-framing block: trade categories, Dow Theory style trend structure, and single/double/triple candle patterns.
- Maps to Session 4 themes: support/resistance, order blocks, fair value gap, demand/supply zones, stop-loss hunting, and continuation structures.
- Maps to Session 5 themes: trading system design, RSI as a momentum filter, risk-reward, Fibonacci, position sizing, and trailing stop logic.
- Maps to Session 6 themes: investment strategies, multi-bagger breakout, monthly Bollinger Band strategy, month-end evaluation, and scanner-driven discipline.
- Maps to Session 7 themes: swing trading, monthly RSI 60 pre-filter, buying in the dips, Nifty tailwind, divergence, and cross strategy.
- Maps to Session 8 themes: GIFT Nifty / Dow / gold / crude pre-market context, FII flow awareness, and ABC strategy.
- Maps to Session 9 themes: breakout rules, BTST, risk taxonomy, alpha-beta screening, trend continuation, and MA/EMA-based swing setups.


---


## Part B — Course-level conflict ledger

- **BSE company count, NSE company count, and historical exchange dates** are classroom notes and may be rough shorthand. Preserve them as written in the pagewise transcript, but do not treat every number as exam-grade exact.

- **Page 11 numeric thresholds** look noisier in handwriting than the cleaner strategy summary. The handwritten page appears to say **Price > 50** and **Monthly RSI > 55**, but the stronger session summary indicates the monthly BB strategy is taught with **Price ≥ ₹100**, **Volume ≥ 1 lakh**, **Monthly RSI ≥ 50**, and **Monthly high crossing upper Bollinger Band**. The handwriting likely compressed or miswrote the thresholds.

- **Page 12 numbering** is messy. The page is not actually in logical order on paper: the notes jump among “bulls are slow, bears are superfast”, “Nifty is king of jungle”, “divergence”, and the “cross strategy”. That disorder is a note-taking artifact, not a conceptual contradiction.

- **Page 13 month-by-month percentage ladder** should not be interpreted as guaranteed returns. It is motivational framing written in the notebook, not a validated performance table.

- **Page 16 Supertrend parameter** is not fully legible. The page seems to suggest a Supertrend setting written like **(7,2?)** or similar, but the exact parameter should not be asserted without the source chart/template.

- Across multiple pages, **annualized-return examples** are classroom framing devices. They are there to compare trading velocity against FD-style returns, not to promise that the strategy produces that CAGR.


## Part C — Full first-pass expanded reconstruction


# Stock Market Notes — Advanced OCR + Contextual Digital Reconstruction

## What this document is

This is a **cleaned, expanded, context-aware reconstruction** of the handwritten notes from the uploaded PDF **Stock Market Notes.pdf**.

It is **not a blind literal OCR dump**. The original PDF is handwritten and many points are compressed, abbreviated, or partially unclear. So this reconstruction does three things together:

1. **Reads the handwritten pages directly**
2. **Maps each page to the corresponding class/topic flow**
3. **Normalizes ambiguous shorthand using the uploaded WithArin session summaries/transcripts**

Where the handwriting and the session summaries **agree**, I treat the point as high-confidence.  
Where they **partly conflict**, I keep the note but flag it as **uncertain / likely shorthand / possibly miswritten**.

---

## Confidence model used in this reconstruction

- **High confidence**: clearly visible in handwriting and also supported by later session summaries
- **Medium confidence**: readable in handwriting, but abbreviated or not fully supported elsewhere
- **Low confidence / ambiguous**: partly legible, possibly miswritten, or conflicts with cleaner summary material

---

## Big-picture course structure reconstructed from the notes

The handwritten PDF appears to cover a compressed note-set for:

- **Class 1** — Market basics: debt vs equity, primary vs secondary market, stock exchanges, brokers, demat/trading accounts, technical vs fundamental analysis
- **Class 2** — Basic indicators and reversal patterns: moving averages, MACD, head & shoulders, inverse head & shoulders, triple top/bottom, V-reversal
- **Class 3** — Trade types, Dow Theory, momentum framing, candlestick patterns
- **Class 4** — Support/resistance, fair value gap, breakout probability, stop-loss hunting, order blocks, demand/supply zones, EMA, pattern continuation structures
- **Class 5** — Trading system design: RSI zones, risk-reward, Fibonacci retracement, position sizing, trailing stop
- **Class 6** — Investment strategies: multi-bagger breakout, Bollinger Band monthly strategy
- **Class 7** — Swing strategies: buying in the dips, bulls slow/bears fast, Nifty filter, divergence, cross strategy
- **Class 8** — Pre-market context, market internals, FII/DII/volume logic, ABC strategy
- **Class 9** — Real breakout identification, BTST, risk types, alpha/beta screening, trend continuation, SMA/EMA strategies, mutual-fund-based stock discovery

---

# Page-by-page OCR reconstruction

---

## Page 1 — Class 1: Market basics

### Clean OCR reconstruction

**Debt**
- Bond
- Debt funding instruments are implied as loan-like capital

**Equity**
- FFF / Friends, Family, Fools
- Angel
- Venture
- Private Equity
- IPO
- FPO
- Public

**Stock exchange structure**
- Listing
- Secondary market
- Stock exchange
- Primary market

**Historical notes**
- Oldest stock exchange → Antwerp (1460) *(as written in notes)*
- Oldest existing stock exchange → Amsterdam (1602)
- “Bourse” noted as exchange terminology

**Indian market structure**
- NSE (1992)
  - Most advanced
  - ~2700 companies
  - Nifty 50
- BSE (1875)
  - ~6000 companies
  - Sensex 30

**Intermediation chain**
- Stock exchange → Broker → Sub-broker → Retail trader

**Broker types**
- Full-fledged brokers
- Discount brokers

**3-in-1 account**
- Demat
- DP
- Trading

**Depositories**
- NSDL (linked in notes with NSE)
- CDSL (linked in notes with BSE)

**Analysis split**
- Technical
  - Visual
  - Short to medium term
  - Scalping / Intraday / Swing
  - TradingView
- Fundamental
  - Core
  - Long term
  - Value
  - Price
  - “Benefit / Cost” concept written under value

### Expanded digital reconstruction

This page is basically a **foundation map of the stock market ecosystem**.

#### 1. Debt vs Equity
The notes start by contrasting **debt** and **equity**.

- **Debt** means borrowed capital. A bond is the simplest example mentioned.
- **Equity** means ownership capital.

The equity funding ladder written in the notes follows the typical startup/company capital journey:

1. Friends, Family, Fools
2. Angel investors
3. Venture capital
4. Private equity
5. IPO / FPO
6. Public market participation

This is a rough progression from private capital to public listing.

#### 2. Primary market vs secondary market
The page clearly distinguishes:

- **Primary market** — where securities are issued for the first time (IPO, FPO)
- **Secondary market** — where already-issued securities trade between investors on an exchange

That is why “IPO/FPO” appears on the primary side, and “listing / stock exchange” on the secondary side.

#### 3. Exchange history
Two historical notes appear:

- Oldest stock exchange → Antwerp (1460)
- Oldest existing stock exchange → Amsterdam (1602)

The intent of the note is obvious: one is trying to capture the **historical roots of organized securities trading**.

#### 4. Indian exchanges
The notes compare NSE and BSE in a very classroom-style way:

**NSE**
- Newer
- More advanced technologically
- Associated with Nifty 50

**BSE**
- Older
- Much larger company count in note shorthand
- Associated with Sensex 30

This is a basic exam/interview-style comparison, not a full market microstructure discussion.

#### 5. Broker and account structure
The notes are trying to make a beginner understand that you do not trade “with the exchange directly”.

The chain is:
**Exchange → broker/intermediary → client**

And to operate practically, you need:

- **Trading account** — to place trades
- **Demat account** — to hold securities in electronic form
- **DP relationship** — depository participant connection to NSDL/CDSL

#### 6. Technical vs fundamental analysis
The page ends with a very important conceptual split:

**Technical analysis**
- price/chart based
- visual
- short to medium horizon
- suited for scalping, intraday, swing
- TradingView noted as platform

**Fundamental analysis**
- business/value based
- core/intrinsic understanding
- longer-term orientation
- distinction between **value** and **price**

This distinction matches the later session summaries: technical for structure/timing, fundamental for conviction and longer holding.

### OCR ambiguity note
There is a small boxed sketch near the center-left involving “investment / business / employment / self employment”-type terms, but the handwriting is too unclear to reliably reconstruct literally. I have not invented content there.

---

## Page 2 — Class 2: Basic indicators and reversal patterns

### Clean OCR reconstruction

Top-left candle anatomy:
- High
- Close/Open
- Open/Close
- Low

**Indicators**
1. Moving Average
   - “Normally based on closing price”
   - 9 SMA
   - 20 SMA
   - Buy signal on bullish cross
   - Sell signal on bearish cross
   - “Signal not trigger”

2. MACD
   - Moving Average Convergence Divergence
   - MACD line vs signal line
   - Buy / Sell depending on crossover

3. Head & Shoulder pattern
   - “a part of reversal pattern”
   - Shoulder
   - Head
   - Shoulder
   - Neckline
   - Breakdown / breakout marked
   - Band range = target range
   - “Watch 100 charts per week”

4. Inverse head and shoulder

### Expanded digital reconstruction

This page introduces a beginner to the idea that **indicators are aids, not standalone certainty machines**.

#### 1. Candle anatomy
The sketch at the top-left shows the four basic candle references:

- High
- Low
- Open
- Close

This is the visual grammar needed before talking about patterns.

#### 2. Moving average
The note says:

- “Moving average (normally based on closing price)”
- 9 SMA
- 20 SMA
- crossover gives buy/sell indication
- “signal not trigger”

That last line matters. The intent is:

> A moving average crossover can **alert** you to a possible shift, but it should not be treated as the only reason to enter.

That is consistent with the later classes, where trend, momentum, support/resistance, and confirmation are always layered.

#### 3. MACD
The handwritten note expands MACD correctly as:

**Moving Average Convergence Divergence**

The page shows:
- bullish crossover → buy
- bearish crossover → sell

Again, likely intended as a **signal layer**, not a complete system.

#### 4. Head and shoulders
The page clearly draws:
- left shoulder
- head
- right shoulder
- neckline

Then it marks:
- breakdown zone
- target range

This is standard head-and-shoulders logic:
- neckline break confirms the reversal
- target is often estimated using the distance from head to neckline, projected downward

The note “watch 100 charts per week” is basically practice advice: pattern recognition improves through repetition.

#### 5. Inverse head and shoulders
The page closes by introducing the bullish mirror image:
- inverse head and shoulders
- typically used as a bullish reversal pattern after decline

---

## Page 3 — Continuation of Class 2 patterns

### Clean OCR reconstruction

5. Triple top & bottom
- top / bottom labels shown
- target projection drawn

6. V-reversal
- “one spike”

### Expanded digital reconstruction

This page is short but important.

#### 1. Triple top / triple bottom
The drawing suggests:
- repeated resistance tests on top
- repeated support tests on bottom
- eventual breakout/breakdown
- target projection from the range

Triple top usually implies bearish reversal if support breaks.  
Triple bottom usually implies bullish reversal if resistance breaks.

#### 2. V-reversal
The note “one spike” is shorthand for a **sharp, fast reversal without long consolidation**.

That usually means:
- not much time to accumulate
- fast sentiment shift
- harder entries if one is waiting for textbook pullbacks

---

## Page 4 — Class 3: Trade categories, trend, momentum, Dow Theory

### Clean OCR reconstruction

**Equity market trades**
- Intraday
  - Long or short
- Swing
  - Long ✓
  - Short X *(as written)*
- Long / investing
  - Long ✓
  - Short X

**Examples**
- Long position and short position sketches

**Stock market**
- trend market + momentum
- momentum = velocity of price change

**Timeframe nesting**
- Monthly → Daily → Hourly → 5 min
- For taking a 5 min trade, check hourly trend

**Dow Theory**
- Good stock:
  - Higher high
  - Higher low
  - M-RSI > 60
- Bad stock:
  - Lower high
  - Lower low
  - M-RSI < 60

**Candlestick patterns**
- Hammer
  - bullish
  - “price will go up from here”
- Hanging man
  - bearish

### Expanded digital reconstruction

This page shifts from isolated indicators into **market framing**.

#### 1. Types of equity participation
The notes divide activity into three buckets:

**Intraday**
- same-day trading
- long or short

**Swing**
- multi-day to multi-week trading
- note seems to emphasize long-side swing trading

**Long-term / investing**
- long only

The “short X” marks under swing and long-term are not universal market truths. They are best read as **course-specific preference**:
- intraday can be both-sided
- swing and investing are taught mostly from the long side

That matches later session summaries.

#### 2. Trend + momentum
The page says:

> Stock market = trend + momentum

and defines momentum as:

> velocity of price change

This is consistent with later strategy classes:
- trend tells direction
- momentum tells strength and speed

#### 3. Multiple timeframe logic
A very important note appears:

- Monthly → Daily → Hourly → 5 min
- If taking a 5-minute trade, check hourly trend

This is classic **top-down analysis**:
- higher timeframe provides bias
- lower timeframe provides execution

#### 4. Dow Theory shorthand
The page reduces trend quality to structure:

**Good stock**
- Higher Highs
- Higher Lows
- Monthly RSI > 60

**Bad stock**
- Lower Highs
- Lower Lows
- Monthly RSI < 60

This is very aligned with the later swing and trend-continuation notes.

#### 5. Candle pattern introduction
This page starts the candlestick section with:
- Hammer → bullish
- Hanging Man → bearish

The note “price will go up from here” is clearly shorthand for the hammer showing buying rejection from lower levels.

---

## Page 5 — Class 3 continuation: Single-candle and double-candle patterns

### Clean OCR reconstruction

**Single-candle patterns**
- Inverted hammer → bullish
- Shooting star → bearish
- Standard doji → reversal
- Long-legged doji → reversal
- Dragonfly → bullish reversal
- Gravestone → bearish reversal
- 4-price doji
  - open = high = close = low

**Effectiveness note**
- bullish candle after up move → “very effective”
- bullish candle in wrong context → “less effective”
- “and vice versa”

**Marubozu**
- Bullish marubozu
- Bearish marubozu

**Double candlestick patterns**
- Bullish engulfing
- Bearish engulfing
- Harami (“pregnant woman” mnemonic)

### Expanded digital reconstruction

This page is a dense candlestick cheat sheet.

#### 1. Reversal candles
The note-set is trying to teach two things at once:
- what the candle looks like
- when it matters

The contextual note “very effective / less effective / vice versa” matters more than the names.

A candle is not powerful just because of its shape.  
Its usefulness depends on:
- where it appears
- what trend preceded it
- whether it appears at support/resistance or exhaustion

#### 2. Doji family
The page lists several doji variants:
- standard doji
- long-legged doji
- dragonfly doji
- gravestone doji
- four-price doji

The educational purpose is to show:
- indecision
- rejection
- exhaustion
- context-specific reversal risk

#### 3. Marubozu
A marubozu is a full-body candle with little or no wick, used to show strong directional control.

- bullish marubozu = strong buyer dominance
- bearish marubozu = strong seller dominance

#### 4. Double-candle patterns
The notes include:
- bullish engulfing
- bearish engulfing
- harami

The “pregnant woman” mnemonic is standard classroom shorthand for **harami**.

---

## Page 6 — Class 3 to Class 4 transition

### Clean OCR reconstruction

**Triple candlestick patterns**
- Morning Star (Bullish)
- Evening Star (Bearish)

**20 days moving average strategy**
- Use when HHHL pattern (good stock)
- Take entry
- Stop loss lower than previous low
- “Exit when??”
- “Where green candle crosses 20 DMA after a higher low”

**Class 4**
1. Support & resistance
   - can be ascending / descending too

2. Fair Value Gap
   - Bullish FVG
   - Opposite is bearish
   - “at reversal point”

3. Breakout probability (expo)
- For institutions to make money, retail traders have to lose money
- Stop-loss hunting
- First they will hit stop-loss, then take the stock up

### Expanded digital reconstruction

This is a very important transition page.

#### 1. Triple-candle reversals
Two classical 3-candle reversals are listed:

- Morning Star → bullish reversal
- Evening Star → bearish reversal

These patterns prepare the student to think in terms of **sequence**, not only single candles.

#### 2. 20 DMA strategy
The handwritten logic appears to be:

- use only in strong-trend stocks
- strong stock = HHHL structure
- wait for a pullback
- enter when bullish candle reclaims / crosses 20 DMA after higher low
- stop-loss below previous low

This is a very standard trend-following pullback strategy.

The “Exit when??” note suggests the student had not fully captured the exit rule.

#### 3. Support and resistance
The note “can be ascending / descending too” is important.  
It means the teacher likely explained that support/resistance need not always be perfectly horizontal; they may also appear as sloping structures or channels.

#### 4. Fair Value Gap
The notes clearly mark:
- bullish FVG
- opposite is bearish
- often relevant near reversal / imbalance zones

Later session material does not center FVG heavily, so this page preserves the handwritten shorthand rather than over-expanding it.

#### 5. Stop-loss hunting / institutional behavior
This page contains a critical market-behavior idea:

> Institutions often take price into obvious stop-loss zones first, then move price in the intended direction.

That connects directly with later notes about:
- placing stops below swing low
- avoiding overly obvious levels
- waiting for better confirmation

---

## Page 7 — Class 4: Order blocks, demand/supply, pending-area concept, EMA

### Clean OCR reconstruction

4. Order block
- big candle crosses last swing bar
- reversal
- price falling
- big volume
- volume dry up
- may have to wait for days / months
- institutions moving in a staggered way

Supply zone / Demand zone sketched

5. Demand & Supply Zone
- Pending Area Concept
- We generally follow T+2 policy
- We don’t enter at T+3 or beyond
- Example:
  - Total corpus 1000 cr
  - Invested 300 cr
  - Pending 700 cr
  - Invested 400 cr
  - Pending 300 cr
- Pattern for demand
- Pattern for supply

Demand supply vs Support resistance
- Demand/supply: more test = weaker
- Support/resistance: more test = stronger

6. Exponential moving average
- latest → more weight
- 50 EMA over 200 EMA → Buy
- 50 EMA below 200 EMA → Sell

### Expanded digital reconstruction

This page contains some of the more useful structural thinking in the whole set.

#### 1. Order block idea
The notes suggest the teacher explained order blocks as:

- price falls into a zone
- a strong reversal candle appears
- volume spikes, then may dry up
- large players may accumulate in parts, not all at once
- the move may require patience over multiple bars/days

That fits the later session summary of order blocks as reversal-cluster zones.

#### 2. Demand/supply zone logic
The page distinguishes **zones** from lines.

There is also a capital-flow explanation using the “pending area concept”:
- institutions may want to deploy a large corpus
- not all buying happens in one shot
- some amount is invested, some remains pending
- therefore zones can be revisited

This is a useful interpretation:
- a zone is not magical
- it reflects incomplete or staged order execution

#### 3. T+2 and “do not enter at T+3”
This note is ambiguous, but the likely intended meaning is:
- a setup is strongest close to the original demand/supply event
- if too much time has passed, the edge decays

I would treat this as **medium-confidence shorthand**, not a rigid universal rule.

#### 4. Demand/supply vs support/resistance
This is one of the most interesting handwritten distinctions:

- **Demand/supply zone** → more tests = weaker
- **Support/resistance line** → more tests = stronger

This is not a universally accepted law, but it reflects a practical trading heuristic:

- repeated tapping into a zone consumes resting orders
- repeated recognition of a classical level makes the level more obvious to the market

#### 5. EMA crossover
The final section explains EMA as:
- more weight to latest prices
- faster than SMA for recent movement
- 50 EMA / 200 EMA directional cross used as trend filter

---

## Page 8 — Class 4 continuation: stop-loss placement, exits, continuation patterns

### Clean OCR reconstruction

- Always set stop-loss below swing low to avoid stop-loss hunting
- And set stop-loss below round figure

**When to sell?**
- Volatility stop (Vstop) indicator
- Hold as long as green

**Curvature notes**
- Deep U → more convincing
- shallow U → less convincing

**Saucer**
- not reversal pattern
- continuation pattern
- has to cross this line

**Patterns**
- Symmetrical triangle
- Ascending triangle
- Descending triangle

### Expanded digital reconstruction

This page is about **trade management and continuation structure**.

#### 1. Stop-loss placement
The notes give two practical rules:

- stop below swing low
- stop below round figure

The intent is to avoid:
- obvious retail clustering
- easy stop hunts near psychologically neat levels

#### 2. When to sell
The page gives one explicit exit tool:
- volatility stop / Vstop
- hold while indicator stays green

That ties into later pages where Supertrend and trailing logic are also used.

#### 3. Deep-U / saucer
The page visually compares:
- deep U = more convincing
- shallow curve = less convincing

Then it labels **saucer** as:
- not a reversal pattern
- continuation pattern

That is consistent with many momentum frameworks:
- rounded continuation after consolidation
- breakout over neckline / reference line confirms continuation

#### 4. Triangle patterns
The page finishes with three classic structures:

- symmetrical triangle
- ascending triangle
- descending triangle

These are continuation/breakout frameworks rather than isolated candle signals.

---

## Page 9 — Class 5: Trading system, RSI zones, risk-reward, Fibonacci, position sizing

### Clean OCR reconstruction

**Trading system**
- Stock selection
- Good strategy
- Position sizing
- Risk management

**Stock market = Trend + Momentum**

**RSI indicator**
- No trade zone
- RSI upper band (60)
- RSI lower band (40)
- momentum uptrend / momentum downtrend

**Risk Reward Ratio**
- If SL = R then target = 3R
- Price has to touch support/resistance or trendline, then only take trade

**Trendlines with breaks**
- check for green breaks & red breaks

**Fibonacci Retracement**
- common 50%
- minimum 33%
- maximum 62%
- if retracement > 62%, original trend is over
- gives idea about target when taking a trade

**Position sizing**
- Investing vs Trading
- Investing = long term / wealth
- Trading = short to medium term / income

**Risk**
- risk per trade = 2% of portfolio max

**Quantity formula**
- Quantity = (0.02 × portfolio size) / (Entry − Stop Loss)

### Expanded digital reconstruction

This is one of the strongest pages in the note-set.

#### 1. Trading system components
The page reduces the system to four immediate components:
- stock selection
- strategy
- position sizing
- risk management

Later summaries expand this further to include psychology and trailing.

#### 2. RSI zone model
The handwritten model appears to be:

- above 60 → bullish momentum zone
- below 40 → bearish momentum zone
- 40–60 → no-trade / low-conviction zone

This matches the summary logic better than the classic 70/30 retail default.

#### 3. Risk-reward
The page is explicit:

- define SL = R
- target = 3R

That means the course strongly favored **3:1 reward-to-risk framing**.

The note also says:
- only take trade when price touches structure (support/resistance or trendline)

That means entries are not supposed to happen in “empty air”.

#### 4. Fibonacci retracement
The handwriting says:
- common 50%
- minimum 33%
- maximum 62%

This differs from textbook Fibonacci levels, but in practice it is a simplified classroom range:
- one-third pullback
- half pullback
- deeper but still acceptable pullback near 62%

The note:
> if retracement > 62%, original trend is over

should be treated as a **heuristic**, not a law.

#### 5. Position sizing
This page correctly captures the core formula:

\[
\text{Quantity} = \frac{0.02 \times \text{Portfolio Size}}{\text{Entry - Stop Loss}}
\]

That is exactly aligned with the later session summary.

---

## Page 10 — Class 5 example and Class 6 strategy map

### Clean OCR reconstruction

**Quantity example**
- Entry = 100
- S.L. = 90
- Portfolio = 10 lakh
- Quantity (max) = 0.02 × 10,00,000 / (100 − 90) = 2000

**Trailing**
- As price moves up → move SL to NPNL
- (No profit no loss)
- Keep shifting SL like this

**Multi-bagger**
- grown multiple times
- How to identify multi-bagger stocks?
- Homework: what is common among multi-bagger stocks?

**Class 6**
- Strategy
  - Investment
  - Swing
  - Intraday

**1) Multi-bagger strategy (monthly candle)**
- One common pattern → sideways movement for many years
- Conversion of neutral/dead stock to a good stock
- Check out IPOs of 3–4 years or older
- Site: Chittorgarh.com
- Draw horizontal lines at highest & lowest
- for all the companies from 2005 to 2022
- Then wait for price to cross the highest line
- This is known as multi-bagger breakout
- Verify for momentum using RSI

### Expanded digital reconstruction

This page finishes the math from Class 5 and starts the investment-strategy block.

#### 1. Quantity worked example
The formula is applied exactly:
- 2% risk of ₹10 lakh = ₹20,000
- per-share risk = ₹10
- max quantity = 2000

This is high-confidence and consistent with the cleaner summary material.

#### 2. Trailing stop logic
The notes say:
- as price rises, shift stop-loss upward
- move to no-profit-no-loss first
- continue shifting

This is a simple way to teach **capital protection after confirmation**.

#### 3. Multi-bagger strategy — conceptual core
The page asks:
> what is common among multi-bagger stocks?

Then answers:
- years of sideways behavior
- “dead stock” becoming “good stock”
- breakout from a long base

That directly matches the later session summary for Session 6.

---

## Page 11 — Class 6: Bollinger Band investment strategy and Class 7 swing setup

### Clean OCR reconstruction

**2) Bollinger Band Strategy**
- Use indicator: Bollinger Bands

**Price conditions**
- Price > 50 *(handwritten)*
- Daily volume > 100000
- Monthly RSI > 55 *(handwritten)*
- Monthly high crosses upper Bollinger

**How to know?**
- use scanner
- chartink.com/screener/bb-strategy

**Use strategy only on**
- last or penultimate day of the month

**Place your entry**
- 1% above high

**Stop-loss alternatives**
1. Middle band of Bollinger
2. Previous swing low (monthly)
3. Previous swing low (daily)
4. Supertrend (uptrend line)

**Class 7 swing strategies**
- We will use daily timeframe
- but first identify monthly RSI > 60
- (1) Buying in the dips
- Entry when RSI < 40
- Exit when RSI > 60
- crossing from below / crossing from above
- Continue to do stop-loss trailing daily
- Set first stop-loss at previous swing low

### Expanded digital reconstruction

This page is one of the places where the handwriting and the cleaner summary **partly conflict**.

#### High-confidence elements
These are consistent across both:
- Bollinger Band-based investment strategy
- monthly framework
- daily volume filter
- monthly RSI filter
- upper Bollinger Band breakout
- use scanner
- only evaluate near month-end
- entry 1% above trigger
- stop-loss can be swing-low-based or indicator-based

#### Ambiguous numeric conflict
The handwritten page says roughly:
- Price > 50
- Monthly RSI > 55

But the cleaned session summary says the more likely normalized conditions were:
- **Price ≥ 100**
- **Monthly RSI ≥ 50**

So the handwriting here should be treated as **compressed / possibly miscopied**.  
For actual normalized reconstruction, the safer version is:

- Price floor filter
- Volume > 1 lakh
- Monthly RSI in positive zone
- Monthly high crossing upper Bollinger Band
- month-end evaluation only
- 1% breakout buffer

#### Swing strategy note conflict
The page writes:
- monthly RSI > 60
- daily entry when RSI < 40
- exit when RSI > 60

But the cleaner swing summary describes the main setup more broadly as:
- monthly RSI ≥ 60
- shift to daily chart
- wait for dip/pullback
- enter on bullish resolution of the dip
- trail from daily swing structure

So the “RSI<40 / RSI>60” note was likely the student’s personal shorthand, not the complete formal rule.

---

## Page 12 — Class 7: Nifty filter, divergence, cross strategy

### Clean OCR reconstruction

2. Bulls are slow and Bears are superfast

3. Nifty is the king of the jungle
- Stay with Nifty
- not a good time to take long position in M-60 stocks *(if Nifty weak, implied)*

4. Divergence
- disagreement between price & indicator
- Bullish divergence
- Bearish divergence

1. Trend reversal strategy
- conditions
- daily volume > 100k

2. Cross Strategy
- Place Bollinger Bands
- Look for green candle near the lower Bollinger Band
- Draw previous trendline (downward)
- Draw VWAP (check if it moves through the same zone)
- It works better if lower BB is trending upward
- basically momentum is upward, trend is momentarily downward

### Expanded digital reconstruction

This page aligns strongly with the Session 7 summary.

#### 1. Bulls slow, bears fast
This is a behavioral framing rule:
- uptrends often build gradually
- downtrends can collapse quickly

That affects:
- how one trails longs
- how fast one cuts breakdowns
- why dip-buying must still respect risk

#### 2. Stay with Nifty
The note says:
> Nifty is the king of the jungle

Meaning:
- broad-market direction matters
- do not force long trades if the index backdrop is against you

This is a major filter carried into later setups.

#### 3. Divergence
The page defines divergence correctly as:
- disagreement between price and indicator

Likely intended examples:
- bullish divergence = price weaker, RSI stronger
- bearish divergence = price stronger, RSI weaker

#### 4. Cross strategy
This page compresses the cross strategy very effectively:

- lower Bollinger Band interaction
- green candle appears nearby
- downward trendline is crossed
- VWAP is also reclaimed / intersected
- best when lower BB itself is not sloping down aggressively

That matches the later cleaned summary almost exactly.

---

## Page 13 — Class 8: progression logic, market context, momentum filters

### Clean OCR reconstruction

**Class 8**

Month 1,2 → 5%  
3,4 → 10%  
5,6 → 20%  
7,8 → 30%  
9,10 → 40%  
11,12 → 50%

- Money flows from impatient to patient

**SGX Nifty & GIFT Nifty**
- show early trends (most important)

**Oil price**
- inverse correlation with Nifty

**Gold price**
- inverse correlation with Nifty

**Dow Jones**
- direct correlation

**E-mini Dow Jones futures**
- direct correlation
- YM1!

**Moneycontrol**
- Market action
- 52-week high
- high momentum
- note daily / weekly / monthly frames

- See companies making QoQ & YoY profits
- profitability

4. Never buy at resistance, sell at support

5. Buy 15% above support level
- [support + 15% (resistance − support)] *(implied formula shorthand)*

**ATR indicator**
- Average true range
- (Target/Resistance − Entry) / ATR = no. of days required to reach target

1. Delivery percentage (NSE India website)
- should be > 45% at reversal

2. Volume should be > moving average

3. Closing should be above 5-day EMA

- If I want to trade during sideways movement *(written as a note)*

### Expanded digital reconstruction

This page mixes **context reading**, **stock selection**, and **trade quality filters**.

#### 1. “Money flows from impatient to patient”
This is more than motivation. It is the psychological anchor for:
- waiting
- discipline
- not chasing
- letting setups mature

#### 2. Pre-market context read
The page clearly identifies the market context checklist:
- SGX/GIFT Nifty for early domestic bias
- oil and gold as inverse risk-off cues
- Dow / E-mini Dow futures as direct global-equity cues

This aligns well with the cleaned Class 8 summary.

#### 3. Momentum + profitability
The page mixes technical and fundamental screening:
- 52-week high
- high momentum
- QoQ and YoY profit growth

That means the teacher was not recommending purely blind chart-chasing; there was some attempt to combine price behavior with improving business performance.

#### 4. Buy zone calculation
The line:
> Buy 15% above support level

likely means the trader should not buy exactly at support or exactly at resistance, but somewhere within a structured range using a measured zone.

A reasonable normalized interpretation is:
- define support and resistance
- calculate the band
- enter after price moves meaningfully away from support rather than at arbitrary midpoints

#### 5. Sideways-market breakout filters
The lower section gives practical breakout-quality filters:
- delivery >45%
- volume above average
- close above short-term EMA

These are very useful quality checks for range breakouts.

---

## Page 14 — Class 8 continuation and Class 9 breakout framework

### Clean OCR reconstruction

**Optional condition**
- Check last 1 month data
- identify the highest delivery percentage date
- if entry candle’s closing is above that date’s closing
- then take entry

**Volume matrix**
- Price ↑ Volume ↑ → Bullish confirmation
- Price ↓ Volume ↑ → Bearish confirmation
- Price ↑ Volume ↓ → Weak uptrend
- Price ↓ Volume ↓ → Weak downtrend

- FII + → Bullish
- FII − → Bearish
- FII − , DII + → Resilient

**3) ABC Strategy**
- Average / 50 days SMA
- Lower Bollinger Band
- Green candle
- these things converge

**Class 9**
How to identify real breakout?

1. Big green candle
2. Body shall be at least 70%
3. Volume higher than previous day
4. Delivery > 35%
5. Close at least 1% above resistance level
6. Market condition shall be positive

### Expanded digital reconstruction

This page is strong and mostly clear.

#### 1. Highest-delivery-date filter
This is an advanced entry refinement:
- look back over recent period
- find the strongest delivery participation day
- use that close as a quality threshold

That is actually a pretty good institutional-interest filter.

#### 2. Volume-price relationship
This section is textbook market logic and very practical:

- price up + volume up = conviction
- price down + volume up = strong selling
- price up + volume down = weak move
- price down + volume down = weak decline

#### 3. FII / DII interpretation
The note:
- FII positive = bullish
- FII negative = bearish
- FII negative, DII positive = resilient

is a simplified but useful framework for Indian market context.

#### 4. ABC strategy
This page compresses the ABC setup into three converging elements:
- 50 SMA
- lower Bollinger Band
- green candle

That is very consistent with the cleaned Class 8 summary.

#### 5. Real breakout checklist
This is one of the highest-confidence sections in the whole note-set and matches the cleaned summary almost perfectly.

---

## Page 15 — Class 9: breakout probability, BTST, risk types, alpha-beta screener

### Clean OCR reconstruction

- If there is doubt, but subsequent reversal upward from previous resistance, then you can enter

**What increases breakout probability?**
- gap closing
- ranging / ramping action under resistance

5. BTST
- Buy Today Sell Tomorrow
- Moneycontrol → All stats → Top Gainers + Volume Shockers
- find common
- Not on Friday
- or any day before holiday
- or day before expiry
- Best to take trade in the first two weeks
- take trade in 2nd half, exit in 1st half

**Corporate risk**
- Market risk
- Credit risk
- Operational risk

**Systemic risk**
- non-diversifiable
- example: war

**Non-systematic risk**
- company-specific

6. tickertip / tickertape type screener
- stock screener
- start screening

**Alpha (α)**
- stock return − market return
- 15% or more

**Beta (β)**
- stock price volatility relative to market
- 0 to 1 or 1.5 *(handwriting unclear)*

- Safest → Large cap → then do fundamental analysis

- Keep every strategy separate

### Expanded digital reconstruction

This page joins several Session 9 concepts.

#### 1. Breakout probability increases when…
The page suggests two pre-breakout conditions:
- resistance is being approached repeatedly
- price compresses / ranges / ramps beneath resistance
- prior gap dynamics are resolving

That is structurally sensible. A compressed move beneath resistance often improves breakout odds.

#### 2. BTST workflow
The handwritten workflow is strong and practical:

- use Moneycontrol market statistics
- intersect top gainers and volume shockers
- avoid poor timing windows:
  - Friday
  - pre-holiday
  - pre-expiry

This closely matches the cleaner session summary.

#### 3. Risk classification
The page splits risk into:
- market risk
- credit risk
- operational risk
- systemic risk
- non-systematic risk

This is not just academic; it teaches the student that not all losses come from chart failure.

#### 4. Alpha and beta
The page gives:
- alpha = stock return minus market return
- beta = volatility relative to market

The “15% or more” line likely belongs to alpha screening.  
The safer large-cap-first note reflects an attempt to reduce noise.

#### 5. Keep every strategy separate
This is one of the best lines in the entire note set.

It means:
- do not mix rules from different systems
- do not contaminate one setup with another
- back-test and evaluate each edge independently

That is real process discipline.

---

## Page 16 — Class 9: trend continuation, SMA/EMA setups, mutual-fund idea sourcing

### Clean OCR reconstruction

7. Trend Continuation Strategy
- Monthly RSI > 60
- Green candle
- Daily close crossed
- Supertrend (7,2?) *(uncertain)*
- Close above green line is also OK

8. SMA Strategy (13–34)
- Use when 200 SMA is in uptrend
- Look for deep U cut
- then both continue uptrend

9. SMA strategy (44)
- 44 SMA should be in uptrend
- Price slightly crosses 44 SMA from up / then rebounds
- use as support

10. 9–15 EMA Strategy
- 9 cuts 15 from below
- and green candle above green supertrend
- in 4H chart
- should coincide

11. Best mutual funds in India
- choose diverse fund
- detailed portfolio analysis
- find common stocks
- then do fundamental analysis

### Expanded digital reconstruction

This page is a clean closing summary of advanced Session 9 ideas.

#### 1. Trend continuation strategy
The core logic is:

- monthly RSI > 60 for primary strength
- daily confirmation via green candle / trend indicator
- supertrend used as filter and trail

This directly matches the later summary.

#### 2. 13/34 SMA with 200 SMA
This is a classic trend-following setup:
- 200 SMA defines primary uptrend
- 13 and 34 SMA give tactical entry
- “deep U cut” likely means a healthy pullback/recovery structure rather than a flat crossover in chop

#### 3. 44 SMA strategy
The note suggests the stock:
- remains in uptrend
- pulls back into 44 SMA
- rebounds from it as dynamic support

That is a clean single-MA trend continuation framework.

#### 4. 9/15 EMA strategy on 4H
This is a faster swing version:
- 9 EMA crosses above 15 EMA
- supertrend is green
- 4-hour timeframe
- confluence required

#### 5. Mutual-fund-driven stock discovery
This is one of the smartest non-obvious ideas in the notes:
- start with diversified / quality funds
- study their detailed holdings
- find repeated common stocks
- only then do fundamental analysis

That means the fund manager’s portfolio is being used as a **pre-filtered idea universe**.

---

# Fully normalized class-by-class reconstruction

This section rewrites the notes as a cleaner study guide.

---

## Class 1 — Market foundations

### Core ideas
- Debt vs equity
- Funding ladder from private capital to public listing
- Primary market vs secondary market
- Role of stock exchanges
- NSE vs BSE basics
- Role of brokers and sub-brokers
- Demat, DP, trading account
- Technical vs fundamental analysis

### What a student should retain
- Primary market = issue of securities
- Secondary market = trading of listed securities
- Technical = price, chart, timing
- Fundamental = business, value, conviction

---

## Class 2 — Starter indicators and reversal patterns

### Core ideas
- Candle anatomy
- Moving average crossovers
- MACD crossover logic
- Head & shoulders
- Inverse head & shoulders
- Triple top / triple bottom
- V-reversal

### What a student should retain
- Indicators give clues, not certainty
- Structure matters more than isolated crosses
- Reversal patterns need neckline/level confirmation

---

## Class 3 — Trade types, momentum and candlestick language

### Core ideas
- Intraday vs swing vs investing
- Trend + momentum framing
- Top-down timeframes
- Dow Theory (HH-HL vs LH-LL)
- Hammer, hanging man, inverted hammer, shooting star
- Doji family
- Marubozu
- Engulfing and Harami
- Morning star / evening star
- 20 DMA pullback strategy

### What a student should retain
- Good stock = strong structure + supportive momentum
- Candles are context tools, not magic
- Pullback entries are stronger than random breakouts in the middle of nowhere

---

## Class 4 — Zones, order flow, and continuation structure

### Core ideas
- Support/resistance
- Fair value gap
- Breakout probability
- Stop-loss hunting
- Order blocks
- Demand/supply zones
- EMA crossover
- Stop placement
- Vstop / volatility stop
- Saucer
- Triangle patterns

### What a student should retain
- Think in zones, not single exact ticks
- Institutions often move in stages
- Obvious stops get hunted
- Not every bullish-looking curve is reversal; some are continuation structures

---

## Class 5 — Build the trading system

### Core ideas
- Trading system components
- RSI zones: above 60 / below 40
- Risk-reward
- Fibonacci retracement
- Position sizing formula
- Investing vs trading capital logic
- Trailing stop mechanics

### Essential formulas

#### Risk per trade
\[
\text{Risk per trade} = 2\% \text{ of portfolio}
\]

#### Position size
\[
\text{Quantity} = \frac{0.02 \times \text{Portfolio Size}}{\text{Entry - Stop Loss}}
\]

#### Reward-to-risk framing
If stop-loss distance = \( R \), then preferred target = \( 3R \)

### What a student should retain
- Never enter without entry, stop, target
- Risk is fixed first
- Quantity comes from risk, not from emotion

---

## Class 6 — Investment strategies

### Strategy 1: Multi-bagger breakout
- Look for years of sideways price action
- Prefer older listed stocks / past IPO cohorts
- Draw base boundaries
- Enter on decisive breakout of the upper boundary
- Confirm momentum using RSI
- Hold as long as structure remains intact

### Strategy 2: Monthly Bollinger Band breakout
- Use Bollinger Bands
- Use month-end / near month-end evaluation
- Use liquidity + price + momentum filters
- Enter 1% above trigger
- Trail with structure / band / supertrend

### What a student should retain
- Multi-baggers usually emerge from long boredom before strong trend
- Monthly setups demand patience
- Scanner-driven discipline matters

---

## Class 7 — Swing trading systems

### Strategy 1: Buying in the dips
- Monthly RSI > 60
- Shift to daily chart
- Wait for controlled pullback
- Enter on bullish resolution
- Stop below daily swing low
- Trail daily

### Strategic principles
- Bulls are slow, bears are fast
- Stay with Nifty
- Divergence is disagreement between price and indicator

### Strategy 2: Cross strategy
- Lower Bollinger Band interaction
- Green candle appears
- Downtrend line is broken
- VWAP is reclaimed
- Best when lower BB is not falling sharply

### What a student should retain
- Do not fight the broad index
- Swing entries are better after dips, not after emotional chasing
- Confluence matters

---

## Class 8 — Context, internals, and ABC strategy

### Context checklist
- GIFT / SGX Nifty
- Dow / E-mini Dow futures
- Gold
- Oil
- 52-week highs
- QoQ / YoY profitability
- FII / DII behavior
- Delivery percentage
- Volume vs average
- Close vs 5 EMA

### ABC strategy
- 50 SMA
- lower Bollinger Band
- green candle
- confluence around one zone

### What a student should retain
- Good setups improve when market context agrees
- Volume confirms price
- Delivery confirms seriousness
- FII/DII context adds bias quality

---

## Class 9 — Breakouts, BTST, screening, trend continuation

### Real breakout checklist
1. Big green candle
2. Body at least ~70% of total range
3. Volume above previous day
4. Delivery above threshold
5. Close at least 1% above resistance
6. Market condition positive

### BTST
- Use intersection of top gainers + volume shockers
- Avoid Friday / pre-holiday / pre-expiry
- Timing matters

### Risk concepts
- market risk
- credit risk
- operational risk
- systemic risk
- unsystematic risk

### Screening concepts
- alpha = stock return − market return
- beta = volatility relative to market
- prefer safer large-cap universes first

### Continuation systems
- Monthly RSI + Supertrend continuation
- 13/34 SMA with 200 SMA
- 44 SMA pullback rebound
- 9/15 EMA on 4H with Supertrend confirmation

### Mutual-fund stock idea workflow
- study diversified funds
- inspect holdings
- find repeated/common stocks
- then do fundamental analysis

---

# Key formulas and rules extracted from the handwritten notes

## 1. Position sizing
\[
\text{Quantity} = \frac{0.02 \times \text{Portfolio Size}}{\text{Entry - Stop Loss}}
\]

## 2. Risk cap
- Maximum risk per trade = **2% of portfolio**

## 3. Reward expectation
- Prefer **3R target** for **1R risk**

## 4. Fibonacci heuristic from notes
- shallow pullback ~ 33%
- common pullback ~ 50%
- deep but acceptable pullback ~ 62%
- beyond that, trend quality weakens materially

## 5. Breakout quality filters
- body strength
- volume confirmation
- delivery confirmation
- market condition positive
- close above resistance by buffer

---

# Ambiguities and corrections log

This section is important because the handwritten PDF is not perfectly literal.

## Likely ambiguous / inconsistent items

### 1. Bollinger Band price threshold
- Handwritten note suggests **Price > 50**
- Cleaner session summary suggests **Price ≥ 100**
- Treat the **price filter concept** as real, but the exact number as **uncertain in handwriting**

### 2. Monthly RSI threshold in BB strategy
- Handwriting suggests **Monthly RSI > 55**
- Cleaner summary suggests **Monthly RSI ≥ 50**
- Use **positive monthly RSI filter** as the reliable takeaway

### 3. Swing strategy daily RSI < 40 / > 60 rule
- Present in handwriting
- Cleaner summary frames the setup as **buying the dip after monthly RSI > 60**, not a pure daily RSI crossover system
- Treat the handwritten RSI lines as **student shorthand**, not necessarily the full official rule

### 4. “Oldest stock exchange” note
- Antwerp and Amsterdam are both written
- The intended meaning is historical origin vs oldest continuously existing exchange
- Do not use the line as an exam-grade historical citation without independent verification

### 5. Tickertape vs tickertip screener
- Handwriting is not fully clear
- Cleaner summary referenced a screener workflow for alpha/beta
- Treat the **alpha-beta screener concept** as reliable, not the exact site spelling from the note

### 6. Some portfolio / T+2 / pending-area logic
- The core idea of staggered institutional execution is clear
- The exact mechanics in the handwritten shorthand are not fully literal
- Best treated as **conceptual**, not rule-based

---

# Final reconstructed study sheet

If I had to compress the whole PDF into one clean professional summary, it would be this:

1. Learn the market structure first: debt, equity, primary, secondary, exchanges, brokers, demat, trading.
2. Understand charts visually: candles, moving averages, MACD, basic reversal structures.
3. Understand trend quality: HH-HL vs LH-LL, monthly RSI support, top-down timeframe alignment.
4. Learn candlestick and pattern context: do not read shapes in isolation.
5. Learn zones and liquidity: support/resistance, fair value gap, order block, demand/supply, stop-loss hunting.
6. Build a proper trading system: stock selection, strategy, position sizing, risk management, trailing.
7. Fix risk mathematically: 2% portfolio risk, quantity from entry-stop distance.
8. Distinguish investing from trading:
   - investing = patience + conviction + structural breakout
   - trading = shorter horizon + tighter management
9. For investment setups:
   - multi-year base breakout
   - Bollinger Band monthly breakout
10. For swing setups:
   - buy dips in strong stocks
   - use Nifty as directional filter
   - use divergence as supporting evidence
   - use cross strategy and ABC strategy for confluence
11. For breakouts:
   - require strong candle, strong volume, delivery confirmation, positive market context
12. For faster trades:
   - BTST only with careful timing
13. For screening:
   - use alpha, beta, large-cap preference, mutual-fund holding overlap
14. Keep each strategy separate. Do not mash them together.
15. The notes repeatedly imply the real edge is not “indicator discovery”; it is:
   - patience
   - discipline
   - context
   - structure
   - capital preservation

---

# Deliverable note

This is a **reconstructed digital study document**, not a verbatim legal-grade transcription of every handwritten stroke.  
For Classes 4–9, the reconstruction is materially strengthened by the uploaded summary/transcript files.  
For Classes 1–3, reconstruction relies more heavily on the handwritten pages themselves and later recaps.

# Part 3 — Fully normalized class-by-class reconstruction

# Fully normalized class-by-class reconstruction

This section rewrites the notes as a cleaner study guide.

---

## Class 1 — Market foundations

### Core ideas
- Debt vs equity
- Funding ladder from private capital to public listing
- Primary market vs secondary market
- Role of stock exchanges
- NSE vs BSE basics
- Role of brokers and sub-brokers
- Demat, DP, trading account
- Technical vs fundamental analysis

### What a student should retain
- Primary market = issue of securities
- Secondary market = trading of listed securities
- Technical = price, chart, timing
- Fundamental = business, value, conviction

---

## Class 2 — Starter indicators and reversal patterns

### Core ideas
- Candle anatomy
- Moving average crossovers
- MACD crossover logic
- Head & shoulders
- Inverse head & shoulders
- Triple top / triple bottom
- V-reversal

### What a student should retain
- Indicators give clues, not certainty
- Structure matters more than isolated crosses
- Reversal patterns need neckline/level confirmation

---

## Class 3 — Trade types, momentum and candlestick language

### Core ideas
- Intraday vs swing vs investing
- Trend + momentum framing
- Top-down timeframes
- Dow Theory (HH-HL vs LH-LL)
- Hammer, hanging man, inverted hammer, shooting star
- Doji family
- Marubozu
- Engulfing and Harami
- Morning star / evening star
- 20 DMA pullback strategy

### What a student should retain
- Good stock = strong structure + supportive momentum
- Candles are context tools, not magic
- Pullback entries are stronger than random breakouts in the middle of nowhere

---

## Class 4 — Zones, order flow, and continuation structure

### Core ideas
- Support/resistance
- Fair value gap
- Breakout probability
- Stop-loss hunting
- Order blocks
- Demand/supply zones
- EMA crossover
- Stop placement
- Vstop / volatility stop
- Saucer
- Triangle patterns

### What a student should retain
- Think in zones, not single exact ticks
- Institutions often move in stages
- Obvious stops get hunted
- Not every bullish-looking curve is reversal; some are continuation structures

---

## Class 5 — Build the trading system

### Core ideas
- Trading system components
- RSI zones: above 60 / below 40
- Risk-reward
- Fibonacci retracement
- Position sizing formula
- Investing vs trading capital logic
- Trailing stop mechanics

### Essential formulas

#### Risk per trade
\[
\text{Risk per trade} = 2\% \text{ of portfolio}
\]

#### Position size
\[
\text{Quantity} = \frac{0.02 \times \text{Portfolio Size}}{\text{Entry - Stop Loss}}
\]

#### Reward-to-risk framing
If stop-loss distance = \( R \), then preferred target = \( 3R \)

### What a student should retain
- Never enter without entry, stop, target
- Risk is fixed first
- Quantity comes from risk, not from emotion

---

## Class 6 — Investment strategies

### Strategy 1: Multi-bagger breakout
- Look for years of sideways price action
- Prefer older listed stocks / past IPO cohorts
- Draw base boundaries
- Enter on decisive breakout of the upper boundary
- Confirm momentum using RSI
- Hold as long as structure remains intact

### Strategy 2: Monthly Bollinger Band breakout
- Use Bollinger Bands
- Use month-end / near month-end evaluation
- Use liquidity + price + momentum filters
- Enter 1% above trigger
- Trail with structure / band / supertrend

### What a student should retain
- Multi-baggers usually emerge from long boredom before strong trend
- Monthly setups demand patience
- Scanner-driven discipline matters

---

## Class 7 — Swing trading systems

### Strategy 1: Buying in the dips
- Monthly RSI > 60
- Shift to daily chart
- Wait for controlled pullback
- Enter on bullish resolution
- Stop below daily swing low
- Trail daily

### Strategic principles
- Bulls are slow, bears are fast
- Stay with Nifty
- Divergence is disagreement between price and indicator

### Strategy 2: Cross strategy
- Lower Bollinger Band interaction
- Green candle appears
- Downtrend line is broken
- VWAP is reclaimed
- Best when lower BB is not falling sharply

### What a student should retain
- Do not fight the broad index
- Swing entries are better after dips, not after emotional chasing
- Confluence matters

---

## Class 8 — Context, internals, and ABC strategy

### Context checklist
- GIFT / SGX Nifty
- Dow / E-mini Dow futures
- Gold
- Oil
- 52-week highs
- QoQ / YoY profitability
- FII / DII behavior
- Delivery percentage
- Volume vs average
- Close vs 5 EMA

### ABC strategy
- 50 SMA
- lower Bollinger Band
- green candle
- confluence around one zone

### What a student should retain
- Good setups improve when market context agrees
- Volume confirms price
- Delivery confirms seriousness
- FII/DII context adds bias quality

---

## Class 9 — Breakouts, BTST, screening, trend continuation

### Real breakout checklist
1. Big green candle
2. Body at least ~70% of total range
3. Volume above previous day
4. Delivery above threshold
5. Close at least 1% above resistance
6. Market condition positive

### BTST
- Use intersection of top gainers + volume shockers
- Avoid Friday / pre-holiday / pre-expiry
- Timing matters

### Risk concepts
- market risk
- credit risk
- operational risk
- systemic risk
- unsystematic risk

### Screening concepts
- alpha = stock return − market return
- beta = volatility relative to market
- prefer safer large-cap universes first

### Continuation systems
- Monthly RSI + Supertrend continuation
- 13/34 SMA with 200 SMA
- 44 SMA pullback rebound
- 9/15 EMA on 4H with Supertrend confirmation

### Mutual-fund stock idea workflow
- study diversified funds
- inspect holdings
- find repeated/common stocks
- then do fundamental analysis

---

# Part 4 — Key formulas, hard rules, and ambiguity ledger

# Key formulas and rules extracted from the handwritten notes

## 1. Position sizing
\[
\text{Quantity} = \frac{0.02 \times \text{Portfolio Size}}{\text{Entry - Stop Loss}}
\]

## 2. Risk cap
- Maximum risk per trade = **2% of portfolio**

## 3. Reward expectation
- Prefer **3R target** for **1R risk**

## 4. Fibonacci heuristic from notes
- shallow pullback ~ 33%
- common pullback ~ 50%
- deep but acceptable pullback ~ 62%
- beyond that, trend quality weakens materially

## 5. Breakout quality filters
- body strength
- volume confirmation
- delivery confirmation
- market condition positive
- close above resistance by buffer

---

# Ambiguities and corrections log

This section is important because the handwritten PDF is not perfectly literal.

## Likely ambiguous / inconsistent items

### 1. Bollinger Band price threshold
- Handwritten note suggests **Price > 50**
- Cleaner session summary suggests **Price ≥ 100**
- Treat the **price filter concept** as real, but the exact number as **uncertain in handwriting**

### 2. Monthly RSI threshold in BB strategy
- Handwriting suggests **Monthly RSI > 55**
- Cleaner summary suggests **Monthly RSI ≥ 50**
- Use **positive monthly RSI filter** as the reliable takeaway

### 3. Swing strategy daily RSI < 40 / > 60 rule
- Present in handwriting
- Cleaner summary frames the setup as **buying the dip after monthly RSI > 60**, not a pure daily RSI crossover system
- Treat the handwritten RSI lines as **student shorthand**, not necessarily the full official rule

### 4. “Oldest stock exchange” note
- Antwerp and Amsterdam are both written
- The intended meaning is historical origin vs oldest continuously existing exchange
- Do not use the line as an exam-grade historical citation without independent verification

### 5. Tickertape vs tickertip screener
- Handwriting is not fully clear
- Cleaner summary referenced a screener workflow for alpha/beta
- Treat the **alpha-beta screener concept** as reliable, not the exact site spelling from the note

### 6. Some portfolio / T+2 / pending-area logic
- The core idea of staggered institutional execution is clear
- The exact mechanics in the handwritten shorthand are not fully literal
- Best treated as **conceptual**, not rule-based

---

# Part 5 — Codex / Claude Code machine-readable extraction layer

## Machine-readable strategy schemas

These schemas are intentionally plain markdown + YAML so they can be ingested into Codex, Claude Code, Cursor, or any custom parser without extra cleanup.

### Strategy schema conventions

- `confidence`: one of `high`, `medium`, `low`
- `source_priority`: ordered strongest-to-weakest evidence for reconstruction
- `hard_rules`: should be treated as operational rules unless contradicted later
- `soft_rules`: heuristics / framing / likely context rules
- `ambiguities`: known conflicts between notebook shorthand and session summaries

### `class5_trading_system`

```yaml
id: class5_trading_system
class: 5
name: Trading System Foundation
confidence: high
source_priority:
  - witharin-session5-extended-summary.md
  - witharin-session5-transcript-proper.md
  - Stock Market Notes.pdf page 9
hard_rules:
  - stock_selection_required: true
  - entry_stop_target_must_be_defined_pre_trade: true
  - risk_per_trade_pct_of_portfolio: 2
  - position_size_formula: "(0.02 * portfolio_size) / (entry_price - stop_loss)"
  - preferred_risk_reward: "3:1"
soft_rules:
  - rsi_is_filter_not_trigger: true
  - fibonacci_is_confluence_not_standalone: true
  - psychology_is_part_of_system: true
notes:
  - A trade is incomplete if it lacks stock selection, strategy, position sizing, risk management, trailing, or psychology.
```

### `class6_multi_bagger_breakout`

```yaml
id: class6_multi_bagger_breakout
class: 6
name: Multi-Bagger Breakout
confidence: high
source_priority:
  - witharin-session6-extended-summary.md
  - witharin-session6-transcript-proper.md
  - Stock Market Notes.pdf page 10
timeframe: monthly
universe_intent: long_term_investment
setup_logic:
  - identify_stock_with_long_sideways_consolidation
  - mark_top_of_multi_year_range
  - wait_for_decisive_monthly_close_above_range_high
entry:
  trigger: monthly_breakout_close
  buffer: optional_plus_1pct_if_using_execution_buffer
stop_loss:
  basis: below_prior_swing_structure_of_consolidation
trailing:
  method: discretionary_or_follow_on_system
soft_rules:
  - fundamentally_strong_company_preferred: true
  - do_not_chase_daily_poke_above_range: true
```

### `class6_monthly_bollinger_band_strategy`

```yaml
id: class6_monthly_bollinger_band_strategy
class: 6
name: Monthly Bollinger Band Investment Strategy
confidence: high
source_priority:
  - witharin-session6-extended-summary.md
  - witharin-session6-transcript-proper.md
  - Stock Market Notes.pdf page 11
screening:
  price_floor_daily_close: 100
  volume_floor_daily_shares: 100000
  monthly_rsi_min: 50
  monthly_high_crosses_upper_bollinger_band: true
execution:
  evaluation_day: last_trading_day_of_month
  entry_buffer_pct: 1
  stop_loss_basis: recent_daily_swing_low
  trail_with: supertrend
ambiguities:
  - notebook_digits_are_rough_and_look_like_50_55_or_65_in_places_but_session_summary_supports_monthly_rsi_gte_50
```

### `class7_buying_in_the_dips`

```yaml
id: class7_buying_in_the_dips
class: 7
name: Buying in the Dips
confidence: high
source_priority:
  - witharin-session7-extended-summary.md
  - witharin-session7-transcript-proper.md
  - Stock Market Notes.pdf pages 11-12
monthly_filter:
  monthly_rsi_min: 60
execution_timeframe: daily
setup_logic:
  - identify_stock_already_in_high_momentum_uptrend
  - wait_for_visible_daily_pullback
  - enter_when_daily_dip_resolves_up
stop_loss:
  basis: recent_daily_swing_low
trailing:
  basis: daily_higher_low_structure
context_rules:
  - stay_with_nifty: true
  - bulls_slow_bears_fast: true
```

### `class7_cross_strategy`

```yaml
id: class7_cross_strategy
class: 7
name: Cross Strategy
confidence: high
source_priority:
  - witharin-session7-extended-summary.md
  - witharin-session7-transcript-proper.md
  - Stock Market Notes.pdf page 12
execution_timeframe: daily
conditions:
  - lower_bollinger_band_touch: true
  - downtrendline_break: true
  - vwap_cross_up: true
  - green_confirmation_candle: true
entry:
  trigger: daily_close_above_cross_zone
  buffer_pct: 1
stop_loss:
  basis: recent_daily_swing_low
context_rules:
  - primary_trend_must_be_up: true
```

### `class8_abc_strategy`

```yaml
id: class8_abc_strategy
class: 8
name: ABC Strategy
confidence: high
source_priority:
  - witharin-session8-extended-summary.md
  - witharin-session8-transcript-proper.md
  - Stock Market Notes.pdf pages 13-14
execution_timeframe: daily
components:
  A: price_above_or_reclaiming_50_sma
  B: touch_or_pierce_lower_bollinger_band
  C: green_confirmation_candle
entry:
  trigger: daily_confirmation_close
  buffer_pct: 1
stop_loss:
  basis: recent_daily_swing_low
trailing:
  basis: 50_sma
context_rules:
  - premarket_check_gift_nifty_dow_futures_gold_crude: true
  - stay_with_nifty: true
  - fii_flow_as_confluence: true
```

### `class9_breakout_strategy`

```yaml
id: class9_breakout_strategy
class: 9
name: Real Breakout Strategy
confidence: high
source_priority:
  - witharin-session9-extended-summary.md
  - witharin-session9-transcript-proper.md
  - Stock Market Notes.pdf pages 14-15
execution_timeframe: daily
conditions:
  - big_green_candle: true
  - body_pct_of_range_min: 70
  - volume_gt_previous_day: true
  - delivery_pct_min: 35
  - close_pct_above_resistance_min: 1
entry:
  trigger: next_day_open_or_confirmation_close
stop_loss:
  basis: recent_daily_higher_low_or_swing_low
notes:
  - delivery_threshold_is_taught_as_35_to_45_percent_range_across notes and summary.
```

### `class9_btst`

```yaml
id: class9_btst
class: 9
name: Buy Today Sell Tomorrow
confidence: high
source_priority:
  - witharin-session9-extended-summary.md
  - witharin-session9-transcript-proper.md
  - Stock Market Notes.pdf page 15
scanner_workflow:
  source_1: moneycontrol_top_gainers
  source_2: moneycontrol_volume_shockers
  intersection_required: true
  delivery_pct_min: 45
avoid:
  - days_just_before_tuesday_derivative_expiry
exit:
  - next_day_open
  - first_strength
```

### `class9_trend_continuation`

```yaml
id: class9_trend_continuation
class: 9
name: Trend Continuation
confidence: high
source_priority:
  - witharin-session9-extended-summary.md
  - witharin-session9-transcript-proper.md
  - Stock Market Notes.pdf page 16
monthly_filter:
  monthly_rsi_min: 60
execution_timeframe: daily
conditions:
  - daily_close_above_supertrend: true
  - green_confirmation_candle: true
entry:
  buffer_pct: 1
stop_loss:
  basis: recent_daily_swing_low
trailing:
  basis: supertrend
```

### `class9_moving_average_variants`

```yaml
id: class9_moving_average_variants
class: 9
name: MA and EMA Variants
confidence: high
variants:
  strategy_13_34_200_sma:
    trend_anchor: 200_sma
    trigger: 13_sma_crosses_above_34_sma
    condition: both_above_200_sma
  strategy_44_sma:
    trigger: price_reclaims_or_holds_above_44_sma
    context: primary_uptrend
  strategy_9_15_ema_4h:
    timeframe: 4h
    trigger: price_above_9_ema_and_15_ema_and_supertrend_green
```

## Additional machine-readable topic map

```yaml
course_map:
  class_1:
    title: Market Foundations
    topics:
      - debt_vs_equity
      - funding_ladder
      - primary_vs_secondary_market
      - exchanges_brokers_depositories
      - technical_vs_fundamental
    handwritten_pages: [1]
  class_2:
    title: Indicators and Reversal Patterns
    topics:
      - candle_anatomy
      - moving_average
      - macd
      - head_and_shoulders
      - inverse_head_and_shoulders
      - triple_top
      - triple_bottom
      - v_reversal
    handwritten_pages: [2, 3]
  class_3:
    title: Trading Horizons, Trend, Candlestick Language
    topics:
      - intraday_vs_swing_vs_investing
      - trend_plus_momentum
      - multi_timeframe_view
      - dow_theory_shorthand
      - single_candle_patterns
      - double_candle_patterns
      - triple_candle_patterns
    handwritten_pages: [4, 5, 6]
  class_4:
    title: Zones and Order-Flow Logic
    topics:
      - support_resistance
      - fair_value_gap
      - order_blocks
      - stop_loss_hunting
      - demand_supply_zones
      - ema_cross
      - saucer_and_triangle_patterns
    handwritten_pages: [6, 7, 8]
  class_5:
    title: Trading System Block
    topics:
      - rsi
      - risk_reward
      - fibonacci
      - position_sizing
      - trailing_stop
    handwritten_pages: [9, 10]
  class_6:
    title: Investment Strategy Block
    topics:
      - multi_bagger_breakout
      - monthly_bollinger_band_strategy
    handwritten_pages: [10, 11]
  class_7:
    title: Swing Strategy Block I
    topics:
      - buying_in_the_dips
      - bulls_slow_bears_fast
      - stay_with_nifty
      - divergence
      - cross_strategy
    handwritten_pages: [11, 12]
  class_8:
    title: Swing Strategy Block II / Context Layer
    topics:
      - gift_nifty_and_global_cues
      - fii_fpi_context
      - momentum_profitability_filters
      - abc_strategy
    handwritten_pages: [13, 14]
  class_9:
    title: Swing Strategy Block III / Breakout and Continuation
    topics:
      - breakout_strategy
      - btst
      - systematic_vs_unsystematic_risk
      - alpha_beta_screening
      - trend_continuation
      - sma_and_ema_variants
      - mutual_fund_stock_discovery
    handwritten_pages: [14, 15, 16]
```

## Suggested retrieval chunks for an engineering knowledge base

If you want to embed this file into a retrieval system, split it using these chunk keys:

- `page_01_market_basics`
- `page_02_indicators`
- `page_03_reversal_patterns`
- `page_04_trade_types_and_trend`
- `page_05_single_double_candle_patterns`
- `page_06_triple_candles_support_resistance_fvg`
- `page_07_order_blocks_demand_supply_ema`
- `page_08_saucer_triangles_exit_logic`
- `page_09_trading_system_rsi_rr_fibonacci`
- `page_10_position_sizing_multibagger_intro`
- `page_11_monthly_bb_and_swing_intro`
- `page_12_nifty_divergence_cross_strategy`
- `page_13_market_context_filters`
- `page_14_abc_and_breakout_framework`
- `page_15_btst_risk_alpha_beta`
- `page_16_trend_continuation_ma_ema_mutual_funds`
- `class_01_normalized`
- `class_02_normalized`
- `class_03_normalized`
- `class_04_normalized`
- `class_05_normalized`
- `class_06_normalized`
- `class_07_normalized`
- `class_08_normalized`
- `class_09_normalized`
- `strategy_schema_class5`
- `strategy_schema_class6_mbb`
- `strategy_schema_class6_bb`
- `strategy_schema_class7_buying_dips`
- `strategy_schema_class7_cross`
- `strategy_schema_class8_abc`
- `strategy_schema_class9_breakout`
- `strategy_schema_class9_btst`
- `strategy_schema_class9_trend_continuation`
- `strategy_schema_class9_moving_average_variants`
- `ambiguity_ledger`

# Part 6 — Study-sheet layer

# Final reconstructed study sheet

If I had to compress the whole PDF into one clean professional summary, it would be this:

1. Learn the market structure first: debt, equity, primary, secondary, exchanges, brokers, demat, trading.
2. Understand charts visually: candles, moving averages, MACD, basic reversal structures.
3. Understand trend quality: HH-HL vs LH-LL, monthly RSI support, top-down timeframe alignment.
4. Learn candlestick and pattern context: do not read shapes in isolation.
5. Learn zones and liquidity: support/resistance, fair value gap, order block, demand/supply, stop-loss hunting.
6. Build a proper trading system: stock selection, strategy, position sizing, risk management, trailing.
7. Fix risk mathematically: 2% portfolio risk, quantity from entry-stop distance.
8. Distinguish investing from trading:
   - investing = patience + conviction + structural breakout
   - trading = shorter horizon + tighter management
9. For investment setups:
   - multi-year base breakout
   - Bollinger Band monthly breakout
10. For swing setups:
   - buy dips in strong stocks
   - use Nifty as directional filter
   - use divergence as supporting evidence
   - use cross strategy and ABC strategy for confluence
11. For breakouts:
   - require strong candle, strong volume, delivery confirmation, positive market context
12. For faster trades:
   - BTST only with careful timing
13. For screening:
   - use alpha, beta, large-cap preference, mutual-fund holding overlap
14. Keep each strategy separate. Do not mash them together.
15. The notes repeatedly imply the real edge is not “indicator discovery”; it is:
   - patience
   - discipline
   - context
   - structure
   - capital preservation

---

## Appendix — file-by-file reconstruction utility map

### Highest-value supporting files by topic

#### Market structure / zones / order flow
- `witharin-session4-extended-summary.md`
- `witharin-session4-transcript-proper.md`

#### Trading system / RSI / Fibonacci / sizing
- `witharin-session5-extended-summary.md`
- `witharin-session5-transcript-proper.md`

#### Investment block
- `witharin-session6-extended-summary.md`
- `witharin-session6-transcript-proper.md`

#### Swing block
- `witharin-session7-extended-summary.md`
- `witharin-session7-transcript-proper.md`
- `witharin-session8-extended-summary.md`
- `witharin-session8-transcript-proper.md`
- `witharin-session9-extended-summary.md`
- `witharin-session9-transcript-proper.md`

### What is weakly supported vs strongly supported

#### Strongly supported by both notebook + external markdown
- Page 6–8 zone/order-flow material
- Page 9–10 trading-system and position-sizing material
- Page 10–11 investment strategy block
- Page 11–16 swing / breakout / continuation block

#### Mostly notebook-led and therefore less externally validated
- Page 1 market-basics shorthand
- Page 2–3 indicator + early reversal-pattern shorthand
- Some Page 4–5 candlestick micro-notes

### Safe usage guidance

Use this file safely for:
- study-note digitization
- curriculum reconstruction
- building course documentation
- building internal retrieval corpora
- generating strategy summaries or index pages
- feeding an LLM coding assistant a structured knowledge base

Do **not** use this file alone for:
- live trading automation
- unreviewed order execution
- claiming that a given threshold is historically validated
- assuming every handwritten threshold is exact rather than mnemonic



# Part 7 — Incremental merge from additional uploaded texts and image

## What this extension adds beyond `notes-extended(1)`

The prior file already reconstructed the handwritten PDF and the major session summaries.

This extension adds four things that were not yet fully operationalized in one place:

1. a **literal + normalized merge of the BB strategy execution slide**,
2. a **deeper multi-bagger evaluation framework**,
3. an **indicator encyclopedia + pitfalls layer**,
4. a **clean operator workflow** for daily, swing, and month-end execution.

This matters because the previous document was already strong on reconstruction, but it was still not the most usable **operator notebook**.

The content below converts the reconstruction into something closer to a **working study manual + workflow manual + strategy handbook**.

## Newly merged source additions in this extension

### Current-conversation uploaded inputs merged here

- `Pasted text(2).txt`
  - indicator glossary
  - Fibonacci notes
  - BB strategy typed rules
  - swing RSI shorthand
  - screener links
  - pre-market checklist
  - breakout rules
  - BTST workflow
  - trend continuation note
- `Pasted text (1).txt`
  - multi-bagger common pattern analysis
  - business quality and re-rating checklist
  - governance, moat, valuation, and institutional-discovery framework
- `e70654cb-af38-4d88-bf2b-6b2b97573628(1).png`
  - “Execution of BB Strategy” slide
  - this is especially useful because it tightens the operational sequence for the monthly Bollinger Band setup

### Additional supporting markdowns conceptually merged into this extension

These were already listed in the original reconstruction, but this extension now uses their teaching arc more explicitly:

- `witharin_lesson_2043795_claude_code_extended.md` / `S1.md`
- `witharin-session-4-extended-claude-code.md` / `S4.md`
- `witharin-session-5-claude-code-extended.md`
- `claude-code-extended-session6-investment-strategies.md` / `S6.md`
- `claude_code_extended_session7_document.md` / `S7.md`
- `S8.md`
- `witharin-session9-claude-code-extended.md` / `S9.md`

---

## Session reinforcement map — what each session-level markdown really adds

### Session 1 / orientation layer

This layer sharpens the beginner framing:

- inflation destroys idle savings,
- fixed deposits alone are not enough for wealth compounding,
- stock-market participation must be process-driven,
- technical analysis and fundamental analysis are both important,
- the course is not just about “tips”; it is about structured learning.

### Session 4 reinforcement layer

This layer upgrades the earlier pattern-reading mind into a zone-reading mind:

- support and resistance are zones, not laser lines,
- order blocks need patience,
- liquidity hunts and stop-loss hunts are real,
- demand/supply zones weaken with repeated consumption,
- fewer indicators, more structure.

### Session 5 reinforcement layer

This is where the course becomes serious:

- a real trade requires stock selection + entry + stop + target + sizing + psychology,
- risk is capped first, quantity comes later,
- RSI and Fibonacci are confluence tools, not magic triggers,
- reward-to-risk discipline matters,
- execution without a system is just gambling with better vocabulary.

### Session 6 reinforcement layer

This session matters because it separates investing from trading:

- investing is its own bucket,
- monthly structure matters,
- long dead bases can become future leaders,
- scanner-driven investing reduces emotional stock picking,
- the monthly Bollinger Band breakout is a rules-based investment setup, not a random momentum chase.

### Session 7 reinforcement layer

This starts the swing block properly:

- swing trading sits between intraday and investing,
- monthly RSI gives higher-timeframe quality,
- daily chart is used for execution,
- bulls are slow, bears are fast,
- Nifty context matters,
- buying in the dips and cross strategy are both confluence systems.

### Session 8 reinforcement layer

This is the “read market before stock” session:

- start with GIFT Nifty,
- then Dow / Dow futures,
- then gold and crude,
- then FII/FPI or DII participation,
- only then evaluate stock-level setups,
- ABC strategy adds a daily chart confluence model.

### Session 9 reinforcement layer

This closes the swing block with more operational setups:

- stronger breakout validation,
- BTST workflow,
- alpha-beta-based filtering,
- trend continuation,
- moving-average continuation systems,
- mutual-fund holdings as idea sourcing.

---

# Part 8 — BB strategy master merge

## 1. Literal OCR-style transcription from the uploaded BB execution slide

### Slide title
**EXECUTION OF BB STRATEGY**

### Slide bullets as reconstructed from the image

- Run the Scanner to identify the stocks at the end of the month i.e., **29th / 30th**
- `https://chartink.com/screener/investment-bb-strategy`
- We have to check that the stock is:
  1. **A Good Stock for a Lifetime basis** and
  2. **Monthly High crossed above Upper Bollinger Band**
- Boil down to **3–4 stocks** and then take the trade
- Wait for the entire month for the candle to take the full shape
- Place your trade **1% above** so that the order gets executed when it breaks the resistance
- Place **GTT (Good Till Trigger)** order

## 2. What the BB slide clarifies that the handwritten PDF alone did not make explicit

The handwritten PDF already suggested:

- monthly Bollinger Band strategy,
- scanner usage,
- month-end timing,
- 1% above high entry,
- swing-low / indicator stop alternatives.

But the slide adds operational clarity:

1. **Do not scan too early in the month.**
   - The setup is meant to be judged at the end of the month.
2. **Do not take every scan result.**
   - Reduce to a final shortlist of 3–4 names.
3. **Do not treat the setup as a junk-momentum screen.**
   - The stock must still qualify as a strong long-term business candidate.
4. **Execution is not immediate market-buying.**
   - The preferred method is a trigger order placed 1% above the relevant level.
5. **GTT matters.**
   - The slide clearly frames this as a prepared breakout trigger, not a chase trade.

## 3. Unified BB strategy — strict normalized operating procedure

### Strategy identity
- **Name:** Monthly Bollinger Band Investment Strategy
- **Category:** Investment
- **Primary timeframe:** Monthly
- **Execution assistance timeframe:** Daily
- **Intent:** identify structurally strong stocks entering a fresh monthly expansion phase

### Core thesis
A quality stock that has already proven long-term strength becomes especially interesting when the **monthly high crosses above the upper Bollinger Band**, because that often signals transition from dormancy / compression into expansion.

But this is only worth acting on when the stock is not junk, not illiquid, and not merely a random penny-stock spike.

### Raw rule bank merged from all available inputs

#### Rule cluster A — stock-quality filters
- Avoid penny-stock behavior.
- Prefer strong businesses with durability.
- Prefer names that can still be justified on a long-term basis.
- Prefer adequate liquidity.
- Prefer names with clean chart structure rather than chaotic vertical junk spikes.

#### Rule cluster B — numerical filters seen across notes
- **Price floor:** handwritten notes suggest `> 50`; normalized session reconstruction often suggests `>= 100`.
- **Daily volume floor:** `> 100000` shares.
- **Monthly RSI filter:** handwritten notes suggest `> 55`; normalized session reconstruction often supports `>= 50` or `positive monthly RSI zone`.
- **Trigger condition:** monthly high crosses upper Bollinger Band.

#### Rule cluster C — time filter
- evaluate near the **end of the month**,
- especially the **last trading day** or **penultimate trading day**,
- because the monthly candle should be allowed to take its full shape.

#### Rule cluster D — execution logic
- shortlist the best 3–4 stocks,
- mark the relevant breakout / resistance level,
- place entry **1% above** the trigger,
- use **GTT** so the trade executes only if the breakout actually confirms.

### Hard normalized SOP

#### Step 1 — run the month-end scan
Use the BB scanner only near month-end.

#### Step 2 — reject garbage immediately
Remove names that are:
- too illiquid,
- penny-like,
- poor businesses,
- structurally messy,
- extended far beyond manageable risk.

#### Step 3 — confirm the monthly condition
The actual chart must show:
- upper Bollinger Band interaction or cross,
- a strong monthly candle,
- ideally supportive monthly RSI,
- and no obvious long-term structural damage.

#### Step 4 — shortlist only the best 3–4
This is critical. The slide explicitly says to boil down the list.
That means this is not supposed to become a 25-stock spray-and-pray basket.

#### Step 5 — define the trigger and stop before entry
Possible entry and stop structures:

**Entry**
- 1% above the breakout / monthly-high trigger

**Stop options from the notes**
1. middle Bollinger Band
2. previous monthly swing low
3. previous daily swing low
4. Supertrend trail in established uptrend

#### Step 6 — place GTT rather than impulsive entry
This keeps execution conditional.

#### Step 7 — manage position as investment, not intraday trade
This strategy belongs in the investment bucket.
Do not suffocate it with intraday-style hyperactive management.

## 4. BB strategy ambiguity ledger

### Ambiguity 1 — price threshold
- Notebook / pasted text says: **Price > 50**
- normalized reconstruction suggests: **Price >= 100**

**Practical reading:**
Treat this as a quality floor, not a sacred digit. The real intent is to avoid junk micro-priced stocks.

### Ambiguity 2 — monthly RSI threshold
- Notebook / pasted text says: **Monthly RSI > 55**
- normalized session summary often supports: **Monthly RSI >= 50**

**Practical reading:**
The actual intent is likely: monthly momentum should already be positive, not dead-sideways.

### Ambiguity 3 — exact trigger line
Some notes say **1% above high**; some phrasing implies **1% above resistance**.

**Practical reading:**
Use the actual chart structure. If the monthly high is itself the effective resistance, the difference is irrelevant. If a more meaningful resistance sits slightly above the visible candle high, use the stronger structural level.

## 5. BB strategy failure cases — when not to take the trade

Do **not** take the BB trade if:

- the scanner result is illiquid,
- the stock is a poor long-term business,
- the monthly candle is only poking above the band with heavy rejection,
- the trade requires an absurd stop for the account size,
- the name is already too extended from reasonable support,
- broader market context is hostile enough that even good breakouts are repeatedly failing,
- you are forcing the setup mid-month before the candle is complete.

## 6. BB strategy operator checklist

### Pre-scan checklist
- Is it month-end?
- Is the broader market not structurally broken?
- Am I evaluating investment setups, not swing setups?

### Scan review checklist
- Price floor acceptable?
- Daily volume acceptable?
- Monthly RSI acceptable?
- Monthly high above upper BB?
- Business quality acceptable?
- Chart quality acceptable?

### Execution checklist
- Shortlisted to 3–4 names?
- Trigger marked?
- Stop marked?
- Risk sized?
- GTT placed?
- Reason for trade written down?

---

# Part 9 — Multi-bagger deep-dive merge

## 1. Core principle

The uploaded multi-bagger note adds a major missing layer:

The handwritten notes taught the **chart-side idea** of multi-year sideways base breakout.
The new text adds the **business-side filter** that stops this from becoming a dumb breakout chase.

That is the right direction.

A multi-bagger is usually not just a chart breakout. It is the meeting point of:

1. **earnings compounding**, and
2. **multiple expansion / re-rating**.

If you ignore that, you are not doing multi-bagger analysis. You are doing breakout fantasy.

## 2. Quick-scan checklist for multi-bagger candidates

### Financial quality
- Profit growth consistency over multiple years
- Steady quarterly trend, not one-off spike
- ROCE / ROE often 15–20%+ and sustained
- Debt controlled or improving
- Comfortable interest coverage
- Margins stable or improving
- Profit growth outpacing revenue growth can indicate operating leverage

### Business quality
- Clear moat
- Scalable business model
- Large runway for growth

### Management quality
- Promoter quality matters
- Low or no pledging is preferred
- Governance must be clean

### Market / ownership quality
- Enough liquidity to actually build conviction
- Not already fully re-rated
- Early institutional discovery is a positive sign

### Reality check
- Multi-year holding period is normal
- Drawdowns are normal
- This category requires patience, not trigger addiction

## 3. The “twin engines” model

A multi-bagger usually comes from two engines working together:

### Engine A — earnings compounding
The business itself keeps improving.

### Engine B — valuation re-rating
The market gradually gives a higher multiple because:
- visibility improves,
- execution proves itself,
- governance is trusted,
- liquidity improves,
- institutions discover it.

The strongest outcomes happen when both engines run together.

## 4. What to validate before conviction

### Earnings visibility
- consistent quarterly execution,
- capacity expansion,
- utilization improvement,
- market-share gains,
- distribution expansion,
- new segment scaling.

### Story quality
- simple enough to explain clearly,
- repeatable enough to scale,
- not dependent on one fragile variable.

### Market behavior
- volume should expand during serious upmoves,
- relative strength vs sector / index should improve,
- liquidity should improve over time.

## 5. Governance red flags

Do not romanticize small-cap stories.
Reject or heavily discount names with:

- high promoter pledging,
- auditor resignations without clarity,
- opaque related-party structures,
- profits rising while operating cash flow stays suspiciously weak,
- serial dilution with weak capital allocation.

## 6. Governance green flags

Prefer names with:

- conservative disclosures,
- clean capital allocation,
- credible management depth,
- stable / rising promoter ownership in the right context,
- clear explanations for expansion plans.

## 7. MBB strategy upgraded with business filters

The original MBB strategy in the notes was mostly:

- find long sideways phase,
- draw the range,
- wait for monthly breakout,
- validate with RSI.

That is decent but incomplete.

### Stronger upgraded MBB workflow

#### Stage 1 — long base detection
- multi-year sideways or compression structure,
- dead or neutral stock becoming active,
- range high clearly visible on monthly chart.

#### Stage 2 — business sanity check
- financial quality acceptable,
- debt not scary,
- promoter / governance acceptable,
- runway believable.

#### Stage 3 — catalyst / re-rating check
- capex,
- new segment,
- demand tailwind,
- sector tailwind,
- market-share gains,
- improving institutional ownership.

#### Stage 4 — breakout confirmation
- monthly close above base high,
- preferably with strength / momentum,
- ideally not an isolated news spike.

#### Stage 5 — thesis card
Before buying, force a one-page written answer:
- what the company does,
- why it can win,
- why now,
- what can break the thesis,
- why the market may re-rate it.

## 8. Multibagger operator template

### Company summary
- What it does:
- Why it can win:

### Tailwind block
- Sector tailwind:
- Company-specific catalysts:

### Fundamentals block
- Sales growth:
- Profit growth:
- ROCE/ROE:
- Debt/cash-flow:
- Margin trend:

### Moat/scalability block
- Moat type:
- Scalability proof:
- Market runway:

### Re-rating block
- Current valuation vs history:
- Why multiple can expand:
- Institutional discovery signs:

### Governance block
- Red flags checked:
- Green flags:

### Chart block
- Long base identified:
- Monthly breakout level:
- RSI/momentum confirmation:

### Decision block
- Watch / Buy / Avoid:
- What would change the decision:

---

# Part 10 — Indicator encyclopedia merge

## RSI — Relative Strength Index

### What it measures
Momentum. More specifically, the speed and magnitude of recent price changes.

### Default / common settings
- RSI(14) standard
- 9 / 21 also watched depending on timeframe

### How the course appears to use RSI
The course does **not** use RSI only in the retail 70/30 meme way.
It uses RSI more intelligently as:

- momentum context,
- higher-timeframe quality filter,
- divergence support,
- zone-based bias marker.

### Important zone readings
- above 70: overbought in classic framing
- below 30: oversold in classic framing
- around 60: bullish momentum support zone in this course
- around 40: bearish / weak zone boundary in this course

### Practical signals
- bullish divergence: price lower low, RSI higher low
- bearish divergence: price higher high, RSI lower high
- in strong uptrends RSI often holds above 40–50
- in strong downtrends RSI often caps near 50–60

### Common mistakes
- selling only because RSI looks overbought,
- ignoring trend context,
- ignoring timeframe,
- using RSI alone without levels, structure, or market context.

## SMA — Simple Moving Average

### What it measures
Average price over N periods.

### Common periods
- 20 SMA — short trend
- 50 SMA — intermediate trend
- 100 / 200 SMA — long-term regime
- 13 / 34 / 44 SMA — specific strategy variants used in later sessions

### Practical use
- price above rising SMA = bullish bias
- price below falling SMA = bearish bias
- pullback to SMA can act as dynamic support
- crossovers can mark regime shift, but they are late

### Common mistakes
- taking lagging crossovers as early triggers,
- treating the SMA as a laser line instead of a zone,
- using SMA without context of broader structure.

## EMA — Exponential Moving Average

### What it measures
Moving average with heavier weight on recent price.

### Common periods
- 9 / 15 or 9 / 21 — faster trend systems
- 20 / 50 — swing trend work
- 100 / 200 — longer trend confirmation

### Course-specific use
- 50 EMA over 200 EMA for long bias
- 9 EMA over 15 EMA on 4H with Supertrend as a faster continuation system

### Common mistakes
- overreacting in choppy ranges,
- optimizing the period endlessly,
- forgetting that faster lines create more noise.

## Breakout Probability Expo

### What it appears to be used for
An additional TradingView-style indicator to estimate breakout direction / strength.

### Correct use
Use it as a **secondary confirmation layer** with:
- clear structure,
- level,
- volume,
- trend,
- invalidation.

### Wrong use
Treating “probability” like certainty.

## V Stop / Volatility Stop

### What it does
A volatility-based trailing framework, often ATR-like in behavior.

### Correct use
- helps you stay with the trend,
- useful for trade management,
- can reduce emotional early exits.

### Wrong use
- too-tight settings in volatile stocks,
- using it as a standalone entry trigger,
- forgetting timeframe sensitivity.

## Trendline with Breaks (LuxAlgo-type tool)

### What it does
Automatically highlights likely trendline breaks.

### Correct use
- use it to re-check structure,
- look for close + retest + context,
- combine with price/volume/market bias.

### Wrong use
- blindly buying every auto-detected line break,
- using it in noisy sideways markets,
- assuming auto trendlines match discretionary swing logic.

## Fibonacci Retracement

### Correct drawing logic
- uptrend: swing low to swing high
- downtrend: swing high to swing low

### Practical levels
- 38.2%
- 50%
- 61.8%
- 23.6% in stronger shallow pullbacks

### How the notes simplify it
The course sometimes frames this more roughly as:
- minimum retracement ≈ 33%
- common ≈ 50%
- max acceptable ≈ 62%

That is not strict textbook Fibonacci language, but it is a useful classroom simplification.

### Correct use
- confluence with structure,
- support/resistance,
- demand zone,
- moving average,
- reaction candle.

### Wrong use
- forcing Fibonacci on chop,
- treating fib levels as automatic reversal points,
- ignoring invalidation.

---

# Part 11 — Unified screener bank and external reference list

## Investment / monthly scanners
- `https://chartink.com/screener/investment-bb-strategy`
- multi-year base breakout workflows on monthly chart (manually or via custom screener)

## Swing / continuation scanners
- `https://chartink.com/screener/tc-long-1`
- `https://chartink.com/screener/sma-13-34-scan-2`
- `https://chartink.com/screener/44-ma-7869488307`
- `https://chartink.com/screener/supertrend-in-green-and-green-candle-in-4-hour-chart-above-9-and-15-ema`
- `https://chartink.com/screener/20-day-breakout-stocks`

## Strength / momentum references
- `https://economictimes.indiatimes.com/stocks/marketstats-technicals/rsi-above-80`
- `https://www.nseindia.com/market-data/52-week-high-equity-market`

## BTST references
- `http://moneycontrol.com/stocks/market-stats/top-gainers-nse/`
- `https://www.moneycontrol.com/stocks/market-stats/volume-shockers-nse/`

## Utility reference
- `https://www.icicidirect.com/calculators/future-value-calculator`

## How to use this screener bank correctly

Do not treat screeners as signal truth.
A screener is only a **candidate generator**.

The proper flow is:
1. scan,
2. shortlist,
3. validate structure,
4. validate context,
5. validate risk,
6. only then consider execution.

---

# Part 12 — Unified operating workflow

## 1. Daily pre-market workflow

### Step 1 — read global / market context first
Check:
- GIFT Nifty
- Dow Jones
- E-mini Dow Futures (`YM1!`)
- Gold
- Crude Oil
- FII/FPI and DII flow if available

### Step 2 — form a bias, not a prediction
Possible bias states:
- bullish alignment,
- mixed / cautious,
- hostile / stand-aside.

### Step 3 — only then open stock-level screeners
Do **not** reverse the sequence.
That is one of the cleaner teaching points from Session 8.

## 2. Daily swing workflow

### Candidate generation
- run relevant swing scanners,
- filter by liquidity,
- filter by market alignment,
- filter by strategy fit.

### Candidate validation
- is Nifty aligned?
- is the setup actually one of the taught setups?
- is entry clear?
- is stop clear?
- is target / trail clear?
- is quantity derived from risk?

### Candidate execution
- enter only after confirmation,
- avoid forcing trades in no-trade zones,
- write down the reason before taking the trade.

## 3. BTST workflow

### Candidate source
Intersect:
- Top Gainers
- Volume Shockers

### Additional filters
- delivery preferably high,
- market context not hostile,
- avoid Friday,
- avoid pre-holiday,
- avoid distorted derivative-expiry behavior.

### Exit mindset
This is a short-duration swing, not an “investment because it moved.”

## 4. Weekly review workflow

At the end of the week review:
- which strategies produced candidates,
- which generated false positives,
- whether you respected stops,
- whether you violated process,
- whether market context was ignored,
- whether you mixed strategies.

## 5. Month-end investment workflow

### Step 1
Run month-end investment scanners near the last trading day.

### Step 2
Check:
- MBB candidates,
- BB candidates,
- monthly momentum,
- business quality,
- liquidity.

### Step 3
Reduce to a very small final list.

### Step 4
Use conditional execution, not impulsive buying.

### Step 5
Track them in an investment bucket separately from swing trades.

---

# Part 13 — Strategy cards (operator version)

## Strategy Card — Buying in the Dips

### Category
Swing

### Timeframe logic
- Higher timeframe quality: monthly RSI positive / above threshold
- Execution timeframe: daily

### Core idea
Buy controlled pullbacks in already-strong stocks.

### Preferred context
- Nifty supportive
- stock already structurally strong
- dip is orderly, not a breakdown

### Trigger style
- daily weakness into a better area,
- then bullish recovery / resolution.

### Exit style
- trail from daily swing structure,
- or use the RSI / trend weakening logic as secondary aid.

### Hard warning
Do not confuse a breakdown with a dip.

## Strategy Card — Cross Strategy

### Category
Swing

### Core idea
Look for a green recovery candle near the lower Bollinger Band while trendline / VWAP confluence supports reversal.

### Best environment
- broader momentum still constructive,
- temporary local weakness,
- lower BB not aggressively sloping down,
- Nifty not hostile.

### Confirmation stack
- lower Bollinger Band interaction,
- green candle,
- downward trendline break,
- VWAP support / cross,
- divergence optional as extra evidence.

## Strategy Card — ABC Strategy

### Category
Swing

### Components
- A = 50 SMA
- B = lower Bollinger Band interaction
- C = green daily candle

### Entry
- 1% above trigger candle

### Stop
- recent daily swing low

### Trail
- 50 SMA

### Hard warning
Without supportive market context, ABC becomes just another bounce guess.

## Strategy Card — Breakout Strategy

### Category
Swing

### Conditions
- big green candle,
- body at least ~70%,
- volume > previous day,
- delivery strong,
- close at least 1% above resistance,
- positive market context.

### Hard warning
Breakouts that lack delivery or close too close to resistance are classic traps.

## Strategy Card — BTST

### Category
Short swing / overnight

### Candidate source
Common names between top gainers and volume shockers.

### Filters
- delivery strength,
- avoid Friday / holiday-eve / distorted expiry backdrop,
- market context not hostile.

### Exit
Fast. This is not meant to become a long-term hold by emotional drift.

## Strategy Card — Trend Continuation

### Category
Swing / position continuation

### Core logic
- monthly RSI > 60,
- daily continuation confirmation,
- Supertrend / moving averages can assist holding.

### Hard warning
Continuation only works when primary trend quality is already strong.

## Strategy Card — 13/34 SMA continuation

### Category
Swing

### Logic
- 200 SMA uptrend defines the regime,
- 13 / 34 SMA help identify tactical continuation,
- “deep U” / rounded pullback preferred over chop.

## Strategy Card — 44 SMA support play

### Category
Swing

### Logic
- 44 SMA rising,
- price pulls back toward it,
- rebound confirms dynamic support.

## Strategy Card — 9/15 EMA + Supertrend 4H

### Category
Fast swing

### Logic
- 9 EMA crosses above 15 EMA,
- Supertrend green,
- 4-hour chart confluence.

---

# Part 14 — One-page master discipline sheet

## The real hierarchy of the course

This course is **not** really teaching “find a cool indicator.”
It is teaching the following hierarchy:

1. understand the market,
2. understand trend and momentum,
3. understand levels and zones,
4. understand that indicators are secondary,
5. build a complete system,
6. separate investing from swing trading,
7. read the broader market before the stock,
8. validate with scanners,
9. risk-size every trade,
10. stay patient,
11. keep strategies separate,
12. let discipline beat excitement.

## What a serious student should actually do after reading all of this

### Do
- maintain separate buckets for investing and swing,
- risk from portfolio first,
- track reasons for entry,
- review false positives,
- back-test before scaling,
- stay aligned with broader market,
- use screeners for candidate generation only.

### Do not
- mix all strategies into one hybrid mess,
- chase every scanner result,
- buy without stop / invalidation,
- ignore liquidity,
- act mid-month on month-end investment logic,
- pretend chart strength can compensate for trash fundamentals in long-term investing,
- confuse note shorthand with statistically proven truth.

## Final blunt reading

The notes are useful.
But the edge is not hidden in some secret 9/15/44/BB/RSI combination.

The edge, as repeatedly implied by the course material, is:
- context,
- patience,
- structure,
- risk control,
- execution discipline,
- and not doing stupid things just because a scanner flashed a name.

That is the actual master note.
