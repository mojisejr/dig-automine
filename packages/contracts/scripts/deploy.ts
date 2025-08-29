import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting AutoMine deployment to Bitkub Testnet...");

  // Contract addresses - these need to be updated with actual testnet addresses
  const DIGDRAGON_NFT = process.env.DIGDRAGON_NFT || "0x0000000000000000000000000000000000000000";
  const HASHPOWER_STORAGE = process.env.HASHPOWER_STORAGE || "0x0000000000000000000000000000000000000000";
  const CURRENT_MINE = process.env.CURRENT_MINE || "0x0000000000000000000000000000000000000000";
  const FEE_COLLECTOR = process.env.FEE_COLLECTOR || "0x0000000000000000000000000000000000000000";

  if (DIGDRAGON_NFT === "0x0000000000000000000000000000000000000000" ||
      HASHPOWER_STORAGE === "0x0000000000000000000000000000000000000000" ||
      CURRENT_MINE === "0x0000000000000000000000000000000000000000" ||
      FEE_COLLECTOR === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Error: Please set environment variables for contract addresses");
    console.log("Required env vars: DIGDRAGON_NFT, HASHPOWER_STORAGE, CURRENT_MINE, FEE_COLLECTOR");
    process.exit(1);
  }

  console.log("📋 Using contract addresses:");
  console.log("  DigDragon NFT:", DIGDRAGON_NFT);
  console.log("  HashPower Storage:", HASHPOWER_STORAGE);
  console.log("  Current Mine:", CURRENT_MINE);
  console.log("  Fee Collector:", FEE_COLLECTOR);

  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "KUB");

  // Deploy AutoMine contract
  const AutoMine = await ethers.getContractFactory("AutoMine");
  const automine = await AutoMine.deploy(
    DIGDRAGON_NFT,
    HASHPOWER_STORAGE,
    CURRENT_MINE,
    FEE_COLLECTOR
  );

  await automine.waitForDeployment();
  const automineAddress = await automine.getAddress();

  console.log("✅ AutoMine deployed to:", automineAddress);

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const contractCode = await ethers.provider.getCode(automineAddress);
  if (contractCode === "0x") {
    console.error("❌ Deployment failed - no code at address");
    process.exit(1);
  }

  console.log("✅ Contract deployed successfully!");
  console.log("📊 Contract details:");
  console.log("  Address:", automineAddress);
  console.log("  Fee Percentage:", await automine.feePercentage(), "basis points");
  console.log("  Max Fee Percentage:", await automine.MAX_FEE_PERCENTAGE(), "basis points");

  // Save deployment info
  const deploymentInfo = {
    network: "bitkubTestnet",
    chainId: 25925,
    automine: automineAddress,
    digdragonNFT: DIGDRAGON_NFT,
    hashpowerStorage: HASHPOWER_STORAGE,
    currentMine: CURRENT_MINE,
    feeCollector: FEE_COLLECTOR,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("💾 Deployment complete!");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });