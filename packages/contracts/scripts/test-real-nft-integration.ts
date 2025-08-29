import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

// Real NFT Integration Testing for Phase 1B.2
async function main() {
  console.log("🧪 Phase 1B.2: Real DigDragon NFT Integration Testing");
  console.log("====================================================");

  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);

  // Read latest deployment
  const deploymentsDir = path.join(__dirname, "../deployments");
  const deploymentFiles = fs.readdirSync(deploymentsDir)
    .filter(file => file.startsWith('real-testnet-'))
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
  
  // Get contract instances
  const automine = await ethers.getContractAt("AutoMine", latestDeployment.contracts.automine);
  const digDragonNFT = await ethers.getContractAt("IERC721", latestDeployment.contracts.digDragonNFT);
  
  // Test Results Object
  const testResults = {
    timestamp: new Date().toISOString(),
    testType: "Real NFT Integration",
    deployment: latestDeployment.contracts,
    tests: [] as any[]
  };

  console.log("🔍 Test 1: Real DigDragon NFT Contract Connection");
  try {
    const nftName = await digDragonNFT.name();
    const nftSymbol = await digDragonNFT.symbol();
    console.log(`✅ Connected to real NFT contract: ${nftName} (${nftSymbol})`);
    testResults.tests.push({
      name: "NFT Contract Connection",
      status: "PASSED",
      details: { name: nftName, symbol: nftSymbol }
    });
  } catch (error) {
    console.error("❌ NFT contract connection failed:", error);
    testResults.tests.push({
      name: "NFT Contract Connection", 
      status: "FAILED",
      error: error.message
    });
  }

  console.log("🔍 Test 2: Check Deployer NFT Balance");
  try {
    const balance = await digDragonNFT.balanceOf(deployer.address);
    console.log(`📊 Deployer owns ${balance} DigDragon NFTs`);
    
    if (balance.toString() === "0") {
      console.log("ℹ️  Note: Deployer has no NFTs. This is expected for testing account.");
      console.log("📝 To test with real NFTs:");
      console.log("   1. Transfer some DigDragon NFTs to:", deployer.address);
      console.log("   2. Re-run this test script");
    }
    
    testResults.tests.push({
      name: "NFT Balance Check",
      status: "PASSED", 
      details: { balance: balance.toString(), hasNFTs: balance > 0 }
    });
  } catch (error) {
    console.error("❌ NFT balance check failed:", error);
    testResults.tests.push({
      name: "NFT Balance Check",
      status: "FAILED", 
      error: error.message
    });
  }

  console.log("🔍 Test 3: Hash Power Storage Integration");
  try {
    const hashPowerContract = await ethers.getContractAt("IHashPowerStorage", latestDeployment.contracts.hashPowerStorage);
    
    // Test hash power for token ID 1 (should exist)
    const hashPower1 = await hashPowerContract.getHashPower(1);
    console.log(`✅ Hash power for token #1: ${hashPower1.toString()}`);
    
    // Test hash power for token ID 100
    const hashPower100 = await hashPowerContract.getHashPower(100);
    console.log(`✅ Hash power for token #100: ${hashPower100.toString()}`);
    
    testResults.tests.push({
      name: "Hash Power Storage Integration",
      status: "PASSED",
      details: {
        token1HashPower: hashPower1.toString(),
        token100HashPower: hashPower100.toString()
      }
    });
  } catch (error) {
    console.error("❌ Hash power storage test failed:", error);
    testResults.tests.push({
      name: "Hash Power Storage Integration",
      status: "FAILED",
      error: error.message
    });
  }

  console.log("🔍 Test 4: Mine Contract Integration");
  try {
    const currentMine = await ethers.getContractAt("IDigDragonMine", latestDeployment.contracts.currentMine);
    
    // Test pending reward check (should be 0 for AutoMine initially)
    const pendingReward = await currentMine.pendingReward(latestDeployment.contracts.automine);
    console.log(`✅ Pending reward for AutoMine: ${ethers.formatEther(pendingReward)} KUB`);
    
    testResults.tests.push({
      name: "Mine Contract Integration",
      status: "PASSED",
      details: { 
        pendingReward: ethers.formatEther(pendingReward),
        mineAddress: latestDeployment.contracts.currentMine
      }
    });
  } catch (error) {
    console.error("❌ Mine contract integration failed:", error);
    testResults.tests.push({
      name: "Mine Contract Integration",
      status: "FAILED",
      error: error.message
    });
  }

  console.log("🔍 Test 5: AutoMine Contract State");
  try {
    const contractStats = await automine.getContractStats();
    const feePercentage = await automine.feePercentage();
    
    console.log(`✅ AutoMine stats:`, {
      totalTokens: contractStats[0].toString(),
      activeUsers: contractStats[1].toString(),
      currentMine: contractStats[2],
      targetMine: contractStats[3],
      feePercentage: `${feePercentage.toString()} basis points`
    });
    
    testResults.tests.push({
      name: "AutoMine Contract State",
      status: "PASSED",
      details: {
        totalTokens: contractStats[0].toString(),
        activeUsers: contractStats[1].toString(),
        currentMine: contractStats[2],
        targetMine: contractStats[3],
        feePercentage: feePercentage.toString()
      }
    });
  } catch (error) {
    console.error("❌ AutoMine state check failed:", error);
    testResults.tests.push({
      name: "AutoMine Contract State",
      status: "FAILED",
      error: error.message
    });
  }

  // Save test results
  const reportsDir = path.join(__dirname, "../../../docs/reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportFile = path.join(reportsDir, `real-nft-integration-test-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(testResults, null, 2));

  // Summary
  const passedTests = testResults.tests.filter(test => test.status === "PASSED").length;
  const totalTests = testResults.tests.length;
  
  console.log("");
  console.log("📊 Test Summary:");
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`💾 Report saved to: ${reportFile}`);
  
  if (passedTests === totalTests) {
    console.log("🎉 All real NFT integration tests PASSED!");
    console.log("✅ Ready for bot-contract integration testing");
  } else {
    console.log("⚠️  Some tests failed. Review errors above.");
  }
  
  return testResults;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Real NFT integration testing failed:", error);
    process.exit(1);
  });