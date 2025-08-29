import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting complete testnet deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "KUB");

  if (parseFloat(ethers.formatEther(await ethers.provider.getBalance(deployer.address))) < 0.1) {
    console.error("❌ Insufficient balance for deployment. Need at least 0.1 KUB");
    process.exit(1);
  }

  console.log("🧪 Step 1: Deploying mock contracts...");

  // Deploy MockERC721 (DigDragon NFT mock)
  const MockERC721 = await ethers.getContractFactory("MockERC721");
  const mockNFT = await MockERC721.deploy("DigDragon NFT", "DDNFT");
  await mockNFT.waitForDeployment();
  const nftAddress = await mockNFT.getAddress();
  console.log("✅ MockERC721 deployed to:", nftAddress);

  // Deploy MockHashPowerStorage
  const MockHashPowerStorage = await ethers.getContractFactory("MockHashPowerStorage");
  const mockHashStorage = await MockHashPowerStorage.deploy();
  await mockHashStorage.waitForDeployment();
  const hashStorageAddress = await mockHashStorage.getAddress();
  console.log("✅ MockHashPowerStorage deployed to:", hashStorageAddress);

  // Deploy MockDigDragonMine (Old Mine - Active)
  const MockDigDragonMine = await ethers.getContractFactory("MockDigDragonMine");
  const oldMine = await MockDigDragonMine.deploy("Old Mine", true);
  await oldMine.waitForDeployment();
  const oldMineAddress = await oldMine.getAddress();
  console.log("✅ Old Mine deployed to:", oldMineAddress);

  // Deploy MockDigDragonMine (New Mine - Inactive)
  const newMine = await MockDigDragonMine.deploy("New Mine", false);
  await newMine.waitForDeployment();
  const newMineAddress = await newMine.getAddress();
  console.log("✅ New Mine deployed to:", newMineAddress);

  console.log("🏗️  Step 2: Deploying AutoMine contract...");

  // Deploy AutoMine contract using mock addresses
  const AutoMine = await ethers.getContractFactory("AutoMine");
  const automine = await AutoMine.deploy(
    nftAddress,           // digDragonContract
    hashStorageAddress,   // hashPowerStorage
    oldMineAddress,       // currentMine (old mine)
    deployer.address      // feeCollector
  );

  await automine.waitForDeployment();
  const automineAddress = await automine.getAddress();
  console.log("✅ AutoMine deployed to:", automineAddress);

  console.log("🔧 Step 3: Setting up test data...");

  // Mint test NFTs to deployer
  console.log("  Minting 10 test NFTs...");
  for (let i = 1; i <= 10; i++) {
    await mockNFT.mint(deployer.address, i);
  }
  console.log("  ✅ Minted NFTs 1-10 to deployer");

  // Set random hash powers for test NFTs
  console.log("  Setting hash powers...");
  for (let i = 1; i <= 10; i++) {
    const hashPower = Math.floor(Math.random() * 1000) + 100; // 100-1100
    await mockHashStorage.setHashPower(i, hashPower);
  }
  console.log("  ✅ Set random hash powers for test NFTs");

  // Set some reward amount for testing
  await oldMine.setReward(ethers.parseEther("10")); // 10 KUB reward
  await newMine.setReward(ethers.parseEther("15")); // 15 KUB reward
  console.log("  ✅ Set reward amounts for testing");

  // Grant BOT_ROLE to deployer for testing
  const BOT_ROLE = await automine.BOT_ROLE();
  await automine.grantRole(BOT_ROLE, deployer.address);
  console.log("  ✅ Granted BOT_ROLE to deployer for testing");

  const deploymentInfo = {
    network: "bitkubTestnet",
    chainId: 25925,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      automine: automineAddress,
      mockNFT: nftAddress,
      mockHashStorage: hashStorageAddress,
      oldMine: oldMineAddress,
      newMine: newMineAddress
    },
    testData: {
      nftRange: "1-10",
      oldMineReward: "10 KUB",
      newMineReward: "15 KUB",
      botRole: deployer.address
    },
    configuration: {
      feePercentage: "5% (500 basis points)",
      maxFeePercentage: "20% (2000 basis points)",
      feeCollector: deployer.address
    }
  };

  // Save deployment info to file
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentDir, `testnet-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("✅ Deployment complete!");
  console.log("📊 Summary:");
  console.log("  AutoMine:", automineAddress);
  console.log("  Mock NFT:", nftAddress);
  console.log("  Hash Storage:", hashStorageAddress);
  console.log("  Old Mine:", oldMineAddress, "(Active)");
  console.log("  New Mine:", newMineAddress, "(Inactive)");
  console.log("💾 Deployment info saved to:", deploymentFile);

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });