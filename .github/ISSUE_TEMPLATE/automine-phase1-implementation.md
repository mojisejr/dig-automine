## 📝 Plan for: AutoMine Phase 1 - Core MVP Implementation

**Priority:** High

### **Context**

AutoMine is a web-based platform for automated DigDragon NFT staking management. Phase 1 focuses on implementing the core MVP functionality that allows users to deposit NFTs, automated mine switching, and reward claiming with fee collection. This establishes the foundation for the entire AutoMine ecosystem.

### **Goal**

- To create a fully functional MVP of AutoMine with core automation features.
- To ensure all project best practices (security, testing, integration) are implemented.
- To establish a solid foundation for future feature expansion.

### **Success Criteria**

- All core smart contract functions are implemented and tested.
- Frontend provides complete user and admin interfaces.
- Bot successfully automates mine switching operations.
- End-to-end system integration is working and tested.
- Ready for testnet deployment and user testing.

### **Tasks**

- **Requirement Summary:** Implement AutoMine MVP with automated NFT staking management, user deposit/withdrawal, automated mine switching, and percentage-based fee collection from rewards.

- **Analysis:**
  - **Affected Systems:** All three main components (Smart Contract, Frontend, Bot)
  - **Core Dependencies:** DigDragon NFT contract, DigDragonMineV2 contract, Hash Power Storage contract
  - **New Components:** AutoMine.sol, user dashboard, admin dashboard, automated bot service

- **Action Plan:**

#### **Phase 1A: Smart Contract Development** (`packages/contracts/`)
  1. **Setup and Foundation**
     - Configure Hardhat environment for Bitkub Chain compatibility
     - Import required OpenZeppelin contracts (ReentrancyGuard, AccessControl, SafeMath)
     - Set up contract structure and state variables
  
  2. **Core Contract Implementation** - `AutoMine.sol`
     - **User Functions:**
       - `deposit(uint256[] calldata _tokenIds)` - Accept NFT deposits with proper approval checks
       - `claimReward()` - Calculate rewards, deduct fee percentage, transfer remaining to user
       - `withdrawAllNFT()` - Unstake all user NFTs and return to wallet
     - **Bot Functions:**
       - `switchMine(address _targetMine)` - Automated mine switching for all deposited NFTs
     - **Admin Functions:**
       - `emergencyUnstake(address _user, uint256[] calldata _tokenIds)` - Emergency NFT recovery
       - `setMine(address _current, address _target)` - Configure mine addresses
       - `setFeePercentage(uint256 _newFee)` - Set fee percentage (with reasonable limits)
       - `setDigDragonContract(address _nftAddress)` - Configure NFT contract address

  3. **Integration Layer**
     - Interface definitions for DigDragon contracts interaction
     - Hash power calculation integration with existing storage contract
     - Reward calculation logic compatible with existing mine mechanics

  4. **Security Implementation**
     - ReentrancyGuard for all state-changing functions
     - AccessControl for admin and bot permissions
     - Input validation and bounds checking
     - Emergency pause functionality

  5. **Testing Suite**
     - Unit tests for all contract functions
     - Integration tests with mock DigDragon contracts
     - Security tests for attack vectors (reentrancy, unauthorized access)
     - Gas optimization tests

#### **Phase 1B: Bot Development** (`packages/bot/`)
  1. **Core Bot Structure**
     - Node.js service with TypeScript
     - Environment configuration for private keys and contract addresses
     - Scheduler for automated mine switching
     
  2. **Blockchain Integration**
     - Web3 connection setup for Bitkub Chain
     - Contract interaction layer for AutoMine contract
     - Transaction monitoring and error handling
     
  3. **Automation Logic**
     - Mine switching algorithm based on time schedules
     - User NFT tracking and management
     - Batch operations for efficiency
     
  4. **AWS Lambda Preparation**
     - Serverless function structure
     - AWS Secrets Manager integration for secure key storage
     - CloudWatch logging integration

#### **Phase 1C: Frontend Development** (`packages/frontend/`)
  1. **Design System Implementation**
     - Implement "silk" theme using oklch color system
     - Set up Tailwind CSS with custom color variables
     - Create reusable UI components with shadcn-ui
     
  2. **Core Pages and Components**
     - **Landing Page**: Project overview and wallet connection
     - **User Dashboard**: 
       - NFT deposit/withdrawal interface
       - Real-time staking status display
       - Countdown timers for next mine switch
       - Reward calculation and claiming
       - Transaction history
     - **Admin Dashboard**:
       - System overview and statistics
       - User management and emergency controls
       - Mine configuration interface
       - Action log viewer (User/Bot/Admin actions)
     
  3. **Blockchain Integration**
     - wagmi configuration for Bitkub Chain
     - Contract interaction hooks
     - Real-time data fetching from blockchain
     - Transaction state management
     
  4. **User Experience**
     - Responsive design for mobile and desktop
     - Loading states and error handling
     - Transaction feedback and confirmation flows
     - Framer Motion animations for smooth interactions

#### **Phase 1D: Integration & Testing**
  1. **Component Integration**
     - Smart contract deployment to testnet
     - Frontend connection to deployed contracts
     - Bot integration with deployed contracts
     
  2. **End-to-End Testing**
     - Playwright test suites for complete user journeys
     - Bot automation testing with real contracts
     - Admin function testing and emergency procedures
     
  3. **Performance Testing**
     - Gas optimization verification
     - Frontend load testing
     - Bot efficiency and reliability testing

- **Considerations:**
  - **Security:** 
    - Implement ReentrancyGuard for all state-changing functions
    - Use AccessControl for role-based permissions (Admin, Bot, User)
    - Validate all user inputs and external contract calls
    - Implement emergency pause mechanisms
    - Secure private key management for bot operations
  - **Testing:** 
    - Comprehensive Hardhat test suite for smart contracts
    - Integration tests with mock and real DigDragon contracts
    - Playwright E2E tests for all user flows
    - Bot automation testing with various scenarios
  - **Logging:** 
    - Smart contract events for all critical actions (deposit, withdraw, mine switch, fee collection)
    - Frontend action logging for user behavior analysis
    - Bot operation logs with debug/info/error prefixes
    - Admin action audit trail

### **Implementation Timeline**
- **Week 1-2**: Smart Contract development and testing
- **Week 3**: Bot development and contract integration
- **Week 4-5**: Frontend development and UI implementation
- **Week 6**: Integration testing and bug fixes
- **Week 7**: Final testing and testnet deployment preparation

### **Definition of Done**
- [ ] AutoMine.sol contract deployed and verified on testnet
- [ ] All contract functions tested with >95% code coverage
- [ ] Bot successfully performs automated mine switching
- [ ] Frontend provides complete user and admin interfaces
- [ ] End-to-end testing passes for all user journeys
- [ ] Security audit completed with no critical issues
- [ ] Documentation updated with deployment and usage instructions