import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://olderthandirt.vercel.app';

export const metadata: Metadata = {
  title: 'OlderThanDirt — Timeline Ordering Game',
  description: 'Sort 5 historical events into chronological order. Food, Inventions, Pop Culture — how well do you know what came first?',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'OlderThanDirt',
    description: 'How well do you know what came first? Sort events into chronological order.',
    url: SITE_URL,
    siteName: 'OlderThanDirt',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OlderThanDirt',
    description: 'How well do you know what came first? Sort events into chronological order.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
