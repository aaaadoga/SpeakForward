import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { WalletProviders } from "@/components/wallet-providers";
import { SiteHeader } from "@/components/site-header";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

// §1 核心使命: 表达权公平基础设施 —— 青年领袖以言促行，信任铸就支持
export const metadata: Metadata = {
  title: "SpeakForward — 青年领袖以言促行",
  description:
    "让因健康状况限制而无法自然发声的青年领袖通过AI生成语音分享愿景，获得透明、无平台托管的 Solana 链上支持。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col flex-1 bg-background text-foreground">
        <WalletProviders>
          {/* §2.3: 全站常驻身份免责声明 */}
          <DisclaimerBanner />
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <footer className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
            <p>
              Powered by ElevenLabs · Solana Devnet · 平台不托管任何资金（§2.2）
            </p>
            <p className="mt-1">
              <a href="/ethics" className="underline">伦理设计说明</a>
            </p>
          </footer>
          <Toaster />
        </WalletProviders>
      </body>
    </html>
  );
}
