import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#080810]/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 text-white">
              <Link
                href="/"
                className="text-sm font-semibold tracking-wide text-white/80 transition-colors hover:text-white"
              >
                任务管理器
              </Link>
              <Link
                href="/"
                className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 transition-colors hover:border-blue-400/50 hover:bg-blue-500/20 hover:text-blue-200"
              >
                返回首页
              </Link>
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
