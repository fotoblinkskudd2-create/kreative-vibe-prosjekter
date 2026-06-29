import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenClaw AgentOps",
  description: "Black box recorder for AI agent runs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            OpenClaw <span className="text-slate-400">AgentOps</span>
          </Link>
          <nav className="flex gap-4 text-sm text-slate-300">
            <Link href="/" className="hover:text-white">
              Dashboard
            </Link>
            <Link href="/report" className="hover:text-white">
              Weekly Report
            </Link>
          </nav>
        </header>
        <main className="px-6 py-8 max-w-6xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
