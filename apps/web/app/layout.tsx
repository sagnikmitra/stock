import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/nav/sidebar";

export const metadata: Metadata = {
  title: "Investment Bible OS",
  description: "Personal market digest, screener engine & strategy intelligence for Indian equity markets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-surface-muted p-4 sm:p-6 lg:p-8">
          {children}
          <footer className="mt-8 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
            Investment Bible OS is educational analysis software. It does not provide guaranteed returns or
            personalized investment advice. Final decisions remain with the user.
          </footer>
        </main>
      </body>
    </html>
  );
}
