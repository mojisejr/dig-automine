#!/usr/bin/env npx ts-node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { ethers } from 'ethers';

// Phase 1B.2 Real Testnet Setup Script
console.log("🚀 AutoMine Phase 1B.2: Real Testnet Setup");
console.log("=========================================");

// Check if private key is provided
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("❌ Missing private key argument");
  console.log("");
  console.log("Usage:");
  console.log("  npm run setup:phase1b2 YOUR_TESTNET_PRIVATE_KEY");
  console.log("");
  console.log("Prerequisites:");
  console.log("1. Testnet wallet with KUB tokens (>0.5 KUB recommended)");
  console.log("2. Private key for testnet wallet (NOT mainnet!)");
  console.log("");
  console.log("Security Notes:");
  console.log("- Only use testnet private keys");
  console.log("- Never commit private keys to git");
  console.log("- This will create .env files that are git-ignored");
  process.exit(1);
}

const privateKey = args[0];
if (!privateKey.match(/^[a-fA-F0-9]{64}$/)) {
  console.error("❌ Invalid private key format. Should be 64 hex characters without 0x prefix");
  process.exit(1);
}

console.log("🔧 Step 1: Setting up contract environment...");

// Update contracts .env file
const contractsEnvPath = path.join(__dirname, "../packages/contracts/.env");
let contractsEnv = fs.readFileSync(contractsEnvPath, 'utf8');
contractsEnv = contractsEnv.replace('PRIVATE_KEY=', `PRIVATE_KEY=${privateKey}`);
contractsEnv = contractsEnv.replace('FEE_COLLECTOR=', `FEE_COLLECTOR=${getAddressFromPrivateKey(privateKey)}`);
fs.writeFileSync(contractsEnvPath, contractsEnv);
console.log("✅ Contracts .env configured");

console.log("🏗️  Step 2: Deploying AutoMine to real testnet...");

try {
  execSync('cd packages/contracts && npx hardhat run scripts/deploy-real-testnet.ts --network bitkubTestnet', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
} catch (error) {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
}

console.log("🔍 Step 3: Reading deployment info and configuring bot...");

// Read the latest deployment to get AutoMine address
const deploymentsDir = path.join(__dirname, "../packages/contracts/deployments");
const deploymentFiles = fs.readdirSync(deploymentsDir)
  .filter(file => file.startsWith('real-testnet-'))
  .sort()
  .reverse();
  
const latestDeploymentPath = path.join(deploymentsDir, deploymentFiles[0]);
const deploymentInfo = JSON.parse(fs.readFileSync(latestDeploymentPath, 'utf8'));

// Update bot .env file with deployment info
const botEnvPath = path.join(__dirname, "../packages/bot/.env.testnet");
let botEnv = fs.readFileSync(botEnvPath, 'utf8');
botEnv = botEnv.replace('BOT_PRIVATE_KEY=', `BOT_PRIVATE_KEY=${privateKey}`);
botEnv = botEnv.replace('AUTOMINE_CONTRACT_ADDRESS=', `AUTOMINE_CONTRACT_ADDRESS=${deploymentInfo.contracts.automine}`);
fs.writeFileSync(botEnvPath, botEnv);

// Copy to main bot .env
fs.copyFileSync(botEnvPath, path.join(__dirname, "../packages/bot/.env"));
console.log("✅ Bot environment configured");

console.log("🧪 Step 4: Running validation tests...");

try {
  execSync('cd packages/contracts && npx hardhat run scripts/validate-real-testnet.ts --network bitkubTestnet', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
} catch (error) {
  console.error("❌ Validation failed:", error);
  process.exit(1);
}

console.log("✅ Phase 1B.2 Setup Complete!");
console.log("");
console.log("🤖 Next Steps:");
console.log("1. Start the bot for real testnet testing:");
console.log("   cd packages/bot && npm run dev");
console.log("");
console.log("2. Monitor operations:");
console.log("   - Logs: docs/logs/");
console.log("   - Dashboard: docs/dashboard/current-status.json");
console.log("   - Reports: docs/reports/");
console.log("");
console.log("3. Run 24-hour testing:");
console.log("   npm run test:24hour");

// Helper function to derive address from private key
function getAddressFromPrivateKey(privateKey: string): string {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}