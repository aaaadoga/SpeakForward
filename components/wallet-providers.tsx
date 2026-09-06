"use client";

import { useMemo, type ReactNode } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

// §技术决议 Q4: 纯客户端集成，服务端零链上参与，平台不持有任何密钥
// §2.2: 平台绝不持有、路由或托管资金
export function WalletProviders({ children }: { children: ReactNode }) {
  // §技术决议: Devnet（无真实资金）
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  // 空数组 = 仅依赖 Wallet Standard 自动检测。
  // 注册旧版 PhantomWalletAdapter 会与标准检测产生重复/冲突条目，导致点击连接静默失败。
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
