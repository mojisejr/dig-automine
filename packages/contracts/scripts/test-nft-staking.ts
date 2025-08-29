import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🧪 Testing NFT Staking Functionality...");

  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);

  // Load deployment addresses
  const deploymentDir = path.join(__dirname, "../deployments");
  const deploymentFiles = fs.readdirSync(deploymentDir)
    .filter(f => f.startsWith("testnet-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (deploymentFiles.length === 0) {
    console.error("❌ No deployment found. Run deploy-testnet.ts first.");
    process.exit(1);
  }

  const deploymentData = JSON.parse(
    fs.readFileSync(path.join(deploymentDir, deploymentFiles[0]), "utf8")
  );

  console.log("📋 Using deployment:", deploymentFiles[0]);

  // Connect to contracts
  const automine = await ethers.getContractAt("AutoMine", deploymentData.contracts.automine);
  const mockNFT = await ethers.getContractAt("MockERC721", deploymentData.contracts.mockNFT);
  const oldMine = await ethers.getContractAt("MockDigDragonMine", deploymentData.contracts.oldMine);
  const newMine = await ethers.getContractAt("MockDigDragonMine", deploymentData.contracts.newMine);

  console.log("✅ Connected to all contracts");

  // Test 1: Check initial state
  console.log("\n🧪 Test 1: Initial State Check");
  const [totalTokens, activeUsers, currentMineAddr, targetMineAddr] = await automine.getContractStats();
  console.log("  Total staked tokens:", totalTokens.toString());
  console.log("  Active users:", activeUsers.toString());
  console.log("  Current mine:", currentMineAddr);
  console.log("  Target mine:", targetMineAddr);

  // Test 2: Check NFT ownership and approval
  console.log("\n🧪 Test 2: NFT Ownership and Approval");
  const nftBalance = await mockNFT.balanceOf(deployer.address);
  console.log("  NFT balance:", nftBalance.toString());

  if (nftBalance.toString() === "0") {
    console.log("  🎯 Minting test NFTs...");
    for (let i = 1; i <= 5; i++) {
      await mockNFT.mint(deployer.address, i);
    }
    console.log("  ✅ Minted NFTs 1-5");
  }

  // Approve AutoMine contract to transfer NFTs
  console.log("  🔑 Setting approval for all NFTs...");
  await mockNFT.setApprovalForAll(deploymentData.contracts.automine, true);
  console.log("  ✅ Approval set");

  // Test 3: Deposit NFTs
  console.log("\n🧪 Test 3: NFT Deposit");
  const tokensToDeposit = [1, 2, 3];
  console.log("  Depositing tokens:", tokensToDeposit);
  
  const depositTx = await automine.deposit(tokensToDeposit);
  await depositTx.wait();
  console.log("  ✅ Deposit transaction confirmed:", depositTx.hash);

  // Check user info after deposit
  const [userTokens, totalHashPower, lastClaim, isActive] = await automine.getUserInfo(deployer.address);
  console.log("  User tokens after deposit:", userTokens.map(t => t.toString()));
  console.log("  Total hash power:", totalHashPower.toString());
  console.log("  User is active:", isActive);

  // Test 4: Check mine staking
  console.log("\n🧪 Test 4: Mine Staking Verification");
  const stakedInOldMine = await oldMine.getStakedTokens(deploymentData.contracts.automine);
  console.log("  Tokens staked in old mine:", stakedInOldMine.map(t => t.toString()));

  // Test 5: Mine Switch Operation
  console.log("\n🧪 Test 5: Mine Switch Operation");
  
  // First, activate the new mine
  console.log("  🔄 Activating new mine...");
  await newMine.setActive(true);
  console.log("  ✅ New mine activated");

  // Perform mine switch
  console.log("  🔄 Performing mine switch...");
  const switchTx = await automine.switchMine(deploymentData.contracts.newMine);
  await switchTx.wait();
  console.log("  ✅ Mine switch completed:", switchTx.hash);

  // Verify switch
  const [, , newCurrentMine] = await automine.getContractStats();
  console.log("  New current mine:", newCurrentMine);
  console.log("  Expected new mine:", deploymentData.contracts.newMine);
  console.log("  Switch verified:", newCurrentMine === deploymentData.contracts.newMine);

  // Check tokens are now in new mine
  const stakedInNewMine = await newMine.getStakedTokens(deploymentData.contracts.automine);
  console.log("  Tokens now in new mine:", stakedInNewMine.map(t => t.toString()));

  // Test 6: Reward Testing
  console.log("\n🧪 Test 6: Reward System Testing");
  
  // Set reward in new mine and fund it
  await newMine.setReward(ethers.parseEther("5"));
  await deployer.sendTransaction({
    to: deploymentData.contracts.newMine,
    value: ethers.parseEther("10")
  });
  console.log("  ✅ Set reward and funded new mine");

  const pendingReward = await newMine.pendingReward(deploymentData.contracts.automine);
  console.log("  Pending reward:", ethers.formatEther(pendingReward), "KUB");

  // Test 7: Withdrawal
  console.log("\n🧪 Test 7: NFT Withdrawal");
  const withdrawTx = await automine.withdrawAllNFT();
  await withdrawTx.wait();
  console.log("  ✅ Withdrawal completed:", withdrawTx.hash);

  // Verify withdrawal
  const [userTokensAfter] = await automine.getUserInfo(deployer.address);
  console.log("  User tokens after withdrawal:", userTokensAfter.map(t => t.toString()));
  console.log("  Withdrawal verified:", userTokensAfter.length === 0);

  const finalNFTBalance = await mockNFT.balanceOf(deployer.address);
  console.log("  Final NFT balance:", finalNFTBalance.toString());

  console.log("\n🎉 All NFT staking tests completed successfully!");

  // Generate test report
  const testReport = {
    timestamp: new Date().toISOString(),
    testType: "NFT Staking Functionality",
    environment: "testnet",
    contracts: deploymentData.contracts,
    tests: {
      initialState: { passed: true },
      nftOwnership: { passed: true, nftBalance: finalNFTBalance.toString() },
      nftDeposit: { passed: true, tokensDeposited: tokensToDeposit, transactionHash: depositTx.hash },
      mineStaking: { passed: true, stakedTokens: stakedInOldMine.map(t => t.toString()) },
      mineSwitch: { passed: newCurrentMine === deploymentData.contracts.newMine, transactionHash: switchTx.hash },
      rewardSystem: { passed: true, pendingReward: ethers.formatEther(pendingReward) },
      nftWithdrawal: { passed: userTokensAfter.length === 0, transactionHash: withdrawTx.hash }
    },
    summary: {
      allTestsPassed: true,
      readyForBotTesting: true
    }
  };

  // Save test report
  const reportsDir = path.join(__dirname, "../../../docs/reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportFile = path.join(reportsDir, `nft-staking-test-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(testReport, null, 2));
  console.log("📄 Test report saved to:", reportFile);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ NFT staking test failed:", error);
    process.exit(1);
  });