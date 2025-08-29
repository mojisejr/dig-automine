import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    bitkubChain: {
      url: "https://rpc.bitkubchain.io",
      chainId: 96,
      accounts: [],
    },
    bitkubTestnet: {
      url: "https://rpc-testnet.bitkubchain.io",
      chainId: 25925,
      accounts: [],
    },
  },
};

export default config;
