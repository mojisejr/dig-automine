## Project Overview

**Project Name**: AutoMine

**Description**: AutoMine is a web-based platform that allows users to deposit their DigDragon NFTs for automated staking management. The system automatically unstakes NFTs from old mines and stakes them into new ones at specified times. The payment model is based on a percentage of the user's rewards.

**Project Goals**:

- Save users time and effort by automating the mine-switching process.
- Generate sustainable revenue through a fee on user rewards.
- Build a reliable, transparent, secure, and maintainable system.

---

## Architecture Overview

### Core Structure

- **Package Manager**: pnpm (for Monorepo)
- **Smart Contracts**: `packages/contracts/` - The core logic of the system, written in Solidity and tested with Hardhat.
- **Frontend**: `packages/frontend/` - The user and admin interface, built with Next.js.
- **Backend & Bot**: `packages/bot/` - Off-chain automation, built with Node.js and planned for serverless execution on AWS Lambda.

### Tech Stack

- **Smart Contract**: Solidity, Hardhat, OpenZeppelin
- **Frontend**: Next.js (TypeScript), wagmi, Viem, shadcn-ui, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Next.js API Routes, Prisma
- **Automated Bot**: Node.js, AWS Lambda, AWS Secrets Manager
- **Database**: Render Postgres
- **Testing**: Hardhat (Smart Contract), Playwright MCP (Frontend)
- **Deployment**: Render (Frontend), AWS Lambda (Bot), Hardhat (Smart Contract on Bitkub Chain)

---

## Core Development Commands

This section lists common commands for this project.

### Frontend (`packages/frontend`)

- **Development**: `pnpm dev`
- **Build**: `pnpm build`
- **Start**: `pnpm start`
- **Lint**: `pnpm lint`

### Contracts (`packages/contracts`)

- **Compile & Test**: (Assumed based on Hardhat setup) `pnpm hardhat compile`, `pnpm hardhat test`

### Bot (`packages/bot`)

- **Run**: (Assumed based on `ts-node`) `pnpm ts-node index.ts`

---

## Visual Development (Playwright MCP)

- **UI Interaction**: For any UI-related tasks, always use Playwright MCP when available.
- **Navigation**: Use `mcp__playwright__browser_navigate` to go to the page you are working on.
- **Verification**: Use it to verify functionality or for end-to-end testing.
- **Analysis**: Take screenshots of the screen when you need to analyze what is happening.
- **Error Checking**: You can check for error messages with `mcp__playwright__browser_console_messages`.

---

## Development Guidelines

- **Environment Variables**: Before starting development, create a `.env` file in the project root by copying `.env.example`. This file is ignored by Git and should contain all your secret keys and environment-specific settings.
- **Solo Developer Approach**: Use simple, maintainable code patterns.
- **Implementation Approach**: Always start with the simplest solution (Minimum Viable Implementation) and iterate incrementally.
- **Workflow การพัฒนา**:
  1. **Dev Contract**
  2. **Test Contract**
  3. **Dev Bot**
  4. **Test Bot with Contract**
  5. **Dev UI**
  6. **Test UI with Bot and Contract**
- **Testing**:
  - **Smart Contract**: Use Hardhat for test scripts.
  - **Frontend**: Use Playwright for End-to-End Testing.
- **Logging**: Use clear prefixes: `debug`, `info`, and `error`.
- **Security**:
  - **Reentrancy**: Use `ReentrancyGuard`.
  - **Access Control**: Use `onlyOwner` or `AccessControl`.
  - **Integer Overflow/Underflow**: Use SafeMath library.
  - **Events**: Log all critical actions with events.

---

## Current Focus & Retrospective

**📖 To get the most recent context, always check `/docs/current-focus.md`**

### Shortcut Commands

These commands streamline our communication. You can use them with or without a message.

- **`=fcs > [ข้อความ]`**: Update `current-focus.md`.
- **`=atc > [ข้อความ]`**: Update architecture documentation in `/docs/system-architecture/`.
- **`=impl > [ข้อความ]`**: Begin implementation immediately.
- **`=rrr > [ข้อความ]`**: Update the retrospective file for the current day.
- **`=plan > [ข้อความคำถาม/โจทย์]`**: Plan the work in detail without writing code yet.
- **`=plan --retro --focus > [ข้อความคำถาม/โจทย์]`**: Plan work based on the context provided.

### Retrospective Workflow

The `=rrr` command is designed to help you log your daily work.

---

### **Daily Updates**

When you use the command `=rrr > [message]`, I'll first check the current date. I'll then locate today's retrospective file and append your message to the appropriate section. If today's file doesn't exist yet, I will create a new one using a standard template.

### **File Naming**

Files are named in the format `YYYY-MM-DD.md` (e.g., `2024-07-31.md`).

### **Folder Structure**

At the start of each new month, I will create a new folder named `YYYY-MM` (e.g., `2024-07`). The daily log files for that month will be stored inside this folder.

### **File Path**

The path for all files is `docs/retrospective/<YYYY-MM>/<YYYY-MM-DD>.md`.

### **Template**

Each daily file is created from a template that includes sections for work completed, bugs/errors, lessons learned, and additional notes. Your message will be added to the relevant section in Thai language but let technical terms remain in English.

---

## DigDragon Project Resources

**📁 Reference Materials**: The `/docs/digdragon-contracts/` folder contains essential DigDragon project resources for understanding the existing ecosystem:

- **`DigDragonMineV2-kub.sol`**: The current DigDragon mining contract deployed on Bitkub Chain. Contains staking logic, reward distribution, and hash power calculations.
- **`KAP721.sol`**: The DigDragon NFT contract implementation following KAP-721 standard (Bitkub's NFT standard).
- **`StakingContract.sol`**: A general staking contract template with reward mechanisms.
- **`hashstorage.sol`**: Contract for storing and retrieving NFT hash power values.
- **`digdragon.txt`**: Comprehensive documentation of the existing DigDragon frontend project structure, including blockchain integrations, API endpoints, and component architecture.

**Usage**: Always refer to these contracts when developing AutoMine to ensure compatibility with the existing DigDragon ecosystem, especially for NFT interactions and mining mechanics.

---

## Core Code Patterns

### Smart Contract (`AutoMine.sol`)

- **User Functions**: `deposit`, `claimReward`, `withdrawAllNFT`
- **Bot Functions**: `switchMine`
- **Admin Functions**: `emergencyUnstake`, `setMine`, `setFeePercentage`, `setDigDragonContract`

### Frontend

- **UI Theme**: The UI theme is "silk," using the oklch color standard. Refer to `/docs/PRD.md` for the full color palette and UI rules.
- **Wallet Connection**: The primary connection method is Metamask.
- **State Management**: Use `wagmi` and `Viem` for blockchain interactions.
