import fs from "fs";
import path from "path";

async function main() {
  console.log("🔧 Updating bot configuration with deployed contract addresses...");

  // Find the latest deployment file
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    console.error("❌ No deployments directory found. Run deploy-testnet.ts first.");
    process.exit(1);
  }

  const deploymentFiles = fs.readdirSync(deploymentDir)
    .filter(f => f.startsWith("testnet-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (deploymentFiles.length === 0) {
    console.error("❌ No deployment files found. Run deploy-testnet.ts first.");
    process.exit(1);
  }

  const latestDeployment = deploymentFiles[0];
  console.log("📄 Using deployment file:", latestDeployment);

  const deploymentPath = path.join(deploymentDir, latestDeployment);
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  console.log("📋 Contract addresses from deployment:");
  console.log("  AutoMine:", deploymentData.contracts.automine);
  console.log("  Mock NFT:", deploymentData.contracts.mockNFT);
  console.log("  Old Mine:", deploymentData.contracts.oldMine);
  console.log("  New Mine:", deploymentData.contracts.newMine);

  // Update bot .env.example file
  const botEnvPath = path.join(__dirname, "../../bot/.env.example");
  let envContent = fs.readFileSync(botEnvPath, "utf8");

  // Replace contract addresses
  envContent = envContent.replace(
    /AUTOMINE_CONTRACT_ADDRESS=.*/,
    `AUTOMINE_CONTRACT_ADDRESS=${deploymentData.contracts.automine}`
  );
  envContent = envContent.replace(
    /DIGDRAGON_NFT_CONTRACT_ADDRESS=.*/,
    `DIGDRAGON_NFT_CONTRACT_ADDRESS=${deploymentData.contracts.mockNFT}`
  );
  envContent = envContent.replace(
    /CURRENT_MINE_ADDRESS=.*/,
    `CURRENT_MINE_ADDRESS=${deploymentData.contracts.oldMine}`
  );
  envContent = envContent.replace(
    /TARGET_MINE_ADDRESS=.*/,
    `TARGET_MINE_ADDRESS=${deploymentData.contracts.newMine}`
  );

  fs.writeFileSync(botEnvPath, envContent);
  console.log("✅ Updated bot .env.example with contract addresses");

  // Create a config file for easy import
  const configContent = `// Auto-generated configuration from deployment
export const TESTNET_CONFIG = ${JSON.stringify(deploymentData, null, 2)};

export const CONTRACT_ADDRESSES = {
  AUTOMINE: "${deploymentData.contracts.automine}",
  MOCK_NFT: "${deploymentData.contracts.mockNFT}",
  HASH_STORAGE: "${deploymentData.contracts.mockHashStorage}",
  OLD_MINE: "${deploymentData.contracts.oldMine}",
  NEW_MINE: "${deploymentData.contracts.newMine}"
};

export const CHAIN_CONFIG = {
  RPC_URL: "https://rpc-testnet.bitkubchain.io",
  CHAIN_ID: 25925,
  NETWORK_NAME: "Bitkub Testnet"
};
`;

  const configPath = path.join(__dirname, "../../bot/src/config/testnet.ts");
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  fs.writeFileSync(configPath, configContent);
  console.log("✅ Created testnet config file:", configPath);

  console.log("🎉 Bot configuration updated successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Configuration update failed:", error);
    process.exit(1);
  });