# Investment Bible OS — Product Documentation

Last updated: 17 April 2026
Audience: Product Owners, Business Analysts, Operations Stakeholders

## 1. Product Purpose

Investment Bible OS is a decision-support platform for Indian equity analysis. It helps users:
- Review market conditions before and after market hours
- Identify stock opportunities using rule-based strategies
- Compare multiple screening methods and find overlap candidates
- Track watchlists and shortlisted stocks
- Run historical simulations to validate ideas
- Apply disciplined risk sizing for position planning

The platform is educational and process-oriented. It does not replace professional financial advice.

## 2. Core Business Value

The platform delivers value in five ways:
1. Standardization: Converts informal trading/investing ideas into repeatable decision frameworks.
2. Speed: Reduces manual scanning effort by automating candidate discovery.
3. Transparency: Explains why a stock was selected or rejected.
4. Discipline: Enforces risk and review frameworks (daily, weekly, month-end).
5. Traceability: Maintains records of runs, outcomes, and operational activity.

## 3. Primary User Roles

### 3.1 Individual Analyst / Trader
- Reviews daily opportunities
- Uses strategy and screener outputs
- Builds and monitors watchlists
- Runs quick backtests before acting

### 3.2 Long-Term Investor
- Focuses on month-end investment setups
- Uses monthly trend and breakout frameworks
- Tracks high-conviction candidates over longer horizons

### 3.3 Product/Operations Admin
- Maintains strategy and screener versions
- Monitors system runs and data health
- Manages ambiguity notes, references, and feature toggles

## 4. End-to-End Product Workflow

## 4.1 Pre-Market Workflow
- The system prepares a pre-market brief.
- It evaluates global and domestic context factors.
- It produces a market posture (Favorable / Mixed / Hostile).
- Users review context before planning the day.

## 4.2 Post-Close Workflow
- The system evaluates active stocks against strategies and screeners.
- It produces a post-close summary with match counts and highlights.
- Users review candidates for next-session planning.

## 4.3 Month-End Workflow
- Month-end investment-focused scans are executed.
- Monthly setups are reviewed with stronger noise filtering.
- Users identify long-term entry watchlists.

## 4.4 Weekly Review Workflow
- Weekly summary consolidates strategy/screener activity.
- It highlights top confluence candidates and operational outcomes.
- Users perform process review and prioritization for next week.

## 5. Product Modules

## 5.1 Dashboard
Purpose:
- Single-page operational and market summary.

What users get:
- Latest digest status
- Strategy/screener activity snapshot
- System freshness indicators
- Priority review signals

## 5.2 Digest Center
Purpose:
- Structured market summaries by review cycle.

Digest types:
- Pre-Market Brief
- Post-Close Summary
- Month-End Review
- Weekly Summary

Business outcome:
- Users consume decision context quickly without visiting multiple external sources.

## 5.3 Strategy Center
Purpose:
- Manage and review strategy definitions and outcomes.

What users see:
- Strategy purpose and status
- Active version and historical versions
- Rule clarity and ambiguity notes
- Recent match history

## 5.4 Screener Lab
Purpose:
- Explore screening outputs and create confluence sets.

Capabilities:
- Run individual screeners
- Combine multiple screeners
- Use overlap logic (intersection, union, difference)
- Save resulting candidates to watchlists

Business outcome:
- Higher confidence candidates through multi-screener confirmation.

## 5.5 Stocks and Watchlists
Purpose:
- Convert scans into actionable monitoring lists.

Capabilities:
- View stock details
- Add/remove watchlist candidates
- Maintain active/inactive candidate status

## 5.6 Backtesting Workspace
Purpose:
- Validate strategy behavior on past market periods.

Capabilities:
- Run strategy simulations over selected periods
- View trade-level outputs and aggregate metrics
- Compare historical behavior across setups

Business outcome:
- Improves strategy confidence and expectation-setting.

## 5.7 Learning and Knowledge Hub
Purpose:
- Preserve and organize educational context behind strategies.

Includes:
- Session summaries
- Concepts
- Indicators and glossary terms
- Ambiguity explanations

Business outcome:
- Reduces interpretation drift and supports team onboarding.

## 5.8 Risk Calculator
Purpose:
- Enforce consistent risk-based position planning.

Capabilities:
- Position quantity using risk budget
- Per-trade risk amount visibility
- 3R target planning support

Business outcome:
- Improves capital discipline and downside control.

## 6. Strategy Catalog (Business View)

The platform includes 13 strategy frameworks.

## 6.1 Investment Strategies

### Monthly Bollinger Breakout
- Type: Long-term investment
- Review cadence: Month-end
- Focus: Monthly momentum breakout with participation filters

### Multi-Bagger Breakout (Heuristic)
- Type: Long-term investment discovery
- Review cadence: Month-end
- Focus: Structural breakout after long consolidation
- Note: Requires manual confirmation

## 6.2 Swing Strategies

### Buying in the Dips
- Cadence: Daily
- Focus: Buy controlled pullbacks within strong higher-timeframe momentum

### Cross Strategy
- Cadence: Daily
- Focus: Reversal with multiple technical confirmations

### ABC Strategy
- Cadence: Daily
- Focus: Recovery entry after correction structure confirmation

### Breakout Strategy
- Cadence: Daily
- Focus: Quality breakout with candle strength and participation confirmation

### BTST (Buy Today Sell Tomorrow)
- Cadence: Daily
- Focus: Very short-hold momentum candidates

### Trend Continuation
- Cadence: Daily
- Focus: Continue existing strong trend after healthy pullback/resumption

### 13/34 with 200 Trend Strategy
- Cadence: Daily
- Focus: Moving-average continuation in broader uptrend

### 44 Moving Average Strategy
- Cadence: Daily
- Focus: Reclaim of key dynamic support in uptrend

### 9/15 + SuperTrend (4H)
- Cadence: Daily monitoring, faster execution style
- Focus: Fast swing continuation confirmation

### Alpha/Beta Large-Cap Selection
- Cadence: Weekly
- Focus: Selection shortlist framework, not direct trigger

## 6.3 Market Context Engine

### Pre-Market Context Engine
- Cadence: Pre-market
- Focus: Risk posture guidance based on macro and flow signals
- Output: Favorable / Mixed / Hostile posture score

## 7. Screener Catalog (Business View)

## 7.1 Internal Screeners

Investment-oriented:
- Investment BB Internal
- MBB Candidate

Swing/Trend-oriented:
- Trend Continuation Internal
- EMA 9/15 + SuperTrend 4H Internal
- SMA 13/34 Internal
- SMA 44 Internal
- Buying in Dips Candidate
- Cross Strategy Candidate
- ABC Strategy Candidate
- Breakout Quality Internal
- BTST Top Gainers + Volume Shockers Internal

Momentum/Context-oriented:
- RSI Above 80 Internal
- 52-Week High Internal

## 7.2 Reference Screeners

External references are available for context and cross-checking but are treated as reference sources.

## 7.3 Screener Bundles

The platform supports predefined packs:
- Month End Investment
- Swing Daily Check
- Breakout Radar
- BTST Radar
- Strong Confluence Set

Each bundle is designed to reduce noise and accelerate decision review.

## 8. Market Context and Posture Model

The platform combines multiple market cues into one posture score.

Inputs include:
- Early index sentiment cues
- Global equity direction cues
- Defensive asset behavior cues
- Energy price cues
- Institutional flow cues

Output behavior:
- Favorable: Conditions broadly supportive
- Mixed: Conditions unclear or balanced
- Hostile: Conditions risk-off or adverse

If some inputs are unavailable, the platform clearly marks reduced-confidence mode rather than fabricating signals.

## 9. Backtesting and Validation Outcomes

Backtesting provides:
- Number of historical trades
- Win rate
- Average win/loss profile
- Drawdown view
- Profit efficiency view
- Holding period patterns

Business usage:
- Compare strategy reliability
- Align expectations before live usage
- Improve rule quality through retrospective analysis

## 10. Administration and Governance Features

Admin functions support product governance:
- Strategy activation/deactivation
- Version activation controls
- Screener activation controls
- Ambiguity management and normalization notes
- Reference library management
- Feature toggle management
- Operational run monitoring
- Manual rerun controls

Business value:
- Keeps product behavior controlled and auditable.

## 11. Operational Reliability Features

System reliability controls include:
- Duplicate-run prevention for scheduled jobs
- Retry support for recoverable failures
- Job status tracking (running/completed/failed)
- Operational audit logs for key actions
- Degraded-mode rendering when data is incomplete

Business value:
- Stable daily operation with clear visibility of exceptions.

## 12. Current Feature Availability Snapshot

Currently strong and active:
- Digest workflows
- Strategy/screener evaluation workflows
- Screener confluence workflow
- Watchlist workflow
- Knowledge and ambiguity workflows
- Risk calculator
- Admin observability workflows

Available but organization-dependent for deeper use:
- Broader external provider expansion
- Full production rollout of optional modules based on policy/toggle choice

## 13. Business KPIs This Product Can Support

Suggested KPI framework:
1. Daily candidate generation count
2. Confluence-qualified candidate ratio
3. Post-close to watchlist conversion rate
4. Strategy hit-rate trend by month
5. Backtest expectancy by strategy family
6. Data completeness and degraded-mode frequency
7. Operational run success rate
8. Review-cycle adherence (daily/weekly/month-end)

## 14. Product Boundaries and Usage Notes

- This is a decision-support platform, not an execution platform.
- It is designed for disciplined analysis workflows.
- Final trade/investment decisions remain user responsibility.
- Educational and process consistency are first-class goals.

## 15. One-Page Summary for Stakeholders

Investment Bible OS is a structured market-analysis product that turns strategy playbooks into repeatable workflows. It combines market context, strategy/screener logic, confluence analysis, backtesting, and risk sizing into a single operating layer for Indian equity analysis. It is suited for users who need consistency, traceability, and faster review cycles across pre-market, post-close, and month-end decision windows.
