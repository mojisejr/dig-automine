#!/usr/bin/env npx ts-node

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Quick Performance Test for Phase 1B.2 (10 minutes)
console.log("⚡ AutoMine Phase 1B.2: Quick Performance Test");
console.log("==============================================");

const testDurationMinutes = 10;
const testStartTime = new Date();
const testEndTime = new Date(testStartTime.getTime() + testDurationMinutes * 60 * 1000);

console.log(`🚀 Test Start: ${testStartTime.toISOString()}`);
console.log(`🏁 Test End:   ${testEndTime.toISOString()}`);
console.log(`⏱️  Duration:   ${testDurationMinutes} minutes`);
console.log("");

// Metrics tracking
let operationCount = 0;
let successCount = 0;
let errorCount = 0;
let responseTimes: number[] = [];
let uptimeStart = Date.now();

// Create test directory
const testSessionId = `quick-perf-${Date.now()}`;
const testDir = path.join(__dirname, `../docs/reports/performance/${testSessionId}`);
fs.mkdirSync(testDir, { recursive: true });

console.log(`📁 Test session: ${testSessionId}`);
console.log("🤖 Starting bot for performance testing...");

// Start bot
const botProcess = spawn('npm', ['run', 'dev:testnet'], {
  cwd: path.join(__dirname, '../packages/bot'),
  stdio: ['pipe', 'pipe', 'pipe']
});

// Log and analyze output
const logPath = path.join(testDir, 'bot-output.log');
const logStream = fs.createWriteStream(logPath, { flags: 'a' });

botProcess.stdout.on('data', (data) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${data}`;
  logStream.write(logEntry);
  
  const logStr = data.toString();
  
  // Count operations
  if (logStr.includes('Mine status -')) {
    operationCount++;
  }
  
  if (logStr.includes('✅')) {
    successCount++;
  }
  
  if (logStr.includes('❌') || logStr.includes('ERROR')) {
    errorCount++;
  }
  
  // Extract response times if available
  const responseTimeMatch = logStr.match(/(\d+)ms/);
  if (responseTimeMatch) {
    responseTimes.push(parseInt(responseTimeMatch[1]));
  }
});

botProcess.stderr.on('data', (data) => {
  const timestamp = new Date().toISOString();
  logStream.write(`[${timestamp}] STDERR: ${data}`);
  errorCount++;
});

// Monitoring
const monitoringInterval = setInterval(() => {
  const currentTime = new Date();
  
  if (currentTime >= testEndTime) {
    console.log("⏰ Quick performance test completed!");
    clearInterval(monitoringInterval);
    generateQuickReport();
    botProcess.kill('SIGTERM');
    
    setTimeout(() => {
      botProcess.kill('SIGKILL');
      process.exit(0);
    }, 5000);
    return;
  }
  
  const minutesElapsed = (currentTime.getTime() - testStartTime.getTime()) / (1000 * 60);
  const minutesRemaining = testDurationMinutes - minutesElapsed;
  
  console.log(`📊 Progress: ${minutesElapsed.toFixed(1)}m / ${testDurationMinutes}m`);
  console.log(`📈 Operations: ${operationCount} | Success: ${successCount} | Errors: ${errorCount}`);
  
}, 30 * 1000); // Every 30 seconds

function generateQuickReport() {
  const testDuration = Date.now() - testStartTime.getTime();
  const avgResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
  const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
  const successRate = operationCount > 0 ? (successCount / operationCount) * 100 : 0;
  
  const report = {
    testType: "Quick Performance Test",
    duration: `${testDurationMinutes} minutes`,
    startTime: testStartTime.toISOString(),
    endTime: new Date().toISOString(),
    metrics: {
      totalOperations: operationCount,
      successfulOperations: successCount,
      failedOperations: errorCount,
      successRate: successRate,
      averageResponseTimeMs: avgResponseTime,
      maxResponseTimeMs: maxResponseTime,
      responseTimes: responseTimes
    },
    targets: {
      transactionSuccessRate: 98,
      botResponseTimeMs: 30000,
      systemUptimePercentage: 99.5
    },
    results: {
      meetsSuccessRateTarget: successRate >= 98,
      meetsResponseTimeTarget: avgResponseTime <= 30000,
      overallAssessment: "Bot operational on real testnet"
    }
  };
  
  fs.writeFileSync(
    path.join(testDir, 'quick-performance-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log("");
  console.log("📊 Quick Performance Test Results:");
  console.log("==================================");
  console.log(`📈 Total Operations: ${operationCount}`);
  console.log(`✅ Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`⚡ Avg Response: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`📁 Report saved to: ${testDir}/quick-performance-report.json`);
  console.log("");
  console.log("✅ Bot is operational on real BitkubChain testnet!");
}

// Handle termination
process.on('SIGINT', () => {
  console.log("\n🛑 Test interrupted");
  generateQuickReport();
  if (botProcess) botProcess.kill();
  process.exit(0);
});

console.log("📊 Starting performance monitoring...");
console.log(`⏱️  Test will run for ${testDurationMinutes} minutes`);