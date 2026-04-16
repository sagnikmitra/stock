import type { PositionSizeInput, PositionSizeResult } from "@ibo/types";

/**
 * 2% risk position sizing calculator.
 * quantity = (riskPct × portfolio) / (entry − stopLoss)
 */
export function computePositionSize(input: PositionSizeInput): PositionSizeResult {
  const { portfolioSize, entryPrice, stopLossPrice, riskPct = 2 } = input;

  const riskAmount = (riskPct / 100) * portfolioSize;
  const perShareRisk = entryPrice - stopLossPrice;

  if (perShareRisk <= 0) {
    return {
      riskAmount,
      perShareRisk: 0,
      quantity: 0,
      targetAt3R: entryPrice,
      explanation: "Invalid: stop-loss must be below entry price.",
    };
  }

  const quantity = Math.floor(riskAmount / perShareRisk);
  const targetAt3R = entryPrice + 3 * perShareRisk;

  const explanation =
    `Risk ${riskPct}% of ₹${portfolioSize.toLocaleString("en-IN")} = ₹${riskAmount.toLocaleString("en-IN")}. ` +
    `Per-share risk: ₹${perShareRisk.toFixed(2)} (entry ₹${entryPrice.toFixed(2)} − SL ₹${stopLossPrice.toFixed(2)}). ` +
    `Quantity: ${quantity} shares. ` +
    `3R target: ₹${targetAt3R.toFixed(2)}.`;

  return { riskAmount, perShareRisk, quantity, targetAt3R, explanation };
}
