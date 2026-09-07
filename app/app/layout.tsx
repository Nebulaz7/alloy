import type { Metadata } from "next";
import { Comic_Relief, Google_Sans } from "next/font/google";
import { AlloyProviders } from "@/lib/providers";
import "./globals.css";

const comicRelief = Comic_Relief({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const googleSans = Google_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alloy - Private Dividend Harvesting on Base",
  description:
    "Extract tokenized stock dividends without touching equity principal. Private payouts via Basenames and ERC-5564 stealth addresses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${comicRelief.variable} ${googleSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AlloyProviders>{children}</AlloyProviders>
      </body>
    </html>
  );
}
