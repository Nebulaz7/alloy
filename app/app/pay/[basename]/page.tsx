import { Metadata } from "next";
import { PublicPayView } from "@/components/payment/PublicPayView";
import { formatBasename } from "@/lib/crypto/namehash";

interface PageProps {
  params: Promise<{ basename: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { basename } = await params;
  const decoded = decodeURIComponent(basename);
  const formatted = formatBasename(decoded);

  return {
    title: `Pay ${formatted} Privately | Alloy`,
    description: `Send private dividends, tips, or stablecoins directly to ${formatted} on Base using ERC-5564 stealth addresses.`,
  };
}

export default async function PayBasenamePage({ params }: PageProps) {
  const { basename } = await params;
  const decoded = decodeURIComponent(basename);

  return <PublicPayView initialBasename={decoded} />;
}
