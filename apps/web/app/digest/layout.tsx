import type { ReactNode } from "react";
import { PageHeader } from "../components/ui/page-header";
import { DigestTabs } from "../components/ui/digest-tabs";

export default function DigestLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHeader
        title="Digest Archive"
        description="Pre-market, post-close, weekly, and month-end digests with transparent context trails."
      />
      <DigestTabs />
      {children}
    </>
  );
}

