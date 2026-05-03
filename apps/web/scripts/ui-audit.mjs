import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.UI_AUDIT_BASE_URL || "http://localhost:3000";
const OUT_DIR = path.resolve("test-results/ui-audit");

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1024, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile-lg", width: 430, height: 932 },
  { name: "mobile-sm", width: 360, height: 740 },
];

const MAX_ROUTES = Number(process.env.UI_AUDIT_MAX_ROUTES || 35);
const MAX_DEPTH = Number(process.env.UI_AUDIT_MAX_DEPTH || 3);

const FORCE_ROUTES = [
  "/",
  "/strategies/investment_bb_monthly",
  "/strategies/investment_bb_monthly/history",
  "/strategies/investment_bb_monthly/backtest",
  "/buying-guide",
  "/screener-lab",
  "/screener-lab/builder",
  "/screener-lab/intersections",
  "/screener-lab/presets",
  "/screener-lab/saved",
  "/digest",
  "/digest/pre-market",
  "/digest/close",
  "/digest/month-end",
  "/backtest/replay",
  "/watchlists",
  "/stocks",
  "/stocks/RELIANCE",
  "/references",
  "/market-context/breadth",
  "/market-context/global-cues",
  "/market-context/fii-dii",
  "/market-context/52-week",
  "/tools/position-size",
].sort();

const SKIP_CRAWLED_PREFIXES = [
  "/stocks/",
  "/watchlists/",
  "/backtest/",
  "/learning/",
  "/strategies/",
];

const slugify = (value) =>
  value
    .replace(/https?:\/\//g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "root";

const normalizePath = (value) => {
  if (!value) return null;
  try {
    const url = new URL(value, BASE_URL);
    if (url.origin !== new URL(BASE_URL).origin) return null;
    if (url.pathname.startsWith("/_next")) return null;
    if (url.pathname.startsWith("/api")) return null;
    if (url.pathname === "/") return "/";
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return null;
  }
};

async function crawlRoutes(browser) {
  const context = await browser.newContext({ viewport: VIEWPORTS[0] });
  const page = await context.newPage();

  const seen = new Set();
  const queue = [{ route: "/", depth: 0 }];

  while (queue.length > 0 && seen.size < MAX_ROUTES) {
    const { route, depth } = queue.shift();
    if (seen.has(route)) continue;

    const routePath = normalizePath(route);
    if (!routePath) continue;

    const response = await page.goto(`${BASE_URL}${routePath}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const status = response?.status() ?? 0;
    if (status >= 400) {
      seen.add(route);
      continue;
    }

    seen.add(routePath);

    if (depth >= MAX_DEPTH) continue;

    const links = await page.$$eval("a[href]", (anchors) =>
      anchors.map((a) => a.getAttribute("href") || ""),
    );

    for (const href of links) {
      const normalized = normalizePath(href);
      if (!normalized || normalized.startsWith("/api") || normalized.startsWith("/_next")) {
        continue;
      }

      if (!FORCE_ROUTES.includes(normalized) && SKIP_CRAWLED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
        continue;
      }

      if (!seen.has(normalized)) {
        queue.push({ route: normalized, depth: depth + 1 });
      }
    }
  }

  await context.close();
  return [...seen];
}

async function auditRoute(browser, route, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleIssues = [];

  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      consoleIssues.push({ type, text: msg.text() });
    }
  });

  let status = 0;
  let navigationError = null;

  try {
    const response = await page.goto(`${BASE_URL}${route}`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    status = response?.status() ?? 0;
    await page.waitForTimeout(500);
  } catch (error) {
    navigationError = error instanceof Error ? error.message : String(error);
  }

  let metrics = null;
  if (!navigationError && status > 0 && status < 500) {
    metrics = await page.evaluate(() => {
      const toSelector = (el) => {
        if (!(el instanceof Element)) return "unknown";
        const parts = [];
        let current = el;
        let depth = 0;
        while (current && depth < 4) {
          let part = current.tagName.toLowerCase();
          if (current.id) {
            part += `#${current.id}`;
            parts.unshift(part);
            break;
          }
          const className = (current.getAttribute("class") || "")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .join(".");
          if (className) part += `.${className}`;
          parts.unshift(part);
          current = current.parentElement;
          depth += 1;
        }
        return parts.join(" > ");
      };

      const viewportWidth = window.innerWidth;
      const doc = document.documentElement;
      const body = document.body;

      const overflowX = Math.max(0, doc.scrollWidth - viewportWidth, body ? body.scrollWidth - viewportWidth : 0);
      const overflowY = Math.max(0, doc.scrollHeight - window.innerHeight);

      const offenders = [];
      const candidates = Array.from(document.querySelectorAll("body *"));
      for (const el of candidates) {
        if (!(el instanceof HTMLElement)) continue;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) continue;

        const rightOverflow = rect.right - viewportWidth;
        const leftOverflow = 0 - rect.left;
        const maxOverflow = Math.max(rightOverflow, leftOverflow);
        if (maxOverflow > 1) {
          // Ignore elements that sit inside an intentionally horizontal scroll region.
          let scrollableAncestor = false;
          let parent = el.parentElement;
          while (parent) {
            const parentStyle = window.getComputedStyle(parent);
            const overflowX = parentStyle.overflowX;
            if (overflowX === "auto" || overflowX === "scroll") {
              scrollableAncestor = true;
              break;
            }
            parent = parent.parentElement;
          }
          if (scrollableAncestor) continue;
          offenders.push({
            selector: toSelector(el),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            overflowPx: Math.round(maxOverflow),
          });
          if (offenders.length >= 10) break;
        }
      }

      const tapTargetIssues = [];
      const interactive = Array.from(
        document.querySelectorAll(
          "a,button,input,select,textarea,[role='button'],[tabindex]:not([tabindex='-1'])",
        ),
      );
      for (const el of interactive) {
        if (!(el instanceof HTMLElement)) continue;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) continue;
        if (rect.width < 40 || rect.height < 40) {
          tapTargetIssues.push({
            selector: toSelector(el),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            text: (el.textContent || "").trim().slice(0, 50),
          });
          if (tapTargetIssues.length >= 15) break;
        }
      }

      const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((el) => ({
        level: Number(el.tagName[1]),
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120),
      }));

      let headingJump = false;
      for (let i = 1; i < headings.length; i += 1) {
        if (headings[i].level - headings[i - 1].level > 1) {
          headingJump = true;
          break;
        }
      }

      const h1Count = headings.filter((h) => h.level === 1).length;

      const clippedText = [];
      for (const el of candidates) {
        if (!(el instanceof HTMLElement)) continue;
        const style = window.getComputedStyle(el);
        const hasText = (el.textContent || "").trim().length > 24;
        if (!hasText) continue;
        const hidesOverflow = style.overflow === "hidden" || style.overflowY === "hidden";
        if (!hidesOverflow) continue;
        if (el.scrollHeight - el.clientHeight > 6) {
          clippedText.push({
            selector: toSelector(el),
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
          });
          if (clippedText.length >= 10) break;
        }
      }

      const textOverflowIssues = [];
      for (const el of candidates) {
        if (!(el instanceof HTMLElement)) continue;
        const text = (el.textContent || "").trim();
        if (text.length < 10) continue;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        if (el.clientWidth < 1 || el.clientHeight < 1) continue;

        const tag = el.tagName.toLowerCase();
        const textishTag =
          tag === "p" ||
          tag === "a" ||
          tag === "span" ||
          tag === "h1" ||
          tag === "h2" ||
          tag === "h3" ||
          tag === "h4" ||
          tag === "h5" ||
          tag === "h6" ||
          tag === "li" ||
          tag === "td" ||
          tag === "th" ||
          tag === "label" ||
          tag === "code" ||
          tag === "pre";

        if (!textishTag && el.children.length > 0) continue;

        const hasOverflowX = el.scrollWidth - el.clientWidth > 2;
        if (!hasOverflowX) continue;

        let scrollableAncestor = false;
        let parent = el.parentElement;
        while (parent) {
          const parentStyle = window.getComputedStyle(parent);
          if (parentStyle.overflowX === "auto" || parentStyle.overflowX === "scroll") {
            scrollableAncestor = true;
            break;
          }
          parent = parent.parentElement;
        }
        if (scrollableAncestor) continue;

        textOverflowIssues.push({
          selector: toSelector(el),
          overflowPx: Math.round(el.scrollWidth - el.clientWidth),
          text: text.slice(0, 80),
        });
        if (textOverflowIssues.length >= 15) break;
      }

      return {
        title: document.title,
        viewportWidth,
        overflowX,
        overflowY,
        offenders,
        tapTargetIssues,
        h1Count,
        headingJump,
        headingCount: headings.length,
        headings: headings.slice(0, 12),
        clippedText,
        textOverflowIssues,
      };
    });
  }

  const routeSlug = slugify(route === "/" ? "home" : route);
  const shotName = `${routeSlug}__${viewport.name}.png`;
  const screenshotPath = path.join(OUT_DIR, shotName);

  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } catch {
    // ignore screenshot failures
  }

  await context.close();

  const severity = (() => {
    if (navigationError || status >= 500 || status === 0) return "critical";
    if (!metrics) return "major";
    if (metrics.overflowX > 16) return "critical";
    if (metrics.overflowX > 0 || metrics.offenders.length > 0) return "major";
    if (metrics.textOverflowIssues.length > 0) return "major";
    if (metrics.h1Count !== 1) return "major";
    if (metrics.headingJump) return "moderate";
    if (viewport.width <= 768 && metrics.tapTargetIssues.length >= 8) return "moderate";
    if (consoleIssues.length > 0 || metrics.clippedText.length > 0) return "moderate";
    return "ok";
  })();

  return {
    route,
    viewport: viewport.name,
    width: viewport.width,
    height: viewport.height,
    status,
    navigationError,
    severity,
    consoleIssues,
    metrics,
    screenshotPath,
  };
}

function summarize(results) {
  const bySeverity = { critical: 0, major: 0, moderate: 0, ok: 0 };
  for (const result of results) {
    bySeverity[result.severity] += 1;
  }

  const overflowFindings = results.filter((r) => (r.metrics?.overflowX || 0) > 0);
  const hierarchyFindings = results.filter(
    (r) => r.metrics && (r.metrics.h1Count !== 1 || r.metrics.headingJump),
  );
  const responsiveFindings = results.filter(
    (r) => r.width <= 768 && (r.metrics?.tapTargetIssues?.length || 0) >= 3,
  );
  const textOverflowFindings = results.filter(
    (r) => (r.metrics?.textOverflowIssues?.length || 0) > 0,
  );

  return {
    totalChecks: results.length,
    uniqueRoutes: [...new Set(results.map((r) => r.route))].length,
    bySeverity,
    overflowFindings,
    textOverflowFindings,
    hierarchyFindings,
    responsiveFindings,
  };
}

function buildMarkdown(summary, results) {
  const lines = [];
  lines.push("# UI Design Audit Report");
  lines.push("");
  lines.push(`Base URL: ${BASE_URL}`);
  lines.push(`Checks run: ${summary.totalChecks}`);
  lines.push(`Routes audited: ${summary.uniqueRoutes}`);
  lines.push("");
  lines.push("## Severity Summary");
  lines.push(`- Critical: ${summary.bySeverity.critical}`);
  lines.push(`- Major: ${summary.bySeverity.major}`);
  lines.push(`- Moderate: ${summary.bySeverity.moderate}`);
  lines.push(`- OK: ${summary.bySeverity.ok}`);
  lines.push("");

  const emitGroup = (title, filterFn) => {
    lines.push(`## ${title}`);
    const group = results.filter(filterFn);
    if (group.length === 0) {
      lines.push("- None");
      lines.push("");
      return;
    }

    for (const item of group) {
      lines.push(
        `- ${item.severity.toUpperCase()} ${item.route} [${item.viewport} ${item.width}x${item.height}] status=${item.status || "n/a"}`,
      );
      if (item.navigationError) {
        lines.push(`  - Navigation error: ${item.navigationError}`);
      }
      if (item.metrics?.overflowX) {
        lines.push(`  - Horizontal overflow: ${item.metrics.overflowX}px`);
      }
      if (item.metrics?.offenders?.length) {
        const top = item.metrics.offenders[0];
        lines.push(`  - Top overflow offender: ${top.selector} (+${top.overflowPx}px)`);
      }
      if (item.metrics && item.metrics.h1Count !== 1) {
        lines.push(`  - Heading issue: h1 count=${item.metrics.h1Count}`);
      }
      if (item.metrics?.headingJump) {
        lines.push("  - Heading issue: skipped heading levels (e.g., h2->h4)");
      }
      if ((item.metrics?.tapTargetIssues?.length || 0) > 0 && item.width <= 768) {
        lines.push(`  - Mobile tap targets <40px: ${item.metrics.tapTargetIssues.length}`);
      }
      if ((item.consoleIssues || []).length > 0) {
        lines.push(`  - Console issues: ${item.consoleIssues.length}`);
      }
      if ((item.metrics?.clippedText?.length || 0) > 0) {
        lines.push(`  - Potential clipped text blocks: ${item.metrics.clippedText.length}`);
      }
      if ((item.metrics?.textOverflowIssues?.length || 0) > 0) {
        const top = item.metrics.textOverflowIssues[0];
        lines.push(
          `  - Text overflow issue: ${top.selector} (+${top.overflowPx}px) text="${top.text}"`,
        );
      }
      lines.push(`  - Screenshot: ${item.screenshotPath}`);
    }
    lines.push("");
  };

  emitGroup("Critical Findings", (r) => r.severity === "critical");
  emitGroup("Major Findings", (r) => r.severity === "major");
  emitGroup("Moderate Findings", (r) => r.severity === "moderate");

  lines.push("## Route Coverage");
  for (const route of [...new Set(results.map((r) => r.route))].sort()) {
    lines.push(`- ${route}`);
  }
  lines.push("");

  return lines.join("\n");
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    const crawledRoutes = await crawlRoutes(browser);
    const allRoutes = [...new Set([...crawledRoutes, ...FORCE_ROUTES])].slice(0, MAX_ROUTES);

    const results = [];

    for (const route of allRoutes) {
      for (const viewport of VIEWPORTS) {
        const result = await auditRoute(browser, route, viewport);
        results.push(result);
      }
    }

    const summary = summarize(results);

    const jsonPath = path.join(OUT_DIR, "audit-results.json");
    const mdPath = path.join(OUT_DIR, "audit-report.md");

    await fs.writeFile(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), summary, results }, null, 2));
    await fs.writeFile(mdPath, buildMarkdown(summary, results));

    console.log(`UI audit complete. Routes: ${summary.uniqueRoutes}, checks: ${summary.totalChecks}`);
    console.log(`Summary: ${JSON.stringify(summary.bySeverity)}`);
    console.log(`Report: ${mdPath}`);
    console.log(`JSON: ${jsonPath}`);
  } finally {
    await browser.close();
  }
}

await main();
