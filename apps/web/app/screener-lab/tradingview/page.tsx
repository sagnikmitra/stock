import { PageHeader } from "../../components/ui/page-header";
import { TradingViewScreenerClient } from "./tradingview-screener-client";

export const revalidate = 3600;

export default function TradingViewScreenerPage() {
  return (
    <>
      <PageHeader
        title="TradingView Screener"
        description="Build public TradingView-style screener queries with field discovery, filters, sorting, and live results."
      />
      <TradingViewScreenerClient />
    </>
  );
}
