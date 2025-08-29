import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Deploying mock contracts for testing...");

  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "KUB");

  // Deploy MockERC721 (DigDragon NFT mock)
  console.log("📝 Deploying MockERC721...");
  const MockERC721 = await ethers.getContractFactory("MockERC721");
  const mockNFT = await MockERC721.deploy("DigDragon NFT", "DDNFT");
  await mockNFT.waitForDeployment();
  const nftAddress = await mockNFT.getAddress();
  console.log("✅ MockERC721 deployed to:", nftAddress);

  // Deploy MockHashPowerStorage
  console.log("📝 Deploying MockHashPowerStorage...");
  const MockHashPowerStorage = await ethers.getContractFactory("MockHashPowerStorage");
  const mockHashStorage = await MockHashPowerStorage.deploy();
  await mockHashStorage.waitForDeployment();
  const hashStorageAddress = await mockHashStorage.getAddress();
  console.log("✅ MockHashPowerStorage deployed to:", hashStorageAddress);

  // Deploy MockDigDragonMine (Old Mine)
  console.log("📝 Deploying MockDigDragonMine (Old Mine)...");
  const MockDigDragonMine = await ethers.getContractFactory("MockDigDragonMine");
  const oldMine = await MockDigDragonMine.deploy("Old Mine", true); // isActive = true
  await oldMine.waitForDeployment();
  const oldMineAddress = await oldMine.getAddress();
  console.log("✅ Old Mine deployed to:", oldMineAddress);

  // Deploy MockDigDragonMine (New Mine)
  console.log("📝 Deploying MockDigDragonMine (New Mine)...");
  const newMine = await MockDigDragonMine.deploy("New Mine", false); // isActive = false initially
  await newMine.waitForDeployment();
  const newMineAddress = await newMine.getAddress();
  console.log("✅ New Mine deployed to:", newMineAddress);

  // Setup some test data
  console.log("🔧 Setting up test data...");
  
  // Mint some test NFTs to deployer
  for (let i = 1; i <= 10; i++) {
    await mockNFT.mint(deployer.address, i);
  }
  console.log("🎯 Minted 10 test NFTs to deployer");

  // Set hash powers for test NFTs
  for (let i = 1; i <= 10; i++) {
    const hashPower = Math.floor(Math.random() * 1000) + 100; // Random hash power 100-1100
    await mockHashStorage.setHashPower(i, hashPower);
  }
  console.log("⚡ Set random hash powers for test NFTs");

  const deploymentInfo = {
    network: "bitkubTestnet",
    chainId: 25925,
    contracts: {
      mockNFT: nftAddress,
      mockHashStorage: hashStorageAddress,
      oldMine: oldMineAddress,
      newMine: newMineAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    testNFTs: "1-10",
    notes: "Old mine is active, new mine is inactive. Use these for testing mine switching."
  };

  console.log("💾 Mock contracts deployment complete!");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Mock deployment failed:", error);
    process.exit(1);
  });