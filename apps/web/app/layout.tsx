import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./components/nav/sidebar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Investment Bible OS",
  description: "Personal market digest, screener engine & strategy intelligence for Indian equity markets",
};

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-host-grotesk",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${hostGrotesk.variable}`}>
        <Providers>
          <div style={{ display: "flex", minHeight: "100vh", background: "#F4F7FB" }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <div style={{ margin: "0 auto", maxWidth: 1440 }}>
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
