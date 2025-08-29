import { http, createConfig } from "wagmi";
import { bitkubTestnet } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

// WalletConnect project ID (you should replace this with your actual project ID)
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";

export const config = createConfig({
  chains: [bitkubTestnet],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId,
      metadata: {
        name: "AutoMine Platform",
        description: "Automated NFT Mining Platform on Bitkub Chain",
        url: "https://automine.app",
        icons: ["https://automine.app/icon.png"],
      },
    }),
  ],
  transports: {
    [bitkubTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL_TESTNET || "https://rpc-testnet.bitkubchain.io"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
