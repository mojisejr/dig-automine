#!/usr/bin/env npx ts-node

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// 24-Hour Real Testnet Testing Script for Phase 1B.2
console.log("🕐 AutoMine Phase 1B.2: 24-Hour Real Testnet Testing");
console.log("==================================================");

const testStartTime = new Date();
const testEndTime = new Date(testStartTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours

console.log(`🚀 Test Start: ${testStartTime.toISOString()}`);
console.log(`🏁 Test End:   ${testEndTime.toISOString()}`);
console.log("");

// Create test session directory
const testSessionId = `phase1b2-24h-${Date.now()}`;
const testDir = path.join(__dirname, `../docs/reports/24hour-testing/${testSessionId}`);
fs.mkdirSync(testDir, { recursive: true });

console.log(`📁 Test session: ${testSessionId}`);
console.log(`📁 Results will be saved to: ${testDir}`);
console.log("");

// Test configuration
const testConfig = {
  sessionId: testSessionId,
  startTime: testStartTime.toISOString(),
  endTime: testEndTime.toISOString(),
  testDurationHours: 24,
  monitoringIntervalSeconds: 30,
  reportingIntervalMinutes: 60,
  targets: {
    transactionSuccessRate: 98, // >98%
    botResponseTimeSeconds: 30, // <30s
    systemUptimePercentage: 99.5 // >99.5%
  },
  metrics: {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    averageResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: 0,
    uptimeSeconds: 0,
    downtimeSeconds: 0,
    errors: []
  }
};

// Save initial test config
fs.writeFileSync(
  path.join(testDir, 'test-config.json'),
  JSON.stringify(testConfig, null, 2)
);

console.log("🤖 Starting bot for 24-hour testing...");

// Start the bot process
const botProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../packages/bot'),
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'testing' }
});

// Log bot output
const botLogPath = path.join(testDir, 'bot-output.log');
const logStream = fs.createWriteStream(botLogPath, { flags: 'a' });

botProcess.stdout.on('data', (data) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] STDOUT: ${data}`;
  logStream.write(logEntry);
  process.stdout.write(data);
});

botProcess.stderr.on('data', (data) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] STDERR: ${data}`;
  logStream.write(logEntry);
  process.stderr.write(data);
});

// Monitoring function
function monitorBotHealth() {
  const healthCheckInterval = setInterval(() => {
    const currentTime = new Date();
    
    // Check if test period is over
    if (currentTime >= testEndTime) {
      console.log("⏰ 24-hour test period completed!");
      clearInterval(healthCheckInterval);
      generateFinalReport();
      process.exit(0);
    }
    
    // Log test progress
    const hoursElapsed = (currentTime.getTime() - testStartTime.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = 24 - hoursElapsed;
    
    console.log(`📊 Test Progress: ${hoursElapsed.toFixed(1)}h elapsed, ${hoursRemaining.toFixed(1)}h remaining`);
    
    // Try to read dashboard data
    try {
      const dashboardPath = path.join(__dirname, '../docs/dashboard/current-status.json');
      if (fs.existsSync(dashboardPath)) {
        const dashboard = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
        console.log(`🤖 Bot Status: ${dashboard.status || 'unknown'}`);
        console.log(`📈 Operations: ${dashboard.operationCount || 0}`);
      }
    } catch (error) {
      console.log("⚠️  Could not read dashboard data");
    }
    
  }, 60 * 1000); // Check every minute
}

function generateFinalReport() {
  console.log("📋 Generating final 24-hour test report...");
  
  const finalReport = {
    ...testConfig,
    completedAt: new Date().toISOString(),
    actualDuration: (new Date().getTime() - testStartTime.getTime()) / (1000 * 60 * 60),
    conclusion: "24-hour real testnet testing completed",
    nextSteps: [
      "Review logs for any errors or issues",
      "Analyze performance metrics against targets", 
      "Document any optimizations needed",
      "Proceed to frontend development (Phase 1C)"
    ]
  };
  
  fs.writeFileSync(
    path.join(testDir, 'final-report.json'),
    JSON.stringify(finalReport, null, 2)
  );
  
  console.log("✅ Final report saved");
  console.log(`📁 Full results available in: ${testDir}`);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log("\n🛑 Test interrupted by user");
  if (botProcess) {
    botProcess.kill();
  }
  generateFinalReport();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log("\n🛑 Test terminated");
  if (botProcess) {
    botProcess.kill();
  }
  generateFinalReport();
  process.exit(0);
});

botProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Bot process exited with code ${code}`);
  }
  clearInterval;
  generateFinalReport();
  process.exit(code || 0);
});

// Start monitoring
console.log("📊 Starting 24-hour monitoring...");
monitorBotHealth();