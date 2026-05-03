import type { Metadata } from "next";
import sampleBuyingGuide from "@/data/sampleBuyingGuide.json";
import type { BuyingGuide as BuyingGuideType } from "@/types/buying-guide";
import { BuyingGuide, type BuyingGuideTab } from "./BuyingGuide";

export const metadata: Metadata = {
  title: "Weekly Buying Guide | Investment Bible OS",
  description: "Weekly swing trading research cockpit, buying zones, stops, targets, and position sizing.",
};

interface Props {
  searchParams: Promise<{ symbol?: string; tab?: string }>;
}

const VALID_TABS: BuyingGuideTab[] = ["best", "watchlist", "defensive", "conditional", "avoid", "execution", "calculator"];

export default async function BuyingGuidePage({ searchParams }: Props) {
  const params = await searchParams;
  const tab = VALID_TABS.includes(params.tab as BuyingGuideTab) ? (params.tab as BuyingGuideTab) : undefined;

  return (
    <BuyingGuide
      guide={sampleBuyingGuide as unknown as BuyingGuideType}
      initialSymbol={params.symbol?.toUpperCase()}
      initialTab={tab}
    />
  );
}
