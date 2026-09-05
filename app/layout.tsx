import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { WalletProviders } from "@/components/wallet-providers";
import { SiteHeader } from "@/components/site-header";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

// §1 core mission: fair-speech infrastructure — young leaders turn words into action, funded by trust
export const metadata: Metadata = {
  title: "SpeakForward — Turn words into action, funded by trust",
  description:
    "Young leaders whose health conditions prevent them from speaking share their vision through AI-generated voices, backed by transparent, non-custodial support on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col flex-1 bg-background text-foreground">
        <WalletProviders>
          {/* §2.3: site-wide identity disclaimer, always visible */}
          <DisclaimerBanner />
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <footer className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
            <p>
              Powered by ElevenLabs · Solana Devnet · This platform never
              custodies funds (§2.2)
            </p>
            <p className="mt-1">
              <a href="/ethics" className="underline">Our trust design</a>
            </p>
          </footer>
          <Toaster />
        </WalletProviders>
      </body>
    </html>
  );
}
