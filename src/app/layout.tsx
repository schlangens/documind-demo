import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DocuMind — Document AI you can trust",
  description: "Upload documents, get structured answers with citations, confidence scores, and human review.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="bg-amber-100 text-amber-900 text-center text-[12px] leading-tight py-1.5 px-3 border-b border-amber-200">
          <strong>Demo</strong> — sample data, mock AI mode. Every answer is grounded in a cited source. Production uses Supabase (pgvector) + OpenAI with per-user row-level security.
        </div>
        <StoreProvider>
          <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4 sm:gap-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-sm">◆</span>
                DocuMind
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                <Link href="/" className="px-3 py-1.5 rounded-lg hover:bg-slate-100">Library</Link>
                <Link href="/review" className="px-3 py-1.5 rounded-lg hover:bg-slate-100">Review&nbsp;queue</Link>
                <Link href="/search" className="px-3 py-1.5 rounded-lg hover:bg-slate-100">Search&nbsp;&amp;&nbsp;export</Link>
              </nav>
              <span className="ml-auto hidden sm:block text-xs text-slate-400">RLS: <span className="text-emerald-600 font-medium">you see only your docs</span></span>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
