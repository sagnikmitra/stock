/**
 * Basic exchange calendar awareness for trading days and month gating.
 * Determines valid trading days by accounting for weekends and known holidays.
 */
export class ExchangeCalendar {
  private holidays: Set<string>;

  constructor(holidays: string[] = []) {
    this.holidays = new Set(holidays);
  }

  /** Helper: convert UTC Date to YYYY-MM-DD */
  private _toYMD(date: Date): string {
    return [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-");
  }

  /** Return true if date is weekday and not a holiday */
  isTradingDay(date: Date): boolean {
    const day = date.getUTCDay(); // 0 is Sunday, 6 is Saturday
    if (day === 0 || day === 6) {
      return false; // Weekend
    }
    const ymd = this._toYMD(date);
    if (this.holidays.has(ymd)) {
      return false; // Holiday
    }
    return true;
  }

  /** Steps backward day-by-day until a valid trading day is found */
  getPreviousTradingDay(date: Date): Date {
    const d = new Date(date.getTime());
    d.setUTCDate(d.getUTCDate() - 1);
    while (!this.isTradingDay(d)) {
      d.setUTCDate(d.getUTCDate() - 1);
    }
    return d;
  }

  /** Check if the passed date is the last trading day of its respective month */
  isMonthEnd(date: Date): boolean {
    if (!this.isTradingDay(date)) return false;

    // Scan forward to the very next trading day
    const nextTradingDay = new Date(date.getTime());
    do {
      nextTradingDay.setUTCDate(nextTradingDay.getUTCDate() + 1);
    } while (!this.isTradingDay(nextTradingDay));

    // If the next valid trading day is in a new month, then parameter 'date' is month-end
    return nextTradingDay.getUTCMonth() !== date.getUTCMonth();
  }
}

/**
 * Shared instance for the NSE (National Stock Exchange).
 * Hardcoded MVP holidays for 2026/2027.
 */
export const nseCalendar = new ExchangeCalendar([
  "2026-01-26", // Republic Day
  "2026-03-20", // Holi (approx)
  "2026-04-10", // Good Friday (approx)
  "2026-05-01", // Maharashtra Day
  "2026-08-15", // Independence Day
  "2026-10-02", // Gandhi Jayanti
  "2026-11-08", // Diwali (approx)
  "2026-12-25", // Christmas
]);
