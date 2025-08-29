import { ethers } from "hardhat";

// Script to validate real testnet deployment and test bot integration
async function main() {
  console.log("🧪 Phase 1B.2: Real Testnet Validation Starting...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);
  
  // Read latest deployment info
  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, "../deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    console.error("❌ No deployment directory found. Run deploy-real-testnet.ts first");
    process.exit(1);
  }
  
  const deploymentFiles = fs.readdirSync(deploymentsDir)
    .filter((file: string) => file.startsWith('real-testnet-'))
    .sort()
    .reverse();
    
  if (deploymentFiles.length === 0) {
    console.error("❌ No real testnet deployment found. Run deploy-real-testnet.ts first");
    process.exit(1);
  }
  
  const latestDeployment = JSON.parse(
    fs.readFileSync(path.join(deploymentsDir, deploymentFiles[0]), 'utf8')
  );
  
  console.log("📋 Using deployment:", deploymentFiles[0]);
  console.log("🏗️  AutoMine Contract:", latestDeployment.contracts.automine);
  
  // Get contract instance
  const AutoMine = await ethers.getContractFactory("AutoMine");
  const automine = AutoMine.attach(latestDeployment.contracts.automine);
  
  console.log("🔍 Step 1: Validating contract deployment...");
  
  // Test contract functions
  try {
    const contractStats = await automine.getContractStats();
    console.log("✅ Contract stats:", {
      totalTokens: contractStats[0].toString(),
      activeUsers: contractStats[1].toString(),
      currentMine: contractStats[2],
      targetMine: contractStats[3]
    });
    
    const feePercentage = await automine.feePercentage();
    console.log("✅ Fee percentage:", feePercentage.toString(), "basis points");
    
  } catch (error) {
    console.error("❌ Contract validation failed:", error);
    process.exit(1);
  }
  
  console.log("🔍 Step 2: Testing real contract interactions...");
  
  try {
    // Test if we can read from real DigDragon contracts
    const digDragonNFT = await ethers.getContractAt("IERC721", latestDeployment.contracts.digDragonNFT);
    const nftName = await digDragonNFT.name();
    console.log("✅ Real DigDragon NFT contract connected:", nftName);
    
    // Test balance check
    const balance = await digDragonNFT.balanceOf(deployer.address);
    console.log("✅ NFT balance for deployer:", balance.toString());
    
  } catch (error) {
    console.error("❌ Real contract interaction failed:", error);
    console.log("ℹ️  This might be expected if deployer doesn't own DigDragon NFTs");
  }
  
  console.log("🔍 Step 3: Testing mine contract interactions...");
  
  try {
    const currentMine = await ethers.getContractAt("IDigDragonMine", latestDeployment.contracts.currentMine);
    
    // Test if we can read pending rewards (should be 0 for new deployment)
    const pendingReward = await currentMine.pendingReward(latestDeployment.contracts.automine);
    console.log("✅ Pending reward for AutoMine contract:", ethers.formatEther(pendingReward), "KUB");
    
  } catch (error) {
    console.error("❌ Mine contract interaction failed:", error);
    console.log("ℹ️  This might indicate interface mismatch with real contracts");
  }
  
  console.log("✅ Real testnet validation complete!");
  console.log("");
  console.log("🤖 Next Steps - Bot Testing:");
  console.log("1. cd ../bot");
  console.log("2. cp .env.testnet .env");
  console.log("3. npm run dev");
  console.log("");
  console.log("📊 Monitor bot operations in real-time:");
  console.log("- Bot logs: docs/logs/");
  console.log("- Dashboard: docs/dashboard/current-status.json");
  console.log("- Reports: docs/reports/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  });