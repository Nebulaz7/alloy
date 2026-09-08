import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PublicPayView } from "@/components/payment/PublicPayView";
import { formatBasename } from "@/lib/crypto/namehash";

interface PageProps {
  params: Promise<{ basename: string }>;
}

const RESERVED_ROUTES = new Set([
  "dashboard",
  "harvest",
  "activities",
  "simulator",
  "settings",
  "login",
  "onboarding",
  "pay",
  "api",
  "favicon.ico",
  "brand-logos",
  "icons",
  "manifest.json",
]);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { basename } = await params;
  const decoded = decodeURIComponent(basename);

  if (RESERVED_ROUTES.has(decoded.toLowerCase())) {
    return {};
  }

  const formatted = formatBasename(decoded);

  return {
    title: `Pay ${formatted} Privately | Alloy`,
    description: `Send private dividends, tips, or stablecoins directly to ${formatted} on Base using ERC-5564 stealth addresses.`,
  };
}

export default async function TopLevelBasenamePage({ params }: PageProps) {
  const { basename } = await params;
  const decoded = decodeURIComponent(basename);

  // If visiting a reserved path, let Next.js handle or trigger notFound
  if (RESERVED_ROUTES.has(decoded.toLowerCase())) {
    notFound();
  }

  return <PublicPayView initialBasename={decoded} />;
}
