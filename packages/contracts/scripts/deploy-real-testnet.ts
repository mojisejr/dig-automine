import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

// Real DigDragon Contract Addresses on BitkubChain Testnet
// Based on digdragon.txt documentation
const REAL_CONTRACTS = {
  // DigDragon NFT Contract (from NFT/abi.ts)
  digDragonNFT: "0x7C80f994C724b0C8F834F4303C4f142004798219",
  
  // Hash Power Storage Contract (from HashStorage export)
  hashPowerStorage: "0xF310aeF56A5ab07DE8B4F6BeFcC0E09036cb76E5",
  
  // Current Active Mine (from Mine/abi.ts - Mine 1)
  currentMine: "0x41d45dF6FBEEC5DC70D53Fbbe92F3ccBA9C45250",
  
  // Target Mine (from Mine/abi2.ts - Mine 4 for switching tests)
  targetMine: "0x245E1B0207D9A2eb323766722a38FbDD129fF772"
};

async function main() {
  console.log("🚀 Starting REAL testnet deployment for Phase 1B.2...");
  console.log("📋 Using REAL DigDragon contract addresses from BitkubChain testnet");

  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "KUB");

  if (parseFloat(ethers.formatEther(balance)) < 0.5) {
    console.error("❌ Insufficient balance for deployment. Need at least 0.5 KUB for real testnet");
    process.exit(1);
  }

  console.log("🔍 Verifying real contract addresses...");
  
  // Verify contracts exist on testnet
  const provider = ethers.provider;
  for (const [name, address] of Object.entries(REAL_CONTRACTS)) {
    const code = await provider.getCode(address);
    if (code === "0x") {
      console.error(`❌ Contract ${name} not found at address ${address}`);
      process.exit(1);
    } else {
      console.log(`✅ Verified ${name}: ${address}`);
    }
  }

  console.log("🏗️  Deploying AutoMine contract with REAL contract addresses...");

  const AutoMine = await ethers.getContractFactory("AutoMine");
  const automine = await AutoMine.deploy(
    REAL_CONTRACTS.digDragonNFT,      // Real DigDragon NFT contract
    REAL_CONTRACTS.hashPowerStorage,   // Real Hash Power Storage contract
    REAL_CONTRACTS.currentMine,        // Real current mine contract
    deployer.address                   // Fee collector (deployer for testing)
  );

  await automine.waitForDeployment();
  const automineAddress = await automine.getAddress();
  console.log("✅ AutoMine deployed to:", automineAddress);

  console.log("🔧 Setting up bot permissions...");

  // Grant BOT_ROLE to deployer for testing
  const BOT_ROLE = await automine.BOT_ROLE();
  await automine.grantRole(BOT_ROLE, deployer.address);
  console.log("✅ Granted BOT_ROLE to deployer for testing");

  // Set target mine for switching tests
  await automine.setMine(REAL_CONTRACTS.currentMine, REAL_CONTRACTS.targetMine);
  console.log("✅ Configured mine addresses for switching");

  const deploymentInfo = {
    network: "bitkubTestnet",
    chainId: 25925,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    deploymentType: "REAL_TESTNET_PHASE_1B2",
    contracts: {
      automine: automineAddress,
      digDragonNFT: REAL_CONTRACTS.digDragonNFT,
      hashPowerStorage: REAL_CONTRACTS.hashPowerStorage,
      currentMine: REAL_CONTRACTS.currentMine,
      targetMine: REAL_CONTRACTS.targetMine
    },
    configuration: {
      feePercentage: "5% (500 basis points)",
      maxFeePercentage: "20% (2000 basis points)", 
      feeCollector: deployer.address,
      botRole: deployer.address
    },
    phase: "1B.2",
    description: "Real testnet deployment for bot-contract integration validation"
  };

  // Save deployment info
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentDir, `real-testnet-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Update bot configuration
  const botConfigFile = path.join(__dirname, "../../bot/.env.testnet");
  const botConfig = `# Phase 1B.2 Real Testnet Configuration - Generated ${new Date().toISOString()}
NETWORK=bitkubTestnet
RPC_URL=https://rpc-testnet.bitkubchain.io
CHAIN_ID=25925
PRIVATE_KEY=${process.env.PRIVATE_KEY}

# Real Contract Addresses
AUTOMINE_CONTRACT=${automineAddress}
DIGDRAGON_NFT_CONTRACT=${REAL_CONTRACTS.digDragonNFT}
HASH_POWER_STORAGE_CONTRACT=${REAL_CONTRACTS.hashPowerStorage}
CURRENT_MINE_CONTRACT=${REAL_CONTRACTS.currentMine}
TARGET_MINE_CONTRACT=${REAL_CONTRACTS.targetMine}

# Bot Configuration
MONITORING_INTERVAL=30000
LOG_LEVEL=info
DASHBOARD_UPDATE_INTERVAL=60000
`;

  fs.writeFileSync(botConfigFile, botConfig);

  console.log("✅ Phase 1B.2 Real Testnet Deployment Complete!");
  console.log("📊 Summary:");
  console.log("  AutoMine:", automineAddress);
  console.log("  DigDragon NFT:", REAL_CONTRACTS.digDragonNFT);
  console.log("  Hash Power Storage:", REAL_CONTRACTS.hashPowerStorage);
  console.log("  Current Mine:", REAL_CONTRACTS.currentMine);
  console.log("  Target Mine:", REAL_CONTRACTS.targetMine);
  console.log("💾 Deployment info saved to:", deploymentFile);
  console.log("🤖 Bot config saved to:", botConfigFile);
  console.log("");
  console.log("🔥 Next Steps:");
  console.log("1. cd ../bot && cp .env.testnet .env");
  console.log("2. npm run dev:testnet");
  console.log("3. Monitor real testnet operations");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Real testnet deployment failed:", error);
    process.exit(1);
  });