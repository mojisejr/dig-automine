import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Setting up complete testnet environment...");

  try {
    // Step 1: Deploy all contracts
    console.log("📦 Step 1: Deploying contracts...");
    execSync("npx hardhat run scripts/deploy-testnet.ts --network bitkubTestnet", {
      stdio: "inherit",
      cwd: process.cwd()
    });

    // Step 2: Update bot configuration
    console.log("🔧 Step 2: Updating bot configuration...");
    execSync("npx hardhat run scripts/update-bot-config.ts", {
      stdio: "inherit",
      cwd: process.cwd()
    });

    // Step 3: Create documentation
    console.log("📚 Step 3: Creating setup documentation...");
    const docsDir = path.join(__dirname, "../../../docs/testnet");
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const setupGuide = `# Testnet Setup Guide

## Quick Start

1. **Deploy contracts:**
   \`\`\`bash
   cd packages/contracts
   npx hardhat run scripts/setup-testnet.ts --network bitkubTestnet
   \`\`\`

2. **Start bot in development mode:**
   \`\`\`bash
   cd packages/bot
   cp .env.example .env
   # Add your PRIVATE_KEY to .env
   pnpm dev
   \`\`\`

## Manual Deployment

If you need to deploy contracts individually:

\`\`\`bash
# Deploy mocks only
npx hardhat run scripts/deploy-mocks.ts --network bitkubTestnet

# Deploy AutoMine only
npx hardhat run scripts/deploy.ts --network bitkubTestnet

# Update bot config
npx hardhat run scripts/update-bot-config.ts
\`\`\`

## Testing Checklist

- [ ] Contracts deployed successfully
- [ ] Bot can connect to testnet
- [ ] Bot can read contract state
- [ ] Mine switching works
- [ ] NFT operations work
- [ ] Reward claiming works
- [ ] Error handling works

## Troubleshooting

### Common Issues

1. **Insufficient balance**: Get testnet KUB from [Bitkub Faucet](https://faucet.bitkubchain.io/)
2. **Contract not found**: Check contract addresses in deployment files
3. **Bot connection fails**: Verify RPC URL and chain ID
4. **Transaction fails**: Check gas limit and price settings

### Contract Addresses

Check \`packages/contracts/deployments/\` for the latest deployment addresses.

### Bot Environment

Update \`packages/bot/.env\` with your private key and any custom settings.
`;

    fs.writeFileSync(path.join(docsDir, "setup-guide.md"), setupGuide);
    console.log("✅ Created testnet setup guide");

    console.log("🎉 Testnet environment setup complete!");
    console.log("📝 Next steps:");
    console.log("  1. Add your PRIVATE_KEY to packages/contracts/.env");
    console.log("  2. Get testnet KUB from https://faucet.bitkubchain.io/");
    console.log("  3. Run the deployment script");
    console.log("  4. Update bot configuration and start testing");

  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

main();