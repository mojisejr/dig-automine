# AutoMine Phase 1B.1 - Bot-Contract Integration Testing

## Overview
Phase 1B.1 implements comprehensive integration testing between the AutoMine bot and smart contracts on Bitkub testnet. This phase validates the core automation functionality before frontend development.

## Quick Start

### 1. Prerequisites
- Node.js 18+ with pnpm
- Bitkub testnet KUB tokens (get from [faucet](https://faucet.bitkubchain.io/))
- Private key for testnet deployment and bot operations

### 2. Environment Setup
```bash
# 1. Setup contract environment
cd packages/contracts
cp .env.example .env
# Add your PRIVATE_KEY to .env

# 2. Setup bot environment  
cd ../bot
cp .env.example .env
# Add your BOT_PRIVATE_KEY to .env
```

### 3. Complete Testing Flow
```bash
# Run comprehensive validation
npm run validate:phase1b1

# OR run individual steps:

# 1. Deploy all contracts to testnet
cd packages/contracts
npx hardhat run scripts/deploy-testnet.ts --network bitkubTestnet

# 2. Test NFT staking functionality
npx hardhat run scripts/test-nft-staking.ts --network bitkubTestnet

# 3. Test mine switching operations
npx hardhat run scripts/test-mine-switching.ts --network bitkubTestnet

# 4. Run bot integration tests
cd ../bot
pnpm test:integration

# 5. Start bot in development mode
pnpm dev
```

## Testing Components

### 🏗️ Contract Deployment (`packages/contracts/scripts/`)
- **`deploy-testnet.ts`**: Deploys AutoMine + all mock contracts
- **`deploy-mocks.ts`**: Deploys only mock contracts for testing
- **`update-bot-config.ts`**: Updates bot environment with deployed addresses

### 🧪 Contract Testing (`packages/contracts/scripts/`)
- **`test-nft-staking.ts`**: Tests NFT deposit/withdrawal functionality
- **`test-mine-switching.ts`**: Tests automated mine switching operations

### 🤖 Bot Testing (`packages/bot/src/`)
- **`test-runner.ts`**: Comprehensive bot integration tests
- **`services/mine-monitor.ts`**: Mine status monitoring with timing analysis
- **`services/dashboard.ts`**: Real-time monitoring dashboard
- **`services/reporting.ts`**: Automated report generation

### 📊 Monitoring & Reports
- **Dashboard**: Real-time bot status at `docs/dashboard/current-status.json`
- **Logs**: Daily operation logs in `docs/logs/bot-{date}.log`
- **Reports**: Test results and performance metrics in `docs/reports/`

## Testing Scenarios

### 2.1 Mine Status Monitoring
✅ **Implementation Complete**
- Real-time mine status tracking (active/inactive)
- Historical pattern analysis for timing optimization
- Alert system for status changes
- Predictive timing algorithms

### 2.2 Automated NFT Staking  
✅ **Implementation Complete**
- NFT deposit/withdrawal operations
- Contract interaction validation
- Error handling and retry logic
- Gas optimization tracking

### 2.3 Mine Timing Analysis
✅ **Implementation Complete**  
- Historical mine status tracking
- Pattern recognition for optimal switching
- Predictive timing calculations
- Confidence scoring for recommendations

### 2.4 Automated Mine Switching
✅ **Implementation Complete**
- Batch NFT migration between mines
- Transaction monitoring and verification
- Success/failure tracking
- Performance metrics collection

## Manual Testing Commands

```bash
# Build and test contracts
cd packages/contracts
pnpm hardhat compile
pnpm hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy-testnet.ts --network bitkubTestnet

# Test NFT operations
npx hardhat run scripts/test-nft-staking.ts --network bitkubTestnet

# Test mine switching
npx hardhat run scripts/test-mine-switching.ts --network bitkubTestnet

# Run bot tests
cd ../bot
pnpm test:integration

# Start bot monitoring
pnpm dev
```

## Expected Results

### ✅ Success Criteria
- [ ] Bot monitors mine status with >99% accuracy
- [ ] Automated NFT staking >95% success rate  
- [ ] Mine switching within optimal time windows
- [ ] All operations properly logged and reported
- [ ] System handles edge cases and network issues
- [ ] Gas optimization meets efficiency targets
- [ ] Ready for Phase 1C frontend integration

### 📊 Performance Targets
- Transaction success rate >95%
- Average gas usage optimization >20%
- Error recovery time <30 seconds  
- System uptime >99.9%

## Troubleshooting

### Common Issues
1. **Contract deployment fails**: Check testnet KUB balance
2. **Bot role verification fails**: Ensure BOT_ROLE was granted during deployment
3. **Mine status reads fail**: Verify contract addresses in bot config
4. **Transaction timeouts**: Adjust gas limit/price in configuration

### Debug Commands
```bash
# Check contract compilation
npx hardhat compile --show-stack-traces

# Test specific contract functions
npx hardhat console --network bitkubTestnet

# Debug bot connections
cd packages/bot && LOG_LEVEL=debug pnpm dev

# Check deployment status
cat packages/contracts/deployments/testnet-*.json
```

## Files Generated

### Deployment
- `packages/contracts/deployments/testnet-{timestamp}.json`
- `packages/bot/src/config/testnet.ts`

### Reports  
- `docs/reports/bot-integration-test-{timestamp}.json`
- `docs/reports/nft-staking-test-{timestamp}.json`
- `docs/reports/mine-switching-test-{timestamp}.json`

### Monitoring
- `docs/dashboard/current-status.json`
- `docs/logs/bot-{date}.log`
- `docs/mine-history.json`

## Next Steps

Upon successful completion of Phase 1B.1:
1. Update `docs/current-focus.md` to Phase 1C
2. Begin frontend development with contract integration
3. Implement user dashboard with real-time bot monitoring
4. Prepare for end-to-end system testing