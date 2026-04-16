# WithArin Stock Market Weekend 29th Batch — Session 9
## Claude Code Extended Reference Document

## 1. Document Purpose

This document is a structured, Claude Code-friendly markdown rewrite of the original Session 9 extended summary. It is intended to serve as a clean reference artifact for downstream use cases such as:

- building notes, study tools, or course knowledge bases
- converting session content into structured strategy documentation
- generating educational UI/content from trading class material
- extracting technical rules, filters, workflows, and teaching insights

This is **not** a verbatim transcript. It is a reconstructed teaching document based on an approximate translated transcript.

---

## 2. Source and Reliability

**Primary source:** `witharin-session9-transcript-proper.md`  
**Transcription basis:** local `mlx-community/whisper-large-v3-turbo` translate pass  
**Original content type:** code-switched Bengali/English class recording  
**Session reference:** lesson `2225223`, Vimeo video id `1182519408`

### Reliability notes

- The source transcript is approximate, not literal.
- Audio contains Bengali-English code-switching.
- Automatic translation may introduce mistranscriptions, paraphrases, or hallucinated words during silence.
- Numeric examples, student names, and anecdotal claims should be treated cautiously.
- Strategy logic is more reliable than anecdotal storytelling details.

---

## 3. Session Metadata

| Field | Value |
|---|---|
| Batch | Stock Market Weekend 29th Batch |
| Session | Session 9 |
| Approx. duration | ~2 hours 30 minutes |
| Course block position | Final session of the swing-trading block |
| Prior session dependencies | Session 7 and Session 8 |
| Next learning transition | Intraday / F&O track |

### Context from earlier sessions

Session 9 builds on prior swing-trading lessons:

- **Session 7:** Buying-in-the-Dips, Cross Strategy
- **Session 8:** pre-market context reading, ABC strategy using 50 SMA + Bollinger Bands + green candle
- **Session 9:** Breakout, BTST, Trend Continuation, SMA/EMA-based setups, mutual-fund-led stock discovery, and trader mindset framing

---

## 4. Executive Summary

Session 9 functions as the closing module of the swing-trading section. The session adds several practical strategy frameworks on top of prior lessons, especially around:

- breakout validation
- short-duration overnight swing trades (BTST)
- alpha/beta-based stock screening
- trend continuation using RSI and Super Trend
- moving-average crossover and pullback systems
- faster swing entries on the 4-hour timeframe
- using mutual fund portfolios as a stock discovery layer

The instructional style combines:

1. technical setup rules
2. screener workflows
3. risk concepts
4. motivational discipline framing

The instructor’s core message is simple: **technical rules matter, but execution discipline matters more**.

---

## 5. Core Teaching Objectives

By the end of this session, a student is expected to understand:

1. how to identify stronger breakouts and avoid weak ones
2. how to run a BTST workflow using public scanners
3. how alpha and beta can be used for stock filtering
4. how to combine monthly and daily indicators for swing continuation trades
5. how moving averages can be used for entry, trend confirmation, and trailing
6. how fund portfolios can act as a pre-filtered fundamental universe
7. why back-testing and discipline are mandatory before risking capital

---

## 6. Teaching Flow Overview

The session broadly follows this sequence:

1. Breakout Strategy
2. BTST (Buy Today, Sell Tomorrow)
3. Systematic vs unsystematic risk
4. Alpha and beta explanation
5. Alpha/Beta screener workflow
6. Trend Continuation Strategy
7. 13/34 SMA + 200 SMA strategy
8. 44 SMA strategy
9. 9/15 EMA + Super Trend on 4-hour chart
10. Mutual-fund-driven stock discovery
11. Algo trading discussion
12. Instructor biography and motivational framing
13. Student Q&A and closing takeaways

---

## 7. Strategy Catalog

## 7.1 Breakout Strategy

### Purpose
Identify swing-long opportunities where price breaks resistance with enough strength to reduce the odds of a false breakout.

### Core logic
A breakout is considered more credible when price expansion, candle quality, volume, and delivery participation all align.

### Conditions
A valid breakout requires all of the following:

1. **Big green candle**  
   The candle body should be visibly stronger than surrounding candles.

2. **Body >= 70% of total candle range**  
   This implies low wick rejection and cleaner directional conviction.

3. **Volume greater than previous day’s volume**  
   The breakout should be supported by higher participation.

4. **Delivery percentage >= 35% to 45%**  
   This helps separate genuine investor participation from pure intraday churn.

5. **Close >= 1% above resistance**  
   The +1% buffer is used as confirmation and to avoid entering marginal or fake breakouts.

### Entry
- Next-day open, or
- confirmation close after the breakout candle

### Stop-loss
- Recent swing low, or
- latest higher low on the daily chart

### Failure filter
Skip the setup if:

- the close does not clear resistance by at least 1%
- delivery percentage is weak
- candle quality is poor despite price crossing resistance

### Instructional takeaway
The instructor presents weak-delivery breakouts as one of the most common retail traps.

---

## 7.2 BTST (Buy Today, Sell Tomorrow)

### Purpose
Capture short-duration overnight upside in a stock that shows strong participation and momentum.

### Positioning
BTST is framed as the shortest version of swing trading, not as intraday trading.

### Workflow
Use `moneycontrol.com` and navigate to:

- **All Stats**
- **Top Gainers**
- **Volume Shockers**

Then take the intersection of:

- Top Gainers
- Volume Shockers

### Filter
Keep only stocks where:

- **Delivery percentage >= 45%**

### Avoid
Do not prefer entries immediately before:

- **Tuesday derivative expiry windows**

Reason given: expiry-related volume can distort the signal.

### Exit
- Next-day open, or
- first sign of strength the next day

### Additional framing
BTST should be used sparingly and ideally when the broader market tailwind supports the trade.

---

## 7.3 Alpha and Beta Screening Workflow

### Purpose
Use relative performance and market sensitivity to narrow the universe to potentially stronger swing candidates.

### Core concepts

#### Systematic risk
Market-wide risk that cannot be diversified away.

Examples include:
- interest rate changes
- geopolitical shocks
- RBI policy moves
- broad market stress

#### Unsystematic risk
Company-specific risk that can be diversified.

Examples include:
- management issues
- sector weakness
- product failures
- business-specific events

#### Beta
Measures how much a stock moves relative to the market.

- **Beta > 1**: more volatile than the market
- **Beta < 1**: less volatile than the market

#### Alpha
Defined in class as:

> stock return minus market return

A positive alpha indicates outperformance relative to the benchmark.

### Instructional interpretation
The instructor’s preference is for stocks with:

- **high alpha**
- **controlled beta**

In plain terms: better-than-market performance without excessive instability.

### Screener workflow
Tool referenced: `tickertip.in`

Step-by-step flow:

1. Open the screener universe
2. Start with the NSE stock universe cited in class (~5,739 names)
3. Filter to **Large Cap**
4. Apply **Alpha >= 15%**
5. Apply **Beta between 0 and 1**
6. Review the resulting shortlist
7. Validate chart structure manually on the daily timeframe before adding to a watchlist

### Reported result during class
- shortlist reduced to roughly **22 names** on the day of the session

---

## 7.4 Trend Continuation Strategy

### Purpose
Capture continuation moves in already-strong stocks using a higher timeframe strength filter and a daily trend confirmation.

### Logic stack
This setup combines:

- **monthly strength filter**
- **daily trend confirmation**
- **technical trailing discipline**

### Rules
1. **Monthly RSI >= 60**  
   Same monthly strength framework used earlier in Buying-in-the-Dips.

2. **Daily close above Super Trend**  
   Super Trend must indicate bullish structure.

3. **Green candle confirmation**  
   Use a confirming bullish candle for entry.

4. **Use +1% buffer**  
   The same confirmation buffer logic applies.

### Entry
- entry on bullish confirmation after filters are satisfied

### Stop-loss
- recent daily swing low

### Trail
- trail using the Super Trend line itself

### Examples mentioned on screen
- ITC
- SBI
- BEL/BIL (ticker uncertain due to transcript quality)

### Instructional framing
This is pitched as a lower-maintenance version of Buying-in-the-Dips because the Super Trend provides an easier trailing mechanism.

---

## 7.5 13 SMA / 34 SMA / 200 SMA Strategy

### Purpose
Use a fast-slow moving-average crossover inside a larger long-term uptrend.

### Long-term trend filter
- stock should be above the **200 SMA**

The 200 SMA is presented as the long-term trend anchor.

### Class claim to retain carefully
The session notes say:

- **200 SMA ~= 314 trading days**

That line is likely inaccurate in literal mathematical terms, but it should be preserved as a source claim rather than treated as a factual trading convention. Do not normalize it silently.

### Entry condition
- **13 SMA crosses above 34 SMA**
- both are above the 200 SMA

### Trade thesis
This represents a bullish resumption inside an already-established primary uptrend.

### Entry
- on the crossover candle

### Stop-loss
- recent swing low

### Trailing method
- trail with 34 SMA, or
- trail using swing structure

### Example used on screen
- Infosys

### Performance framing used in class
- a single-trade annualized figure around **67% over ~30 days** was mentioned

This should not be interpreted as a repeatable expectation.

---

## 7.6 44 SMA Strategy

### Purpose
Use a single moving average as both trend reference and pullback-reclaim trigger in clean-trending stocks.

### Conditions
- stock is in a primary uptrend
- daily close is above the **44 SMA**
- after a pullback, price reclaims the 44 SMA

### Trade idea
This is intended for stocks that respect one average consistently rather than requiring more complex crossover logic.

### Example mentioned
- Glottis Limited

Ticker accuracy is uncertain and may reflect transcription error.

---

## 7.7 9 EMA / 15 EMA + Super Trend on 4-Hour Chart

### Purpose
A faster swing or fast-swing setup for shorter holding periods.

### Timeframe
- **4-hour candles**

### Conditions
A bullish setup requires:

- price above **9 EMA**
- price above **15 EMA**
- **Super Trend is green** on the same 4-hour chart
- a confirming green candle

### Entry
- confirmation candle on the 4-hour chart

### Stop-loss
- recent 4-hour swing low

### Scanner reference
- `chartlink.com`

### Use case
This setup appears intended for candidates already surfaced through prior screening or watchlist preparation.

---

## 8. Fundamental Discovery Layer

## 8.1 Mutual-Fund-Driven Stock Discovery

### Purpose
Use mutual fund holdings as a pre-filtered idea generation engine.

### Tool referenced
- `trendline.com`

### Process
1. Review fund portfolios
2. Focus on:
   - flex-cap funds
   - thematic funds
   - PSU-related funds
   - infrastructure funds
   - solar theme funds
   - EV theme funds
3. Extract top holdings
4. Use those holdings as the candidate universe
5. Apply technical entry logic afterward

### Underlying assumption
If a competent fund manager has already allocated a meaningful position to a stock, the deeper fundamental diligence may already have been performed. The trader can then focus mainly on technical timing.

### Example mentioned
- HDFC Flexi Cap top holdings

### Supporting mental model
The instructor references a Warren Buffett-style exercise:

> if you cannot name a company for each letter of the alphabet, you do not know the stock universe well enough

This is used to push broader market familiarity.

---

## 9. Algo Trading Commentary

### Points made in class
- typical retail algo accuracy was cited as **60% to 70%**
- the main benefit of algo trading is emotional discipline and execution consistency
- the instructor still prefers **manual techno-funda trading** over pure algorithmic execution

### Instructor thesis
The claimed edge comes from combining:

- technical context
- fundamental context
- human judgment

rather than depending purely on a mechanical system.

### Career path note
The **NISM Research Analyst** exam is mentioned as a useful next certification for students who want to pursue the field more seriously.

---

## 10. Mindset and Discipline Layer

## 10.1 Biographical Block

The instructor shares a long personal story to frame discipline, persistence, and credibility.

### Claims mentioned
- academic score of **10 CGPA**
- first job in **Bank of Baroda CMD Secretariat**
- selection described as **3 out of ~180,000 applicants**
- transcript likely misheard this as **1.8 crore**, which is probably wrong
- later moved internally to **Treasury**
- later joined **Dun & Bradstreet India** in a consulting leadership role
- clients named include:
  - Tata Motors
  - Titan
  - Tanishq
  - Hindustan Unilever
  - P&G
  - Dr Reddy’s
- eventually left corporate work to build the training/trading path

### Purpose of this block
The biography is used less as factual documentation and more as a motivational device to reinforce:

- focus
- long-term consistency
- discipline under pressure
- attitude as a career multiplier

---

## 10.2 Raj Q&A — Discipline Aphorisms

The session closes with a short motivational exchange, producing a set of memorable rules.

### Key lines retained from the summary
- **Don't reason yourself out.**
- **The harder you work, the luckier you get.**
- **You need to be a little mad to succeed.**
- **Attitude is more important than technique.**
- **Know your why before every trade.**

### Instructional meaning
The exact strategy can vary. What destroys most traders is not the lack of a setup, but the lack of conviction, consistency, and process discipline.

---

## 11. Student Interaction Notes

### Mentioned interactions
- Raj’s motivational prompt and follow-up discussion
- a Baloo Ghat / Malda student question, paraphrased into a reminder about scanner discipline from earlier sessions
- general chat-box greetings and warm-up interaction

These are low-signal for technical extraction but useful for preserving session texture.

---

## 12. Closing Frame and Homework

### Closing transition
Session 9 is explicitly framed as the end of the swing-trading block.

### Next direction
- intraday trading
- F&O-related learning

### Homework assigned
Students are told to:

- back-test every strategy from Sessions 7 to 9
- validate each setup on their own charts
- avoid risking capital until they have personal confidence from testing

### Central rule
Confidence should come from your own back-test, not from the instructor’s confidence.

---

## 13. Condensed Strategy Reference

| Strategy | Core Filters | Entry | Stop-loss | Exit / Trail | Notes |
|---|---|---|---|---|---|
| Breakout | Big green candle, body >= 70%, vol > prior day, delivery >= 35-45%, close >= 1% above resistance | Next-day open or confirmation close | Swing low / higher low | Not explicitly defined beyond trade management | Anti-false-breakout emphasis |
| BTST | Top Gainers ∩ Volume Shockers, delivery >= 45% | Same day for overnight hold | Not clearly specified in summary | Next-day open or first strength | Avoid Tuesday expiry distortion |
| Alpha/Beta Screener | Alpha >= 15%, Beta 0 to 1, Large Cap | Manual chart confirmation | Depends on setup chosen later | Depends on trade structure | Used for stock selection, not direct execution |
| Trend Continuation | Monthly RSI >= 60, daily close above Super Trend, green candle, +1% buffer | Confirmation candle | Daily swing low | Trail with Super Trend | Lower-maintenance trend system |
| 13/34/200 SMA | 13 SMA crosses above 34 SMA, both above 200 SMA | Crossover candle | Swing low | Trail with 34 SMA or structure | Primary trend continuation |
| 44 SMA | Daily close above 44 SMA, reclaim after pullback | Reclaim confirmation | Not clearly stated | Implied trend-following management | For clean-trending stocks |
| 9/15 EMA + ST (4H) | Price above 9 EMA and 15 EMA, Super Trend green, green candle | Confirmation on 4H | Recent 4H swing low | Not clearly stated | Fast swing setup |

---

## 14. Tool and Website Mentions

| Tool / Site | Mentioned Use |
|---|---|
| moneycontrol.com | BTST scanning via All Stats, Top Gainers, Volume Shockers |
| tickertip.in | Alpha/Beta screener |
| chartlink.com | Surfacing 4-hour setup candidates |
| trendline.com | Mutual fund holdings and idea discovery |

---

## 15. Key Takeaways for Notes or Productization

If this session is being converted into a study tool, course notes app, or educational product, the strongest extractable ideas are:

1. **Breakouts need confirmation, not excitement.**
2. **Delivery percentage is treated as a conviction filter.**
3. **Alpha/Beta is used for narrowing, not blindly buying.**
4. **Multi-timeframe alignment matters.**
5. **Simple moving-average systems can still be valid if applied inside a trend.**
6. **Fund portfolios can be used as stock idea generators.**
7. **The instructor repeatedly prioritizes discipline over indicator obsession.**
8. **Back-testing is positioned as non-negotiable.**

---

## 16. Ambiguities and Data Quality Flags

The following details should be treated as uncertain or potentially mistranscribed:

- exact spelling of some stock names and student names
- the BEL/BIL mention in the trend continuation example
- Glottis Limited reference in the 44 SMA example
- the claim that 200 SMA equals approximately 314 trading days
- the Bank of Baroda selection figure described as 1.8 crore vs 1.8 lakh
- any on-screen performance numbers used in anecdotal examples

If this document is later used for structured extraction, these fields should be tagged as `uncertain` rather than normalized without evidence.

---

## 17. Non-Negotiable Caveats

- This document is **educational reconstruction**, not a literal transcript.
- It should **not** be treated as financial advice.
- Performance examples cited in the session are anecdotal and not strategy-wide expected returns.
- The original audio and transcript quality impose hard accuracy limits.
- Any future conversion into structured trading rules should preserve uncertainty labels where the source is weak.

---

## 18. Recommended Claude Code Usage Instructions

If this document is passed into Claude Code as context, the model should:

1. treat it as a **reference summary**, not a source of exact quotes
2. preserve all uncertainty notes during downstream transformation
3. avoid converting anecdotal performance into claims of expected returns
4. separate:
   - strategy rules
   - screener workflows
   - motivational commentary
   - factual claims with uncertainty
5. prefer structured output formats when transforming this document further, such as:
   - strategy JSON
   - lesson plans
   - markdown course notes
   - database-ready teaching artifacts

---

## 19. Minimal Structured Extraction Block

```yaml
session:
  batch: "Stock Market Weekend 29th Batch"
  session_number: 9
  duration_approx: "2h 30m"
  block_role: "final swing-trading class"

strategies:
  - name: "Breakout"
    filters:
      - "big green candle"
      - "body >= 70% of candle range"
      - "volume > prior day"
      - "delivery percentage >= 35-45%"
      - "close >= 1% above resistance"
    entry: "next-day open or confirmation close"
    stop_loss: "swing low / recent higher low"

  - name: "BTST"
    filters:
      - "Top Gainers intersect Volume Shockers"
      - "delivery percentage >= 45%"
      - "avoid Tuesday expiry distortion"
    exit: "next-day open or first strength"

  - name: "Trend Continuation"
    filters:
      - "monthly RSI >= 60"
      - "daily close above Super Trend"
      - "green candle confirmation"
      - "+1% buffer"
    stop_loss: "daily swing low"
    trail: "Super Trend"

  - name: "13/34 SMA + 200 SMA"
    filters:
      - "13 SMA crosses above 34 SMA"
      - "both above 200 SMA"
    stop_loss: "swing low"
    trail: "34 SMA or swing structure"

  - name: "44 SMA"
    filters:
      - "primary uptrend"
      - "daily close above 44 SMA"
      - "reclaim after pullback"

  - name: "9/15 EMA + Super Trend (4H)"
    filters:
      - "price above 9 EMA"
      - "price above 15 EMA"
      - "Super Trend green"
      - "green confirmation candle"
    stop_loss: "recent 4H swing low"

concepts:
  - "systematic risk"
  - "unsystematic risk"
  - "alpha"
  - "beta"
  - "discipline over technique"
  - "back-testing before capital deployment"
```

---

## 20. Final Summary

Session 9 is best understood as a consolidation class. It does not introduce one single grand theory. Instead, it adds a practical toolkit:

- validated breakout logic
- BTST scanning
- alpha/beta stock filtering
- trend continuation rules
- MA-based swing setups
- fast-swing 4H logic
- mutual-fund-led stock sourcing
- a strong psychological emphasis on discipline and back-testing

The technical systems are simple enough to learn. The real instructional weight of the class is on **screening discipline, rule-based confirmation, and trader mindset**.
