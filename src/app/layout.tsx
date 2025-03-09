import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "今天看啥 - 豆瓣电影随机推荐",
  description: "从你的豆瓣想看列表中随机推荐一部电影，帮你解决选择困难症",
  keywords: "豆瓣,电影,随机,推荐,选片,想看",
  authors: [{ name: "豆瓣随机电影推荐" }],
  openGraph: {
    title: "今天看啥 - 豆瓣电影随机推荐",
    description: "从你的豆瓣想看列表中随机推荐一部电影，帮你解决选择困难症",
    type: "website",
    locale: "zh_CN",
    siteName: "今天看啥"
  },
  twitter: {
    card: "summary",
    title: "今天看啥 - 豆瓣电影随机推荐",
    description: "从你的豆瓣想看列表中随机推荐一部电影，帮你解决选择困难症"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
