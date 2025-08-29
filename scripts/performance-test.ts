#!/usr/bin/env npx ts-node

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Performance Testing Script for Phase 1B.2
console.log("⚡ AutoMine Phase 1B.2: Performance Testing");
console.log("==========================================");

interface PerformanceMetrics {
  testStartTime: string;
  testEndTime?: string;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTimeMs: number;
  maxResponseTimeMs: number;
  minResponseTimeMs: number;
  transactionSuccessRate: number;
  systemUptimePercentage: number;
  gasUsageStats: {
    totalGasUsed: string;
    averageGasPerTransaction: string;
    maxGasUsed: string;
    minGasUsed: string;
  };
  networkStats: {
    averageConfirmationTimeMs: number;
    maxConfirmationTimeMs: number;
    minConfirmationTimeMs: number;
  };
  targets: {
    transactionSuccessRate: number; // >98%
    botResponseTimeMs: number; // <30000ms
    systemUptimePercentage: number; // >99.5%
  };
  results: {
    meetsSuccessRateTarget: boolean;
    meetsResponseTimeTarget: boolean;
    meetsUptimeTarget: boolean;
    overallPassed: boolean;
  };
}

const testDurationHours = 4; // 4-hour intensive test
const testStartTime = new Date();
const testEndTime = new Date(testStartTime.getTime() + testDurationHours * 60 * 60 * 1000);

console.log(`🚀 Test Start: ${testStartTime.toISOString()}`);
console.log(`🏁 Test End:   ${testEndTime.toISOString()}`);
console.log(`⏱️  Duration:   ${testDurationHours} hours`);
console.log("");

// Initialize metrics
const metrics: PerformanceMetrics = {
  testStartTime: testStartTime.toISOString(),
  totalOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,
  averageResponseTimeMs: 0,
  maxResponseTimeMs: 0,
  minResponseTimeMs: Number.MAX_VALUE,
  transactionSuccessRate: 0,
  systemUptimePercentage: 0,
  gasUsageStats: {
    totalGasUsed: "0",
    averageGasPerTransaction: "0", 
    maxGasUsed: "0",
    minGasUsed: "0"
  },
  networkStats: {
    averageConfirmationTimeMs: 0,
    maxConfirmationTimeMs: 0,
    minConfirmationTimeMs: Number.MAX_VALUE
  },
  targets: {
    transactionSuccessRate: 98,
    botResponseTimeMs: 30000,
    systemUptimePercentage: 99.5
  },
  results: {
    meetsSuccessRateTarget: false,
    meetsResponseTimeTarget: false, 
    meetsUptimeTarget: false,
    overallPassed: false
  }
};

// Create test session directory
const testSessionId = `performance-test-${Date.now()}`;
const testDir = path.join(__dirname, `../docs/reports/performance/${testSessionId}`);
fs.mkdirSync(testDir, { recursive: true });

console.log(`📁 Test session: ${testSessionId}`);
console.log(`📁 Results will be saved to: ${testDir}`);
console.log("");

// Save initial metrics
fs.writeFileSync(
  path.join(testDir, 'metrics-initial.json'),
  JSON.stringify(metrics, null, 2)
);

console.log("🤖 Starting bot for performance testing...");

// Start bot in testnet mode
const botProcess = spawn('npm', ['run', 'dev:testnet'], {
  cwd: path.join(__dirname, '../packages/bot'),
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'performance-testing' }
});

// Performance monitoring
let operationCount = 0;
let successCount = 0;
let errorCount = 0;
let totalResponseTime = 0;
let maxResponseTime = 0;
let minResponseTime = Number.MAX_VALUE;
let uptimeStart = Date.now();
let totalDowntime = 0;

// Monitor bot output for performance metrics
const performanceLogPath = path.join(testDir, 'performance-log.txt');
const logStream = fs.createWriteStream(performanceLogPath, { flags: 'a' });

botProcess.stdout.on('data', (data) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${data}`;
  logStream.write(logEntry);
  
  // Parse performance data from bot logs
  const logStr = data.toString();
  if (logStr.includes('✅ Mine switch completed')) {
    successCount++;
    operationCount++;
  } else if (logStr.includes('❌') || logStr.includes('ERROR')) {
    errorCount++;
    operationCount++;
  }
  
  // Look for response time data
  const responseTimeMatch = logStr.match(/Response time: (\d+)ms/);
  if (responseTimeMatch) {
    const responseTime = parseInt(responseTimeMatch[1]);
    totalResponseTime += responseTime;
    maxResponseTime = Math.max(maxResponseTime, responseTime);
    minResponseTime = Math.min(minResponseTime, responseTime);
  }
});

botProcess.stderr.on('data', (data) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] STDERR: ${data}`;
  logStream.write(logEntry);
  errorCount++;
});

// Monitoring loop
const monitoringInterval = setInterval(() => {
  const currentTime = new Date();
  
  // Check if test is complete
  if (currentTime >= testEndTime) {
    console.log("⏰ Performance test completed!");
    clearInterval(monitoringInterval);
    generatePerformanceReport();
    botProcess.kill();
    process.exit(0);
  }
  
  // Update metrics
  const hoursElapsed = (currentTime.getTime() - testStartTime.getTime()) / (1000 * 60 * 60);
  const hoursRemaining = testDurationHours - hoursElapsed;
  
  console.log(`📊 Performance Test Progress: ${hoursElapsed.toFixed(1)}h / ${testDurationHours}h`);
  console.log(`📈 Operations: ${operationCount} (Success: ${successCount}, Errors: ${errorCount})`);
  
  if (operationCount > 0) {
    const successRate = (successCount / operationCount) * 100;
    const avgResponseTime = operationCount > 0 ? totalResponseTime / operationCount : 0;
    console.log(`📊 Success Rate: ${successRate.toFixed(1)}% | Avg Response: ${avgResponseTime.toFixed(0)}ms`);
  }
  
  // Save intermediate metrics
  updateMetrics();
  
}, 60 * 1000); // Every minute

function updateMetrics() {
  metrics.totalOperations = operationCount;
  metrics.successfulOperations = successCount;
  metrics.failedOperations = errorCount;
  metrics.transactionSuccessRate = operationCount > 0 ? (successCount / operationCount) * 100 : 0;
  metrics.averageResponseTimeMs = operationCount > 0 ? totalResponseTime / operationCount : 0;
  metrics.maxResponseTimeMs = maxResponseTime;
  metrics.minResponseTimeMs = minResponseTime === Number.MAX_VALUE ? 0 : minResponseTime;
  
  // Save current metrics
  fs.writeFileSync(
    path.join(testDir, 'metrics-current.json'),
    JSON.stringify(metrics, null, 2)
  );
}

function generatePerformanceReport() {
  console.log("📋 Generating performance report...");
  
  // Final metrics calculation
  updateMetrics();
  metrics.testEndTime = new Date().toISOString();
  
  // Check against targets
  metrics.results.meetsSuccessRateTarget = metrics.transactionSuccessRate >= metrics.targets.transactionSuccessRate;
  metrics.results.meetsResponseTimeTarget = metrics.averageResponseTimeMs <= metrics.targets.botResponseTimeMs;
  metrics.results.meetsUptimeTarget = metrics.systemUptimePercentage >= metrics.targets.systemUptimePercentage;
  metrics.results.overallPassed = 
    metrics.results.meetsSuccessRateTarget &&
    metrics.results.meetsResponseTimeTarget &&
    metrics.results.meetsUptimeTarget;
  
  // Save final report
  fs.writeFileSync(
    path.join(testDir, 'performance-report-final.json'),
    JSON.stringify(metrics, null, 2)
  );
  
  // Generate summary
  console.log("");
  console.log("📊 Performance Test Results:");
  console.log("============================");
  console.log(`📈 Total Operations: ${metrics.totalOperations}`);
  console.log(`✅ Success Rate: ${metrics.transactionSuccessRate.toFixed(1)}% (Target: ${metrics.targets.transactionSuccessRate}%)`);
  console.log(`⚡ Avg Response Time: ${metrics.averageResponseTimeMs.toFixed(0)}ms (Target: <${metrics.targets.botResponseTimeMs}ms)`);
  console.log(`🎯 Overall Result: ${metrics.results.overallPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log("");
  console.log(`📁 Full report saved to: ${testDir}`);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log("\n🛑 Performance test interrupted");
  generatePerformanceReport();
  if (botProcess) botProcess.kill();
  process.exit(0);
});

console.log("📊 Starting performance monitoring...");
console.log(`⏱️  Test will run for ${testDurationHours} hours`);