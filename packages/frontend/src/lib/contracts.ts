import { Address } from 'viem';

// Contract Addresses - Using Environment Variables
// Fallback to testnet addresses if environment variables are not set
export const CONTRACT_ADDRESSES = {
  // AutoMine Contract (Main Contract)
  AUTOMINE: (process.env.NEXT_PUBLIC_AUTOMINE_CONTRACT_ADDRESS || '0x9cf4C3F902dd56A94AeBd09526325F63f8BF7eDd') as Address,
  
  // DigDragon NFT Contract
  DIGDRAGON_NFT: (process.env.NEXT_PUBLIC_DIGDRAGON_NFT_CONTRACT_ADDRESS || '0xFB5A318538aA21F06f0bc7792c34443B7B9D86B5') as Address,
  
  // Hash Power Storage Contract
  HASH_POWER_STORAGE: (process.env.NEXT_PUBLIC_HASH_POWER_STORAGE_ADDRESS || '0xd76cD75FaA7beD947bcBfE388705c401B213F993') as Address,
  
  // Mine Contracts
  CURRENT_MINE: (process.env.NEXT_PUBLIC_CURRENT_MINE_ADDRESS || '0x1B48a622d4f190b9060462020320d4cA8C588899') as Address,
  TARGET_MINE: (process.env.NEXT_PUBLIC_TARGET_MINE_ADDRESS || '0x0a32B6924785D443D2D7f2B7Cf42b4C8694F1Ebf') as Address,
} as const;

// Network Configuration - Using Environment Variables
export const NETWORK_CONFIG = {
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '25925'), // Bitkub Testnet
  NETWORK_NAME: process.env.NEXT_PUBLIC_NETWORK || 'bitkubTestnet',
  DEPLOYER: '0x4C06524B1bd7AA002747252257bBE0C472735A6D' as Address,
  FEE_PERCENTAGE: 500, // 5% (500 basis points)
  MAX_FEE_PERCENTAGE: 2000, // 20% (2000 basis points)
} as const;

// AutoMine Contract ABI
export const AUTOMINE_ABI = [
  // View Functions
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserInfo',
    outputs: [
      { name: 'tokenIds', type: 'uint256[]' },
      { name: 'totalHashPower', type: 'uint256' },
      { name: 'lastRewardClaim', type: 'uint256' },
      { name: 'isActive', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getContractStats',
    outputs: [
      { name: 'totalTokens', type: 'uint256' },
      { name: 'activeUsers', type: 'uint256' },
      { name: 'current', type: 'address' },
      { name: 'target', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getDepositedTokens',
    outputs: [
      { name: 'users', type: 'address[]' },
      { name: 'tokenIds', type: 'uint256[][]' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'currentMine',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'targetMine',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'feePercentage',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  
  // User Functions
  {
    inputs: [{ name: '_tokenIds', type: 'uint256[]' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'claimReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'withdrawAllNFT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  
  // Bot Functions
  {
    inputs: [{ name: '_targetMine', type: 'address' }],
    name: 'switchMine',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  
  // Role Functions
  {
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' }
    ],
    name: 'hasRole',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'BOT_ROLE',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'tokenIds', type: 'uint256[]' },
      { indexed: false, name: 'totalHashPower', type: 'uint256' }
    ],
    name: 'NFTDeposited',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'tokenIds', type: 'uint256[]' }
    ],
    name: 'NFTWithdrawn',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'grossReward', type: 'uint256' },
      { indexed: false, name: 'fee', type: 'uint256' },
      { indexed: false, name: 'netReward', type: 'uint256' }
    ],
    name: 'RewardClaimed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'totalTokens', type: 'uint256' }
    ],
    name: 'MineSwitch',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'admin', type: 'address' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'tokenIds', type: 'uint256[]' }
    ],
    name: 'EmergencyUnstake',
    type: 'event'
  }
] as const;

// DigDragon NFT Contract ABI (Basic ERC721 functions)
export const DIGDRAGON_NFT_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' }
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' }
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Type definitions
export interface UserInfo {
  tokenIds: bigint[];
  totalHashPower: bigint;
  lastRewardClaim: bigint;
  isActive: boolean;
}

export interface ContractStats {
  totalTokens: bigint;
  activeUsers: bigint;
  current: Address;
  target: Address;
}

export interface DepositedTokens {
  users: Address[];
  tokenIds: bigint[][];
}