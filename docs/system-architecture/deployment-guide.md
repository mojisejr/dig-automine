# AutoMine Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the AutoMine system across different environments: development, staging (testnet), and production (mainnet).

## 🚀 Current Phase: 1B.2 Real Testnet Testing

**Status**: Phase A (Deployment & Setup) completed ✅  
**Next**: Execute Phase B (Performance Testing) 🔄

### Quick Start - Phase 1B.2 Testing Execution

```bash
# Execute Phase B: 4-hour Performance Testing
npm run test:performance

# Execute Phase C: 24-hour Reliability Testing
npm run test:24hour

# Monitor real-time status
cat docs/dashboard/current-status.json
```

## Prerequisites

### Development Environment

- Node.js 18+ installed
- Git installed
- Metamask wallet with test funds
- Code editor (VS Code recommended)

### Cloud Services

- AWS Account with Lambda and Secrets Manager access
- Render account for frontend and database hosting
- BitkubChain testnet/mainnet access

### Required Tools

```bash
# Install global dependencies
npm install -g hardhat
npm install -g @aws-cli/cli
npm install -g vercel  # Alternative to Render
```

## Environment Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-org/automine-project.git
cd automine-project

# Install dependencies
npm install

# Install package dependencies
cd packages/contracts && npm install
cd ../bot && npm install
cd ../frontend && npm install
cd ../..
```

### 2. Environment Variables

Create environment files for each package:

#### `packages/contracts/.env`

```env
# Development
HARDHAT_NETWORK=localhost
PRIVATE_KEY=your_development_private_key

# Testnet
BITKUB_TESTNET_RPC=https://rpc-testnet.bitkubchain.io
TESTNET_PRIVATE_KEY=your_testnet_private_key

# Mainnet
BITKUB_MAINNET_RPC=https://rpc.bitkubchain.io
MAINNET_PRIVATE_KEY=your_mainnet_private_key

# Contract Addresses
DIGDRAGON_CONTRACT_TESTNET=0x...
DIGDRAGON_CONTRACT_MAINNET=0x...
```

#### `packages/bot/.env`

```env
# Blockchain Configuration
RPC_URL=https://rpc-testnet.bitkubchain.io
CHAIN_ID=25925
PRIVATE_KEY=your_bot_private_key

# Contract Addresses
AUTOMINE_CONTRACT=0x...
DIGDRAGON_CONTRACT=0x...

# AWS Configuration
AWS_REGION=us-east-1
SECRET_NAME=automine-bot-secrets

# Monitoring
LOG_LEVEL=info
BATCH_SIZE=10
RETRY_ATTEMPTS=3
TIMEOUT_MS=30000
```

#### `packages/frontend/.env.local`

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=25925
NEXT_PUBLIC_RPC_URL=https://rpc-testnet.bitkubchain.io

# Contract Addresses
NEXT_PUBLIC_AUTOMINE_CONTRACT=0x...
NEXT_PUBLIC_DIGDRAGON_CONTRACT=0x...

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Development Deployment

### 1. Local Blockchain Setup

```bash
# Start local Hardhat network
cd packages/contracts
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Deploy mock DigDragon contracts for testing
npx hardhat run scripts/deploy-mocks.js --network localhost
```

### 2. Database Setup

```bash
# Setup local database (using Docker)
docker run --name automine-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=automine \
  -p 5432:5432 \
  -d postgres:15

# Run database migrations
cd packages/frontend
npx prisma migrate dev
npx prisma generate
```

### 3. Start Development Servers

```bash
# Terminal 1: Contracts (Hardhat node)
cd packages/contracts
npx hardhat node

# Terminal 2: Bot development
cd packages/bot
npm run dev

# Terminal 3: Frontend
cd packages/frontend
npm run dev
```

### 4. Development Testing

```bash
# Run contract tests
cd packages/contracts
npm test

# Run bot tests
cd packages/bot
npm test

# Run frontend tests
cd packages/frontend
npm test
```

## Testnet Deployment (Staging)

### 1. Smart Contract Deployment

```bash
cd packages/contracts

# Compile contracts
npx hardhat compile

# Deploy to BitkubChain testnet
npx hardhat run scripts/deploy.js --network bitkub-testnet

# Verify contracts (optional)
npx hardhat verify --network bitkub-testnet DEPLOYED_CONTRACT_ADDRESS

# Update contract addresses in environment files
```

### 2. AWS Lambda Bot Deployment

#### Setup AWS Secrets Manager

```bash
# Create secret for bot private key
aws secretsmanager create-secret \
  --name automine-bot-secrets \
  --description "AutoMine Bot Private Keys" \
  --secret-string '{
    "PRIVATE_KEY": "your_bot_private_key",
    "RPC_URL": "https://rpc-testnet.bitkubchain.io"
  }'
```

#### Deploy Lambda Function

```bash
cd packages/bot

# Build for production
npm run build

# Package for Lambda
npm run package

# Deploy using AWS CLI or Serverless Framework
aws lambda create-function \
  --function-name automine-bot-testnet \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \
  --handler dist/lambda.handler \
  --zip-file fileb://dist/automine-bot.zip \
  --timeout 60 \
  --memory-size 512

# Set environment variables
aws lambda update-function-configuration \
  --function-name automine-bot-testnet \
  --environment Variables='{
    "AWS_REGION": "us-east-1",
    "SECRET_NAME": "automine-bot-secrets",
    "AUTOMINE_CONTRACT": "0x...",
    "LOG_LEVEL": "info"
  }'
```

#### Setup CloudWatch Scheduling

```bash
# Create EventBridge rule for periodic execution
aws events put-rule \
  --name automine-bot-schedule \
  --schedule-expression "rate(5 minutes)" \
  --description "AutoMine bot periodic execution"

# Add Lambda as target
aws events put-targets \
  --rule automine-bot-schedule \
  --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT:function:automine-bot-testnet"

# Grant EventBridge permission to invoke Lambda
aws lambda add-permission \
  --function-name automine-bot-testnet \
  --statement-id automine-bot-schedule \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:REGION:ACCOUNT:rule/automine-bot-schedule
```

### 3. Database Deployment

#### Render Postgres Setup

1. Create Render account and new PostgreSQL database
2. Note the connection string
3. Update `DATABASE_URL` in environment variables

```bash
# Run migrations on production database
cd packages/frontend
DATABASE_URL="your_render_postgres_url" npx prisma migrate deploy
DATABASE_URL="your_render_postgres_url" npx prisma generate
```

### 4. Frontend Deployment

#### Render Static Site Deployment

```bash
cd packages/frontend

# Build for production
npm run build

# Test production build locally
npm start
```

**Render Configuration:**

- Build Command: `npm run build`
- Publish Directory: `.next`
- Environment Variables: Set all `NEXT_PUBLIC_*` variables

#### Alternative: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
cd packages/frontend
vercel --prod
```

### 5. Testnet Validation

```bash
# Run integration tests against testnet
cd packages/contracts
TESTNET=true npm run test:integration

# Test bot functionality
cd packages/bot
ENV=testnet npm run test:integration

# Test frontend against testnet contracts
cd packages/frontend
NEXT_PUBLIC_NETWORK=testnet npm run test:e2e
```

## Production Deployment (Mainnet)

### 1. Pre-deployment Checklist

- [ ] All testnet tests passing
- [ ] Security audit completed
- [ ] Gas optimization verified
- [ ] Monitoring setup configured
- [ ] Rollback procedures documented
- [ ] Team notifications configured

### 2. Smart Contract Mainnet Deployment

```bash
cd packages/contracts

# Final compilation and testing
npx hardhat compile
npm test

# Deploy to BitkubChain mainnet
npx hardhat run scripts/deploy.js --network bitkub-mainnet

# Verify contracts
npx hardhat verify --network bitkub-mainnet DEPLOYED_CONTRACT_ADDRESS

# Update all environment files with mainnet addresses
```

### 3. Production Bot Deployment

```bash
# Update AWS Secrets with mainnet keys
aws secretsmanager update-secret \
  --secret-id automine-bot-secrets \
  --secret-string '{
    "PRIVATE_KEY": "your_mainnet_bot_private_key",
    "RPC_URL": "https://rpc.bitkubchain.io"
  }'

# Deploy production Lambda
cd packages/bot
npm run build
aws lambda update-function-code \
  --function-name automine-bot-production \
  --zip-file fileb://dist/automine-bot.zip

# Update environment variables for mainnet
aws lambda update-function-configuration \
  --function-name automine-bot-production \
  --environment Variables='{
    "AWS_REGION": "us-east-1",
    "SECRET_NAME": "automine-bot-secrets",
    "AUTOMINE_CONTRACT": "0x_mainnet_address",
    "CHAIN_ID": "96",
    "LOG_LEVEL": "warn"
  }'
```

### 4. Production Database Migration

```bash
# Create production database backup
pg_dump $STAGING_DATABASE_URL > staging_backup.sql

# Run migrations on production
DATABASE_URL="$PRODUCTION_DATABASE_URL" npx prisma migrate deploy

# Seed initial data if needed
DATABASE_URL="$PRODUCTION_DATABASE_URL" npx prisma db seed
```

### 5. Production Frontend Deployment

```bash
# Update environment variables for mainnet
cd packages/frontend

# Build with production configuration
NEXT_PUBLIC_CHAIN_ID=96 \
NEXT_PUBLIC_RPC_URL=https://rpc.bitkubchain.io \
NEXT_PUBLIC_AUTOMINE_CONTRACT=0x_mainnet_address \
npm run build

# Deploy to production
vercel --prod
# or update Render deployment
```

## Monitoring and Maintenance

### 1. CloudWatch Monitoring Setup

```bash
# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name AutoMine-Production \
  --dashboard-body file://monitoring/cloudwatch-dashboard.json

# Setup alarms
aws cloudwatch put-metric-alarm \
  --alarm-name "AutoMine-HighErrorRate" \
  --alarm-description "AutoMine bot error rate too high" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=automine-bot-production
```

### 2. Log Monitoring

```bash
# Setup log groups
aws logs create-log-group --log-group-name /aws/lambda/automine-bot-production

# Create log insights queries
aws logs start-query \
  --log-group-name /aws/lambda/automine-bot-production \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/'
```

### 3. Health Checks

```bash
# Create health check script
cat > scripts/health-check.sh << 'EOF'
#!/bin/bash

# Check contract deployment
cast call $AUTOMINE_CONTRACT "getCurrentMine()" --rpc-url $RPC_URL

# Check bot Lambda function
aws lambda invoke \
  --function-name automine-bot-production \
  --payload '{"action": "health"}' \
  response.json

# Check frontend availability
curl -f https://automine.yourdomain.com/api/health

echo "Health check completed"
EOF

chmod +x scripts/health-check.sh
```

## Rollback Procedures

### 1. Smart Contract Rollback

```bash
# Emergency pause contract
cast send $AUTOMINE_CONTRACT "pause()" \
  --private-key $ADMIN_PRIVATE_KEY \
  --rpc-url $RPC_URL

# Emergency unstake all users if needed
cast send $AUTOMINE_CONTRACT "emergencyUnstakeAll()" \
  --private-key $ADMIN_PRIVATE_KEY \
  --rpc-url $RPC_URL
```

### 2. Bot Rollback

```bash
# Disable scheduled execution
aws events disable-rule --name automine-bot-schedule

# Rollback to previous version
aws lambda update-function-code \
  --function-name automine-bot-production \
  --zip-file fileb://backups/automine-bot-previous.zip
```

### 3. Frontend Rollback

```bash
# Vercel rollback
vercel rollback https://automine.yourdomain.com

# Or Render rollback through dashboard
```

### 4. Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backups/production-backup-$(date -d yesterday +%Y%m%d).sql

# Run reverse migrations if needed
npx prisma migrate reset --force
```

## Security Considerations

### 1. Private Key Management

- Use AWS Secrets Manager for all private keys
- Rotate keys regularly
- Use different keys for different environments
- Never commit private keys to version control

### 2. Access Control

- Implement least privilege access
- Use IAM roles for AWS services
- Regular access reviews
- Multi-factor authentication for admin accounts

### 3. Network Security

- Use HTTPS for all communications
- Implement rate limiting
- Monitor for suspicious activities
- Regular security updates

## Troubleshooting

### Common Issues

1. **Contract Deployment Fails**

   - Check gas limits and prices
   - Verify network connectivity
   - Ensure sufficient funds in deployer wallet

2. **Bot Lambda Timeouts**

   - Increase timeout settings
   - Optimize batch sizes
   - Check RPC endpoint performance

3. **Frontend Build Errors**

   - Clear Next.js cache: `rm -rf .next`
   - Check environment variables
   - Verify contract addresses

4. **Database Connection Issues**
   - Check connection string format
   - Verify database credentials
   - Test network connectivity

### Support Contacts

- **Development Team**: dev@automine.com
- **DevOps Team**: devops@automine.com
- **Emergency Contact**: emergency@automine.com

## Maintenance Schedule

### Daily

- Monitor system health
- Check error logs
- Verify bot operations

### Weekly

- Review performance metrics
- Update dependencies
- Backup database

### Monthly

- Security audit
- Performance optimization
- Capacity planning review

### Quarterly

- Disaster recovery testing
- Security key rotation
- Architecture review
