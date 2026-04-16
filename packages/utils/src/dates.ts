/** Convert UTC Date to IST string */
export function toIST(date: Date): string {
  return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

/** Check if NSE market is currently open (9:15 AM - 3:30 PM IST, weekdays) */
export function isMarketOpen(now = new Date()): boolean {
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = ist.getDay();
  if (day === 0 || day === 6) return false;

  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeMinutes = hours * 60 + minutes;

  // 9:15 AM = 555 min, 3:30 PM = 930 min
  return timeMinutes >= 555 && timeMinutes <= 930;
}

/** Get last trading day (skip weekends). Does not account for holidays. */
export function getLastTradingDay(from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

/** Check if date is last calendar day of month */
export function isMonthEnd(date = new Date()): boolean {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next.getMonth() !== date.getMonth();
}

/** Parse YYYY-MM-DD to Date at midnight UTC */
export function parseMarketDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
