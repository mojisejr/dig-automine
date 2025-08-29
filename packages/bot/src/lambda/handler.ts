import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { getBotConfig } from '../utils/config';
import { logger, setLogLevel } from '../utils/logger';
import { Web3Service } from '../services/web3';
import { ContractService } from '../services/contract';
import { MonitorService } from '../services/monitor';

export const mineSwitchHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  try {
    logger.info('Lambda function started', 'LAMBDA_START');
    
    const config = getBotConfig();
    setLogLevel(config.logLevel);
    
    const web3Service = new Web3Service(config);
    const contractService = new ContractService(web3Service, config);
    const monitorService = new MonitorService(web3Service, contractService, config);
    
    const hasRole = await contractService.verifyBotRole();
    if (!hasRole) {
      throw new Error('Bot does not have required role in AutoMine contract');
    }
    
    const depositedTokens = await contractService.getDepositedTokens();
    
    if (depositedTokens.users.length === 0) {
      logger.info('No users with deposited NFTs found', 'LAMBDA_EXECUTION');
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No users with deposited NFTs',
          executionTime: Date.now() - startTime
        })
      };
    }
    
    const currentMine = await contractService.getCurrentMine();
    const targetMine = getTargetMine(currentMine, config) as `0x${string}`;
    
    if (currentMine.toLowerCase() === targetMine.toLowerCase()) {
      logger.info('Already in target mine', 'LAMBDA_EXECUTION');
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Already in target mine',
          executionTime: Date.now() - startTime
        })
      };
    }
    
    logger.info(`Switching mine from ${currentMine} to ${targetMine}`, 'LAMBDA_EXECUTION');
    
    const operation = await contractService.switchMine(targetMine);
    await monitorService.recordOperation(operation);
    
    const response = {
      success: operation.status === 'completed',
      operation: {
        id: operation.id,
        status: operation.status,
        transactionHash: operation.transactionHash,
        targetMine: operation.targetMine
      },
      userCount: depositedTokens.users.length,
      executionTime: Date.now() - startTime
    };
    
    logger.info(`Lambda execution completed: ${operation.status}`, 'LAMBDA_COMPLETE');
    
    return {
      statusCode: operation.status === 'completed' ? 200 : 500,
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    logger.error('Lambda execution failed', error, 'LAMBDA_ERROR');
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      })
    };
  }
};

export const statusHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const config = getBotConfig();
    const web3Service = new Web3Service(config);
    const contractService = new ContractService(web3Service, config);
    const monitorService = new MonitorService(web3Service, contractService, config);
    
    const status = await monitorService.getSystemStatus();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        status,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    logger.error('Status check failed', error, 'STATUS_CHECK');
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

function getTargetMine(currentMine: string, config: any): `0x${string}` {
  if (config.targetMineAddress && config.currentMineAddress) {
    return currentMine.toLowerCase() === config.currentMineAddress.toLowerCase()
      ? config.targetMineAddress
      : config.currentMineAddress;
  }
  
  throw new Error('Target mine addresses not configured');
}