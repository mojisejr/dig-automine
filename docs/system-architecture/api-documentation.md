# AutoMine API Documentation

## Overview

This document provides comprehensive API documentation for the AutoMine system, including smart contract interfaces, REST APIs, WebSocket connections, and integration guidelines.

## Smart Contract API

### AutoMine Contract Interface

**Contract Address:**

- Testnet: `[DEPLOYED]` (BitkubChain Testnet - Phase 1B.2 Active)
- Mainnet: `[PENDING]` (BitkubChain Mainnet - Phase 1C)

**Current Status:** ✅ Phase A deployment completed, 🔄 Phase B testing in progress

**ABI:** Available at `packages/contracts/artifacts/contracts/AutoMine.sol/AutoMine.json`

**Testing Infrastructure:**

- Real DigDragon contract integration: ✅ Validated
- Performance testing: 🔄 Phase B (4-hour intensive)
- Reliability testing: 📋 Phase C (24-hour continuous)
- Real-world scenarios: 📋 Phase D (economic validation)

#### User Functions

##### `deposit(uint256[] calldata tokenIds)`

Deposits DigDragon NFTs into the AutoMine contract for automated staking.

**Parameters:**

- `tokenIds`: Array of NFT token IDs to deposit

**Requirements:**

- Caller must own all specified NFTs
- NFTs must be approved for transfer to AutoMine contract
- Contract must not be paused

**Events Emitted:**

- `NFTDeposited(address indexed user, uint256[] tokenIds, uint256 timestamp)`

**Gas Estimate:** ~150,000 + (50,000 \* number of NFTs)

**Example Usage:**

```javascript
// Using ethers.js
const tokenIds = [1, 2, 3];
const tx = await autoMineContract.deposit(tokenIds);
const receipt = await tx.wait();
```

##### `claimReward()`

Claims accumulated mining rewards for the caller.

**Parameters:** None

**Returns:**

- Transaction hash

**Requirements:**

- User must have pending rewards
- Contract must not be paused

**Events Emitted:**

- `RewardClaimed(address indexed user, uint256 amount, uint256 fee, uint256 timestamp)`

**Gas Estimate:** ~100,000

**Example Usage:**

```javascript
const tx = await autoMineContract.claimReward();
const receipt = await tx.wait();
```

##### `withdrawAllNFT()`

Withdraws all deposited NFTs back to the user.

**Parameters:** None

**Requirements:**

- User must have deposited NFTs
- Contract must not be paused

**Events Emitted:**

- `NFTWithdrawn(address indexed user, uint256[] tokenIds, uint256 timestamp)`

**Gas Estimate:** ~100,000 + (30,000 \* number of NFTs)

**Example Usage:**

```javascript
const tx = await autoMineContract.withdrawAllNFT();
const receipt = await tx.wait();
```

#### Bot Functions

##### `switchMine(address newMineAddress)`

Switches all staked NFTs to a new mine contract.

**Parameters:**

- `newMineAddress`: Address of the new mine contract

**Requirements:**

- Caller must have BOT_ROLE
- New mine address must be valid
- Contract must not be paused

**Events Emitted:**

- `MineSwitch(address indexed oldMine, address indexed newMine, uint256 timestamp)`

**Gas Estimate:** ~200,000 + (gas per NFT transfer)

#### Admin Functions

##### `emergencyUnstake(address user)`

Emergency function to unstake a specific user's NFTs.

**Parameters:**

- `user`: Address of the user to unstake

**Requirements:**

- Caller must have ADMIN_ROLE

**Events Emitted:**

- `EmergencyUnstake(address indexed user, uint256[] tokenIds, uint256 timestamp)`

##### `setMine(address mineAddress)`

Sets the current active mine contract.

**Parameters:**

- `mineAddress`: Address of the mine contract

**Requirements:**

- Caller must have ADMIN_ROLE
- Mine address must be valid

**Events Emitted:**

- `MineUpdated(address indexed oldMine, address indexed newMine, uint256 timestamp)`

##### `setFeePercentage(uint256 percentage)`

Sets the fee percentage taken from user rewards.

**Parameters:**

- `percentage`: Fee percentage in basis points (100 = 1%)

**Requirements:**

- Caller must have ADMIN_ROLE
- Percentage must be <= 1000 (10%)

**Events Emitted:**

- `FeePercentageUpdated(uint256 oldPercentage, uint256 newPercentage, uint256 timestamp)`

#### View Functions

##### `getUserNFTs(address user) → uint256[]`

Returns array of NFT token IDs deposited by a user.

**Parameters:**

- `user`: User address

**Returns:**

- Array of token IDs

##### `getCurrentMine() → address`

Returns the address of the current active mine.

**Returns:**

- Current mine contract address

##### `getFeePercentage() → uint256`

Returns the current fee percentage.

**Returns:**

- Fee percentage in basis points

##### `getUserReward(address user) → uint256`

Returns the pending reward amount for a user.

**Parameters:**

- `user`: User address

**Returns:**

- Pending reward amount in wei

## REST API

### Base URL

- Development: `http://localhost:3000/api`
- Staging: `https://automine-staging.render.com/api`
- Production: `https://automine.yourdomain.com/api`

### Authentication

The API uses wallet signature-based authentication for user-specific endpoints.

**Authentication Header:**

```
Authorization: Bearer <wallet_signature>
X-Wallet-Address: <user_wallet_address>
```

### User Endpoints

#### `GET /users/{address}`

Retrieve user information and statistics.

**Parameters:**

- `address`: User wallet address

**Response:**

```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "nfts": [
      {
        "tokenId": "1",
        "isStaked": true,
        "depositedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "totalRewards": "1000000000000000000",
    "pendingRewards": "100000000000000000",
    "totalFeesPaid": "50000000000000000",
    "joinedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### `GET /users/{address}/nfts`

Retrieve user's deposited NFTs.

**Response:**

```json
{
  "success": true,
  "data": {
    "nfts": [
      {
        "tokenId": "1",
        "isStaked": true,
        "currentMine": "0x...",
        "depositedAt": "2024-01-01T00:00:00Z",
        "lastMineSwitch": "2024-01-02T00:00:00Z"
      }
    ],
    "totalCount": 1
  }
}
```

#### `GET /users/{address}/rewards`

Retrieve user's reward history.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `from`: Start date (ISO string)
- `to`: End date (ISO string)

**Response:**

```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": "reward_123",
        "amount": "1000000000000000000",
        "feeAmount": "50000000000000000",
        "claimedAt": "2024-01-01T00:00:00Z",
        "transactionHash": "0x..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### `GET /users/{address}/transactions`

Retrieve user's transaction history.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `type`: Transaction type filter

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "tx_123",
        "hash": "0x...",
        "type": "DEPOSIT",
        "status": "CONFIRMED",
        "amount": "0",
        "gasUsed": "150000",
        "gasPrice": "20000000000",
        "blockNumber": 12345,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### System Endpoints

#### `GET /system/stats`

Retrieve system-wide statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "totalNFTsDeposited": 5000,
    "totalRewardsPaid": "1000000000000000000000",
    "totalFeesCollected": "50000000000000000000",
    "currentMine": "0x...",
    "systemUptime": "99.95%",
    "lastMineSwitch": "2024-01-01T00:00:00Z"
  }
}
```

#### `GET /system/health`

Health check endpoint.

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "services": {
      "database": "healthy",
      "blockchain": "healthy",
      "bot": "healthy"
    }
  }
}
```

#### `GET /system/mine-status`

Retrieve current mine status and information.

**Response:**

```json
{
  "success": true,
  "data": {
    "currentMine": {
      "address": "0x...",
      "name": "DigDragon Mine #1",
      "isActive": true,
      "totalStaked": 1000,
      "rewardRate": "100000000000000000",
      "lastUpdate": "2024-01-01T00:00:00Z"
    },
    "nextMine": {
      "address": "0x...",
      "name": "DigDragon Mine #2",
      "scheduledSwitch": "2024-01-02T00:00:00Z"
    }
  }
}
```

### Admin Endpoints

#### `GET /admin/users`

Retrieve all users (admin only).

**Query Parameters:**

- `page`: Page number
- `limit`: Items per page
- `search`: Search by address

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "address": "0x...",
        "nftCount": 5,
        "totalRewards": "1000000000000000000",
        "joinedAt": "2024-01-01T00:00:00Z",
        "lastActivity": "2024-01-02T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1000,
      "totalPages": 20
    }
  }
}
```

#### `POST /admin/emergency-unstake`

Emergency unstake for a specific user.

**Request Body:**

```json
{
  "userAddress": "0x...",
  "reason": "Emergency maintenance"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "unstakedNFTs": [1, 2, 3],
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### `POST /admin/pause-system`

Pause the entire system.

**Request Body:**

```json
{
  "reason": "Maintenance"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "pausedAt": "2024-01-01T00:00:00Z"
  }
}
```

## WebSocket API

### Connection

**URL:** `wss://automine.yourdomain.com/ws`

**Authentication:**
Send authentication message after connection:

```json
{
  "type": "auth",
  "data": {
    "address": "0x...",
    "signature": "0x..."
  }
}
```

### Event Types

#### User Events

##### `nft_deposited`

```json
{
  "type": "nft_deposited",
  "data": {
    "user": "0x...",
    "tokenIds": [1, 2, 3],
    "timestamp": "2024-01-01T00:00:00Z",
    "transactionHash": "0x..."
  }
}
```

##### `reward_claimed`

```json
{
  "type": "reward_claimed",
  "data": {
    "user": "0x...",
    "amount": "1000000000000000000",
    "feeAmount": "50000000000000000",
    "timestamp": "2024-01-01T00:00:00Z",
    "transactionHash": "0x..."
  }
}
```

##### `nft_withdrawn`

```json
{
  "type": "nft_withdrawn",
  "data": {
    "user": "0x...",
    "tokenIds": [1, 2, 3],
    "timestamp": "2024-01-01T00:00:00Z",
    "transactionHash": "0x..."
  }
}
```

#### System Events

##### `mine_switch`

```json
{
  "type": "mine_switch",
  "data": {
    "oldMine": "0x...",
    "newMine": "0x...",
    "affectedUsers": 100,
    "timestamp": "2024-01-01T00:00:00Z",
    "transactionHash": "0x..."
  }
}
```

##### `system_paused`

```json
{
  "type": "system_paused",
  "data": {
    "reason": "Emergency maintenance",
    "timestamp": "2024-01-01T00:00:00Z",
    "transactionHash": "0x..."
  }
}
```

## Bot API

### AWS Lambda Functions

#### Monitor Function

**Function Name:** `automine-bot-monitor`

**Trigger:** EventBridge (every 5 minutes)

**Payload:**

```json
{
  "action": "monitor",
  "parameters": {
    "checkMineStatus": true,
    "checkUserRewards": true
  }
}
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "data": {
      "mineStatus": "active",
      "usersChecked": 100,
      "rewardsProcessed": 50,
      "errors": []
    }
  }
}
```

#### Switch Mine Function

**Function Name:** `automine-bot-switch`

**Trigger:** Manual or scheduled

**Payload:**

```json
{
  "action": "switchMine",
  "parameters": {
    "newMineAddress": "0x...",
    "batchSize": 50
  }
}
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "data": {
      "transactionHash": "0x...",
      "affectedUsers": 100,
      "gasUsed": "500000",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes

| Code                 | Description                   | HTTP Status |
| -------------------- | ----------------------------- | ----------- |
| `INVALID_ADDRESS`    | Invalid wallet address        | 400         |
| `INSUFFICIENT_FUNDS` | Insufficient balance          | 400         |
| `CONTRACT_PAUSED`    | Contract is paused            | 503         |
| `UNAUTHORIZED`       | Invalid authentication        | 401         |
| `NOT_FOUND`          | Resource not found            | 404         |
| `RATE_LIMITED`       | Too many requests             | 429         |
| `INTERNAL_ERROR`     | Server error                  | 500         |
| `BLOCKCHAIN_ERROR`   | Blockchain interaction failed | 502         |
| `TIMEOUT`            | Request timeout               | 504         |

## Rate Limiting

### API Rate Limits

| Endpoint Type         | Limit          | Window   |
| --------------------- | -------------- | -------- |
| Public endpoints      | 100 requests   | 1 minute |
| User endpoints        | 1000 requests  | 1 hour   |
| Admin endpoints       | 500 requests   | 1 hour   |
| WebSocket connections | 10 connections | Per IP   |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## SDK and Integration

### JavaScript SDK

```javascript
// Installation
npm install @automine/sdk

// Usage
import { AutoMineSDK } from '@automine/sdk';

const sdk = new AutoMineSDK({
  rpcUrl: 'https://rpc-testnet.bitkubchain.io',
  contractAddress: '0x...',
  apiUrl: 'https://automine.yourdomain.com/api'
});

// Connect wallet
await sdk.connect(window.ethereum);

// Deposit NFTs
const tx = await sdk.depositNFTs([1, 2, 3]);

// Get user data
const userData = await sdk.getUserData('0x...');

// Listen to events
sdk.on('nft_deposited', (event) => {
  console.log('NFT deposited:', event);
});
```

### Python SDK

```python
# Installation
pip install automine-sdk

# Usage
from automine_sdk import AutoMineSDK

sdk = AutoMineSDK(
    rpc_url='https://rpc-testnet.bitkubchain.io',
    contract_address='0x...',
    api_url='https://automine.yourdomain.com/api'
)

# Get user data
user_data = sdk.get_user_data('0x...')

# Monitor events
for event in sdk.listen_events():
    print(f"Event: {event['type']}, Data: {event['data']}")
```

## Testing

### API Testing

```bash
# Health check
curl https://automine.yourdomain.com/api/system/health

# Get user data
curl -H "Authorization: Bearer <signature>" \
     -H "X-Wallet-Address: 0x..." \
     https://automine.yourdomain.com/api/users/0x.../

# WebSocket connection test
wscat -c wss://automine.yourdomain.com/ws
```

### Contract Testing

```javascript
// Using ethers.js
const contract = new ethers.Contract(address, abi, provider);

// Test deposit
const tx = await contract.deposit([1, 2, 3]);
const receipt = await tx.wait();

// Test view functions
const userNFTs = await contract.getUserNFTs("0x...");
const currentMine = await contract.getCurrentMine();
```

## Changelog

### v1.0.0 (2024-01-01)

- Initial API release
- Smart contract deployment
- Basic user and admin endpoints
- WebSocket event streaming

### v1.1.0 (2024-02-01)

- Added batch operations
- Improved error handling
- Enhanced monitoring endpoints
- SDK releases

### v1.2.0 (2024-03-01)

- Performance optimizations
- Additional admin controls
- Enhanced security features
- Mobile SDK support
