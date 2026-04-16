import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/digest", "/strategies", "/screener-lab", "/tools/position-size"];

test.describe("spec-critical route smoke", () => {
  for (const route of ROUTES) {
    test(`loads ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("footer").getByText(/educational analysis software/i)).toBeVisible();
    });
  }
});
