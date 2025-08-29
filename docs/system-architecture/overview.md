# AutoMine System Architecture Overview

## Project Overview

**AutoMine** is a web-based platform that allows users to deposit their DigDragon NFTs for automated staking management. The system automatically unstakes NFTs from old mines and stakes them into new ones at specified times, with a payment model based on a percentage of user rewards.

## Architecture Goals

- **Automation**: Save users time and effort by automating the mine-switching process
- **Revenue Generation**: Generate sustainable revenue through a fee on user rewards
- **Reliability**: Build a reliable, transparent, secure, and maintainable system
- **Scalability**: Support multiple users and high transaction volumes
- **Security**: Implement comprehensive security measures for fund protection

## Core Architecture Components

### 1. Smart Contracts Layer (`packages/contracts/`)

**Technology Stack:**

- Solidity 0.8.27
- Hardhat v2.26.3
- OpenZeppelin v5.4.0
- Bitkub Chain deployment

**Core Contract: AutoMine.sol**

- **User Functions**: `deposit()`, `claimReward()`, `withdrawAllNFT()`
- **Bot Functions**: `switchMine()` for automated mine switching
- **Admin Functions**: `emergencyUnstake()`, `setMine()`, `setFeePercentage()`, `setDigDragonContract()`

**Security Features:**

- ReentrancyGuard for state-changing functions
- AccessControl for role-based permissions (Admin, Bot, User)
- Pausable contract for emergency stops
- Input validation and SafeMath (built-in Solidity 0.8+)
- Comprehensive event logging

**Integration:**

- Compatible with existing DigDragon ecosystem
- Interfaces with DigDragonMine contracts
- Integrates with KAP-721 NFT standard
- Hash power storage integration

### 2. Backend & Bot Layer (`packages/bot/`)

**Technology Stack:**

- Node.js with TypeScript
- AWS Lambda for serverless execution
- AWS Secrets Manager for secure key storage
- ethers.js for blockchain interaction

**Core Services:**

- **Contract Service**: AutoMine smart contract interaction
- **Web3 Service**: Blockchain connectivity and transaction handling
- **Monitor Service**: NFT and mining status tracking
- **Scheduler Service**: Automated task scheduling
- **Lambda Handler**: AWS deployment ready functions

**Automation Logic:**

- Mine switching algorithm based on time schedules
- User NFT tracking and management
- Batch operations for gas efficiency
- Error handling and retry mechanisms

**Infrastructure:**

- Environment configuration management
- Structured logging system (debug/info/error)
- CloudWatch integration for monitoring
- Scalable serverless architecture

### 3. Frontend Layer (`packages/frontend/`)

**Technology Stack:**

- Next.js with TypeScript
- wagmi and Viem for blockchain interactions
- shadcn-ui component library
- Tailwind CSS with "silk" theme (oklch color system)
- Framer Motion for animations

**Core Pages:**

- **Landing Page**: Project overview and wallet connection
- **User Dashboard**: NFT management, staking status, rewards
- **Admin Dashboard**: System overview, user management, emergency controls

**Features:**

- Metamask wallet integration
- Real-time blockchain data display
- Responsive design for mobile and desktop
- Transaction feedback and confirmation flows
- Loading states and comprehensive error handling
- Live contract event monitoring and real-time updates
- Environment-based configuration for multiple deployment targets
- Integration with real testnet contract addresses

**Configuration:**

- Environment variables for contract addresses and RPC URLs
- Flexible deployment configuration (testnet/mainnet)
- Real-time event listening with wagmi hooks
- Contract integration with AutoMine, DigDragon NFT, and Hash Power Storage contracts

### 4. Database Layer

**Technology Stack:**

- Render Postgres for production
- Prisma ORM for database management
- Next.js API Routes for backend services

**Data Management:**

- User account and NFT tracking
- Transaction history and analytics
- Bot operation logs and performance metrics
- Admin action audit trails

## System Integration Flow

### 1. User Interaction Flow

```
User → Frontend → Smart Contract → Blockchain
  ↓
Database ← Bot Monitoring ← Event Listening
```

### 2. Automated Mine Switching Flow

```
Scheduler → Monitor Service → Contract Service → AutoMine.sol
    ↓
Mine Status Check → NFT Batch Processing → Transaction Execution
    ↓
Event Emission → Database Update → User Notification
```

### 3. Real-time Monitoring Flow

```
Blockchain Events → Bot Listener → Database Update → Frontend Update
    ↓
CloudWatch Logs → Performance Metrics → Admin Dashboard
```

## Security Architecture

### Smart Contract Security

- **Access Control**: Role-based permissions with OpenZeppelin AccessControl
- **Reentrancy Protection**: ReentrancyGuard on all state-changing functions
- **Input Validation**: Comprehensive parameter validation
- **Emergency Controls**: Pausable contract and emergency unstake functions
- **Event Logging**: Complete audit trail through events

### Bot Security

- **Private Key Management**: AWS Secrets Manager integration
- **Environment Isolation**: Separate configurations for dev/test/prod
- **Transaction Monitoring**: Real-time transaction failure detection
- **Rate Limiting**: Gas price optimization and transaction throttling

### Frontend Security

- **Wallet Integration**: Secure Metamask connection
- **Input Sanitization**: Client-side validation and sanitization
- **HTTPS Enforcement**: Secure communication protocols
- **Error Handling**: Secure error messages without sensitive data exposure

## Testing Architecture

### Phase 1B.1: Mock Contract Testing (Completed)

- Local Hardhat network testing
- Mock DigDragon contracts for isolated testing
- Unit tests for individual components
- Integration tests with simulated environments

### Phase 1B.2: Real Testnet Validation (Current - Execution Ready)

- ✅ BitkubChain testnet deployment infrastructure ready
- ✅ Real DigDragon contract integration configured
- ✅ Phase A (Deployment & Setup) completed successfully
- 🔄 Phase B (Performance Testing) - 4-hour intensive testing
- 📋 Phase C (24-hour Reliability Testing) - continuous operation validation
- 📋 Phase D (Real-World Scenario Testing) - edge cases and economic model
- 📊 Comprehensive reporting system with real-time monitoring

### Testing Metrics and Targets

- **Success Rate**: >98% transaction success rate (validated in Phase B)
- **Response Time**: <30 seconds bot response to mine events (real-time monitoring)
- **Uptime**: >99.5% system availability (24-hour continuous testing in Phase C)
- **Gas Optimization**: Efficient gas usage for batch operations (real cost validation)
- **Integration Success**: Real DigDragon contract interactions (Phase A completed)
- **Economic Validation**: Real transaction costs vs. projections (Phase D testing)

## Deployment Architecture

### Development Environment

- Local Hardhat network for contract development
- Local Node.js server for bot testing
- Next.js development server for frontend

### Testnet Environment

- BitkubChain testnet for contract deployment
- AWS Lambda staging environment for bot
- Render staging for frontend deployment

### Production Environment

- BitkubChain mainnet for contract deployment
- AWS Lambda production for bot automation
- Render production for frontend hosting
- Render Postgres for production database

## Current Testing Infrastructure & Execution Status

### Phase 1B.2 Execution Framework

- **Automated Setup Scripts**: `npm run setup:phase1b2` for complete testnet deployment
- **Validation Scripts**: `npm run validate:real-testnet` for integration verification
- **Performance Testing**: `npm run test:performance` for 4-hour intensive testing
- **Reliability Testing**: `npm run test:24hour` for continuous operation validation
- **Real-time Monitoring**: Live dashboard at `docs/dashboard/current-status.json`

### Testing Execution Phases

1. **Phase A (Completed)**: Deployment & Setup validation
2. **Phase B (Current)**: Performance testing with real contracts
3. **Phase C (Planned)**: 24-hour reliability testing
4. **Phase D (Planned)**: Real-world scenario and economic validation

### Reporting Infrastructure

- **Real-time Logs**: `docs/logs/bot-{date}.log` (gitignored)
- **Test Reports**: `docs/reports/` directory (gitignored)
- **Live Dashboard**: JSON-based status tracking
- **Final Reports**: Comprehensive Phase 1B.2 completion documentation

## Monitoring and Analytics

### Performance Monitoring

- CloudWatch logs for bot operations
- Transaction success/failure tracking
- Gas usage optimization metrics
- User engagement analytics
- Real-time testnet performance metrics

### Business Metrics

- Fee collection efficiency
- User reward optimization results
- ROI analysis for users
- System scalability metrics

### Operational Monitoring

- System uptime and availability
- Error rates and recovery times
- Database performance metrics
- Network latency impact analysis

## Scalability Considerations

### Horizontal Scaling

- Serverless bot architecture for automatic scaling
- Database connection pooling
- CDN integration for frontend assets

### Performance Optimization

- Batch transaction processing
- Efficient gas usage strategies
- Caching strategies for frequently accessed data
- Database query optimization

### Future Enhancements

- Multi-chain support expansion
- Advanced analytics and reporting
- Mobile application development
- API ecosystem for third-party integrations
