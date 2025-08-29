# AutoMine Technical Specifications

## Smart Contract Specifications

### AutoMine.sol Contract Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IAutoMine {
    // User Functions
    function deposit(uint256[] calldata tokenIds) external;
    function claimReward() external;
    function withdrawAllNFT() external;

    // Bot Functions
    function switchMine(address newMineAddress) external;

    // Admin Functions
    function emergencyUnstake(address user) external;
    function setMine(address mineAddress) external;
    function setFeePercentage(uint256 percentage) external;
    function setDigDragonContract(address contractAddress) external;
    function pause() external;
    function unpause() external;

    // View Functions
    function getUserNFTs(address user) external view returns (uint256[] memory);
    function getCurrentMine() external view returns (address);
    function getFeePercentage() external view returns (uint256);
    function getUserReward(address user) external view returns (uint256);
}
```

### State Variables and Storage

```solidity
// Core state variables
mapping(address => uint256[]) private userNFTs;
mapping(address => uint256) private userRewards;
mapping(uint256 => address) private nftToUser;
address private currentMine;
address private digDragonContract;
uint256 private feePercentage; // Basis points (100 = 1%)

// Access control roles
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant BOT_ROLE = keccak256("BOT_ROLE");
```

### Events Specification

```solidity
event NFTDeposited(address indexed user, uint256[] tokenIds, uint256 timestamp);
event NFTWithdrawn(address indexed user, uint256[] tokenIds, uint256 timestamp);
event RewardClaimed(address indexed user, uint256 amount, uint256 fee, uint256 timestamp);
event MineSwitch(address indexed oldMine, address indexed newMine, uint256 timestamp);
event EmergencyUnstake(address indexed user, uint256[] tokenIds, uint256 timestamp);
event FeePercentageUpdated(uint256 oldPercentage, uint256 newPercentage, uint256 timestamp);
event MineUpdated(address indexed oldMine, address indexed newMine, uint256 timestamp);
```

### Gas Optimization Strategies

1. **Batch Operations**: Process multiple NFTs in single transaction
2. **Storage Optimization**: Use packed structs and efficient data types
3. **Event Optimization**: Indexed parameters for efficient filtering
4. **Loop Optimization**: Minimize gas usage in array operations
5. **State Variable Access**: Cache frequently accessed storage variables

### Security Measures

1. **ReentrancyGuard**: Applied to all state-changing functions
2. **Access Control**: Role-based permissions using OpenZeppelin
3. **Input Validation**: Comprehensive parameter validation
4. **Integer Overflow Protection**: Built-in Solidity 0.8+ protection
5. **Emergency Controls**: Pausable contract functionality

## Bot Architecture Specifications

### Phase 1B.2 Testing Infrastructure

```bash
# Current Testing Execution Commands

# Complete automated setup for testnet
npm run setup:phase1b2 YOUR_TESTNET_PRIVATE_KEY

# Validate real testnet deployment
npm run validate:real-testnet

# Test real NFT contract integration
npm run test:real-nft

# 4-hour performance testing
npm run test:performance

# 24-hour continuous operation testing
npm run test:24hour
```

## Frontend Integration Specifications

### Environment Configuration

```bash
# Frontend Environment Variables (.env.local)
NEXT_PUBLIC_AUTOMINE_CONTRACT_ADDRESS=0x9cf4C3F902dd56A94AeBd09526325F63f8BF7eDd
NEXT_PUBLIC_DIGDRAGON_NFT_CONTRACT_ADDRESS=0xFB5A318538aA21F06f0bc7792c34443B7B9D86B5
NEXT_PUBLIC_HASH_POWER_STORAGE_CONTRACT_ADDRESS=0xd76cD75FaA7beD947bcBfE388705c401B213F993
NEXT_PUBLIC_CHAIN_ID=25925
NEXT_PUBLIC_CHAIN_NAME="Bitkub Chain Testnet"
NEXT_PUBLIC_RPC_URL="https://rpc-testnet.bitkubchain.io"
NEXT_PUBLIC_RPC_URL_TESTNET="https://rpc-testnet.bitkubchain.io"
```

### Contract Integration Architecture

```typescript
// Dynamic contract configuration
export const CONTRACT_ADDRESSES = {
  AUTOMINE_CONTRACT: process.env.NEXT_PUBLIC_AUTOMINE_CONTRACT_ADDRESS || "0x9cf4C3F902dd56A94AeBd09526325F63f8BF7eDd",
  DIGDRAGON_NFT_CONTRACT: process.env.NEXT_PUBLIC_DIGDRAGON_NFT_CONTRACT_ADDRESS || "0xFB5A318538aA21F06f0bc7792c34443B7B9D86B5",
  HASH_POWER_STORAGE_CONTRACT: process.env.NEXT_PUBLIC_HASH_POWER_STORAGE_CONTRACT_ADDRESS || "0xd76cD75FaA7beD947bcBfE388705c401B213F993"
};

export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "25925"),
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME || "Bitkub Chain Testnet"
};
```

### Real-time Event Monitoring

```typescript
// Event listening configuration
const useContractEvents = (userAddress: string) => {
  const depositEvents = useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE_CONTRACT,
    abi: AUTOMINE_CONTRACT.abi,
    eventName: 'NFTDeposited',
    args: { user: userAddress },
    onLogs: (logs) => handleDepositEvents(logs)
  });

  const withdrawEvents = useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE_CONTRACT,
    abi: AUTOMINE_CONTRACT.abi,
    eventName: 'NFTWithdrawn',
    args: { user: userAddress },
    onLogs: (logs) => handleWithdrawEvents(logs)
  });

  const rewardEvents = useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE_CONTRACT,
    abi: AUTOMINE_CONTRACT.abi,
    eventName: 'RewardClaimed',
    args: { user: userAddress },
    onLogs: (logs) => handleRewardEvents(logs)
  });
};
```

### Wagmi Configuration

```typescript
// Optimized chain configuration
export const config = createConfig({
  chains: [bitkubTestnet],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [bitkubTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL_TESTNET || "https://rpc-testnet.bitkubchain.io")
  },
});
```

### Testing Execution Status

- ✅ **Phase A (Deployment & Setup)**: Completed successfully
- 🔄 **Phase B (Performance Testing)**: Ready for execution
- 📋 **Phase C (24-hour Reliability)**: Awaiting Phase B completion
- 📋 **Phase D (Real-world Scenarios)**: Final validation phase

### Core Services Architecture

```typescript
// Service Layer Architecture
interface IContractService {
  switchMine(newMineAddress: string): Promise<TransactionResponse>;
  getUserNFTs(userAddress: string): Promise<string[]>;
  getCurrentMine(): Promise<string>;
  monitorEvents(): Promise<void>;
}

interface IWeb3Service {
  getProvider(): JsonRpcProvider;
  getSigner(): Wallet;
  estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
  sendTransaction(
    transaction: TransactionRequest
  ): Promise<TransactionResponse>;
}

interface IMonitorService {
  trackUserNFTs(): Promise<void>;
  checkMineStatus(): Promise<MineStatus>;
  detectMineChanges(): Promise<boolean>;
  generateReport(): Promise<MonitoringReport>;
}
```

### Lambda Function Specifications

```typescript
// AWS Lambda Handler Interface
export interface LambdaEvent {
  action: "switchMine" | "monitor" | "report";
  parameters?: {
    newMineAddress?: string;
    userAddress?: string;
    batchSize?: number;
  };
}

export interface LambdaResponse {
  statusCode: number;
  body: {
    success: boolean;
    data?: any;
    error?: string;
    transactionHash?: string;
  };
}
```

### Environment Configuration

```typescript
// Environment Variables Schema
interface EnvironmentConfig {
  // Blockchain Configuration
  RPC_URL: string;
  CHAIN_ID: number;
  PRIVATE_KEY: string; // Stored in AWS Secrets Manager

  // Contract Addresses
  AUTOMINE_CONTRACT: string;
  DIGDRAGON_CONTRACT: string;

  // AWS Configuration
  AWS_REGION: string;
  SECRET_NAME: string;

  // Monitoring Configuration
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
  BATCH_SIZE: number;
  RETRY_ATTEMPTS: number;
  TIMEOUT_MS: number;
}
```

### Error Handling and Retry Logic

```typescript
// Retry Configuration
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

// Error Types
enum ErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  CONTRACT_ERROR = "CONTRACT_ERROR",
  INSUFFICIENT_GAS = "INSUFFICIENT_GAS",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
}
```

## Frontend Technical Specifications

### Component Architecture

```typescript
// Core Component Interfaces
interface UserDashboardProps {
  userAddress: string;
  nfts: NFTData[];
  rewards: RewardData;
  mineStatus: MineStatus;
}

interface AdminDashboardProps {
  systemStats: SystemStats;
  userList: UserData[];
  emergencyControls: EmergencyControls;
}

interface WalletConnectionProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  supportedChains: Chain[];
}
```

### State Management

```typescript
// Global State Interface
interface AppState {
  user: {
    address: string | null;
    isConnected: boolean;
    nfts: NFTData[];
    rewards: number;
  };
  system: {
    currentMine: string;
    isLoading: boolean;
    error: string | null;
  };
  admin: {
    isAdmin: boolean;
    systemStats: SystemStats;
    users: UserData[];
  };
}
```

### API Integration

```typescript
// API Service Interface
interface APIService {
  // User Operations
  getUserNFTs(address: string): Promise<NFTData[]>;
  getUserRewards(address: string): Promise<number>;
  claimRewards(address: string): Promise<TransactionResult>;

  // System Operations
  getSystemStats(): Promise<SystemStats>;
  getMineStatus(): Promise<MineStatus>;

  // Admin Operations
  getAllUsers(): Promise<UserData[]>;
  emergencyUnstake(userAddress: string): Promise<TransactionResult>;
}
```

### Dashboard UI Specifications

```typescript
// Network Display Component
interface NetworkDisplayProps {
  chainId: number;
  chainName: string;
  isWrongNetwork: boolean;
  onSwitchNetwork: () => void;
}

// Transaction Status Component
interface TransactionStatusProps {
  status: 'pending' | 'confirming' | 'confirmed' | 'error';
  hash?: string;
  error?: string;
  responsive: boolean; // Ensures proper text wrapping and overflow handling
}

// Enhanced Error Handling
interface ErrorDisplayProps {
  message: string;
  className?: string; // Supports 'break-words', 'flex-shrink-0' for responsive design
  maxLength?: number; // Optional truncation for very long error messages
}
```

### UI Responsive Design Patterns

```css
/* Error Message Responsive Styling */
.error-message {
  word-break: break-words;
  flex-shrink: 0;
  max-width: 100%;
  overflow-wrap: break-word;
}

/* Network Status Indicator */
.network-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.network-status.wrong-network {
  color: rgb(239 68 68); /* red-500 */
}

.network-status.correct-network {
  color: rgb(34 197 94); /* green-500 */
}
```
```

## Database Schema Specifications

### Prisma Schema

```prisma
// User Management
model User {
  id          String   @id @default(cuid())
  address     String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  nfts        UserNFT[]
  transactions Transaction[]
  rewards     Reward[]

  @@map("users")
}

// NFT Tracking
model UserNFT {
  id        String   @id @default(cuid())
  tokenId   String
  userId    String
  isStaked  Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@unique([tokenId, userId])
  @@map("user_nfts")
}

// Transaction History
model Transaction {
  id            String      @id @default(cuid())
  hash          String      @unique
  type          TransactionType
  status        TransactionStatus
  userId        String
  amount        Decimal?
  gasUsed       String?
  gasPrice      String?
  blockNumber   Int?
  createdAt     DateTime    @default(now())

  user User @relation(fields: [userId], references: [id])

  @@map("transactions")
}

// Reward Tracking
model Reward {
  id          String   @id @default(cuid())
  userId      String
  amount      Decimal
  feeAmount   Decimal
  claimedAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@map("rewards")
}

// System Monitoring
model SystemLog {
  id        String   @id @default(cuid())
  level     LogLevel
  message   String
  data      Json?
  createdAt DateTime @default(now())

  @@map("system_logs")
}

enum TransactionType {
  DEPOSIT
  WITHDRAW
  CLAIM_REWARD
  MINE_SWITCH
  EMERGENCY_UNSTAKE
}

enum TransactionStatus {
  PENDING
  CONFIRMED
  FAILED
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
}
```

## Performance Specifications

### Target Performance Metrics

| Metric                   | Target      | Measurement                    |
| ------------------------ | ----------- | ------------------------------ |
| Transaction Success Rate | >98%        | 24-hour rolling average        |
| Bot Response Time        | <30 seconds | Time from mine event to action |
| System Uptime            | >99.5%      | Monthly availability           |
| Frontend Load Time       | <3 seconds  | Initial page load              |
| API Response Time        | <500ms      | 95th percentile                |
| Database Query Time      | <100ms      | Average query execution        |

### Scalability Targets

| Component             | Current Capacity | Target Capacity |
| --------------------- | ---------------- | --------------- |
| Concurrent Users      | 100              | 1,000           |
| NFTs per User         | 50               | 500             |
| Transactions per Hour | 1,000            | 10,000          |
| Database Connections  | 20               | 100             |

### Gas Optimization Targets

| Operation                 | Current Gas | Target Gas | Optimization             |
| ------------------------- | ----------- | ---------- | ------------------------ |
| NFT Deposit (single)      | ~150,000    | ~120,000   | Batch processing         |
| NFT Deposit (batch of 10) | ~800,000    | ~600,000   | Loop optimization        |
| Mine Switch               | ~200,000    | ~150,000   | State caching            |
| Reward Claim              | ~100,000    | ~80,000    | Calculation optimization |

## Security Specifications

### Smart Contract Security Checklist

- [ ] Reentrancy protection on all state-changing functions
- [ ] Access control implementation with role-based permissions
- [ ] Input validation for all external function parameters
- [ ] Integer overflow/underflow protection
- [ ] Emergency pause functionality
- [ ] Event emission for all critical operations
- [ ] Gas limit considerations for loops
- [ ] External contract interaction safety

### Bot Security Checklist

- [ ] Private key storage in AWS Secrets Manager
- [ ] Environment variable validation
- [ ] Transaction signing security
- [ ] Rate limiting implementation
- [ ] Error handling without sensitive data exposure
- [ ] Logging security (no private keys in logs)
- [ ] Network timeout configurations
- [ ] Retry mechanism with exponential backoff

### Frontend Security Checklist

- [ ] Wallet connection security
- [ ] Input sanitization and validation
- [ ] HTTPS enforcement
- [ ] Content Security Policy (CSP) headers
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure error handling
- [ ] Session management security

## Testing Specifications

### Unit Testing Coverage Targets

| Component           | Coverage Target | Test Types                  |
| ------------------- | --------------- | --------------------------- |
| Smart Contracts     | >95%            | Function, Branch, Statement |
| Bot Services        | >90%            | Unit, Integration           |
| Frontend Components | >85%            | Component, Hook, Utility    |
| API Endpoints       | >90%            | Request, Response, Error    |

### Integration Testing Scenarios

1. **End-to-End User Flow**

   - Wallet connection → NFT deposit → Mine switch → Reward claim → NFT withdrawal

2. **Bot Automation Flow**

   - Mine event detection → User notification → Automatic switching → Status update

3. **Admin Emergency Flow**

   - Emergency detection → System pause → User unstaking → System recovery

4. **Error Recovery Flow**
   - Transaction failure → Retry mechanism → Success confirmation → State consistency

### Load Testing Specifications

| Test Scenario  | Concurrent Users | Duration   | Success Criteria      |
| -------------- | ---------------- | ---------- | --------------------- |
| Normal Load    | 50 users         | 1 hour     | <2s response time     |
| Peak Load      | 200 users        | 30 minutes | <5s response time     |
| Stress Test    | 500 users        | 15 minutes | System remains stable |
| Endurance Test | 100 users        | 24 hours   | No memory leaks       |

## Deployment Specifications

### Infrastructure Requirements

| Environment | Component       | Specification             |
| ----------- | --------------- | ------------------------- |
| Development | Local Node      | Node.js 18+, 8GB RAM      |
| Staging     | AWS Lambda      | 512MB memory, 30s timeout |
| Production  | AWS Lambda      | 1GB memory, 60s timeout   |
| Database    | Render Postgres | 2GB RAM, 20GB storage     |
| Frontend    | Render Static   | CDN enabled               |

### Deployment Pipeline

1. **Development**

   - Local testing with Hardhat network
   - Unit and integration tests
   - Code quality checks (ESLint, Prettier)

2. **Staging**

   - Testnet deployment
   - End-to-end testing
   - Performance validation

3. **Production**
   - Mainnet deployment
   - Monitoring setup
   - Rollback procedures

### Monitoring and Alerting

| Metric              | Threshold | Alert Type | Response Time |
| ------------------- | --------- | ---------- | ------------- |
| Error Rate          | >5%       | Critical   | Immediate     |
| Response Time       | >10s      | Warning    | 15 minutes    |
| System Downtime     | >1 minute | Critical   | Immediate     |
| Gas Price Spike     | >200 gwei | Warning    | 30 minutes    |
| Failed Transactions | >10/hour  | Warning    | 1 hour        |
