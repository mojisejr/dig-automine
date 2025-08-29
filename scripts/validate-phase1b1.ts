import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface ValidationResult {
  phase: string;
  timestamp: string;
  environment: string;
  validationSteps: Array<{
    step: string;
    status: "passed" | "failed" | "skipped";
    details: any;
    duration: number;
  }>;
  overallStatus: "passed" | "failed";
  readyForNextPhase: boolean;
  recommendations: string[];
}

async function main() {
  console.log("🏁 AutoMine Phase 1B.1 Validation");
  console.log("═".repeat(50));

  const validation: ValidationResult = {
    phase: "1B.1 - Bot-Contract Integration Testing",
    timestamp: new Date().toISOString(),
    environment: "testnet",
    validationSteps: [],
    overallStatus: "passed",
    readyForNextPhase: true,
    recommendations: [],
  };

  const contractsDir = path.join(__dirname, "../packages/contracts");
  const botDir = path.join(__dirname, "../packages/bot");

  // Step 1: Contract Compilation
  console.log("\n🔨 Step 1: Contract Compilation");
  const step1Start = Date.now();
  try {
    execSync("pnpm hardhat compile", {
      cwd: contractsDir,
      stdio: "pipe",
    });

    validation.validationSteps.push({
      step: "Contract Compilation",
      status: "passed",
      details: { message: "All contracts compiled successfully" },
      duration: Date.now() - step1Start,
    });
    console.log("✅ Contract compilation successful");
  } catch (error) {
    validation.validationSteps.push({
      step: "Contract Compilation",
      status: "failed",
      details: { error: String(error) },
      duration: Date.now() - step1Start,
    });
    validation.overallStatus = "failed";
    console.log("❌ Contract compilation failed");
  }

  // Step 2: Contract Testing
  console.log("\n🧪 Step 2: Contract Testing");
  const step2Start = Date.now();
  try {
    const testOutput = execSync("pnpm hardhat test", {
      cwd: contractsDir,
      encoding: "utf8",
    });

    validation.validationSteps.push({
      step: "Contract Testing",
      status: "passed",
      details: { testOutput: testOutput.substring(0, 500) },
      duration: Date.now() - step2Start,
    });
    console.log("✅ Contract tests passed");
  } catch (error) {
    validation.validationSteps.push({
      step: "Contract Testing",
      status: "failed",
      details: { error: String(error).substring(0, 500) },
      duration: Date.now() - step2Start,
    });
    validation.overallStatus = "failed";
    validation.readyForNextPhase = false;
    console.log("❌ Contract tests failed");
  }

  // Step 3: Bot Build
  console.log("\n🔧 Step 3: Bot Build");
  const step3Start = Date.now();
  try {
    execSync("pnpm build", {
      cwd: botDir,
      stdio: "pipe",
    });

    validation.validationSteps.push({
      step: "Bot Build",
      status: "passed",
      details: { message: "Bot built successfully" },
      duration: Date.now() - step3Start,
    });
    console.log("✅ Bot build successful");
  } catch (error) {
    validation.validationSteps.push({
      step: "Bot Build",
      status: "failed",
      details: { error: String(error) },
      duration: Date.now() - step3Start,
    });
    validation.overallStatus = "failed";
    validation.readyForNextPhase = false;
    console.log("❌ Bot build failed");
  }

  // Step 4: Check Required Files
  console.log("\n📁 Step 4: Required Files Check");
  const step4Start = Date.now();
  const requiredFiles = [
    "packages/contracts/contracts/AutoMine.sol",
    "packages/contracts/scripts/deploy-testnet.ts",
    "packages/bot/src/services/mine-monitor.ts",
    "packages/bot/src/services/dashboard.ts",
    "packages/bot/src/test-runner.ts",
  ];

  let missingFiles: string[] = [];
  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, "..", file);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length === 0) {
    validation.validationSteps.push({
      step: "Required Files Check",
      status: "passed",
      details: { checkedFiles: requiredFiles.length },
      duration: Date.now() - step4Start,
    });
    console.log("✅ All required files present");
  } else {
    validation.validationSteps.push({
      step: "Required Files Check",
      status: "failed",
      details: { missingFiles },
      duration: Date.now() - step4Start,
    });
    validation.overallStatus = "failed";
    validation.readyForNextPhase = false;
    console.log("❌ Missing files:", missingFiles);
  }

  // Step 5: Documentation Check
  console.log("\n📚 Step 5: Documentation Check");
  const step5Start = Date.now();
  const docFiles = ["docs/current-focus.md", "docs/plan/phase1.md"];

  let missingDocs: string[] = [];
  for (const doc of docFiles) {
    const fullPath = path.join(__dirname, "..", doc);
    if (!fs.existsSync(fullPath)) {
      missingDocs.push(doc);
    }
  }

  if (missingDocs.length === 0) {
    validation.validationSteps.push({
      step: "Documentation Check",
      status: "passed",
      details: { checkedDocs: docFiles.length },
      duration: Date.now() - step5Start,
    });
    console.log("✅ All documentation present");
  } else {
    validation.validationSteps.push({
      step: "Documentation Check",
      status: "failed",
      details: { missingDocs },
      duration: Date.now() - step5Start,
    });
    console.log("⚠️  Missing documentation:", missingDocs);
  }

  // Generate recommendations
  if (validation.overallStatus === "passed") {
    validation.recommendations = [
      "Phase 1B.1 validation completed successfully",
      "Ready to proceed with testnet deployment",
      "Recommend running full integration tests before Phase 1C",
      "Monitor gas optimization during initial testing",
    ];
  } else {
    validation.recommendations = [
      "Fix compilation and testing issues before proceeding",
      "Ensure all required files are present",
      "Complete Phase 1B.1 requirements before moving to Phase 1C",
    ];
  }

  // Save validation report
  const reportsDir = path.join(__dirname, "../docs/reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportFile = path.join(
    reportsDir,
    `phase1b1-validation-${Date.now()}.json`
  );
  fs.writeFileSync(reportFile, JSON.stringify(validation, null, 2));

  // Generate summary
  console.log("\n🏁 Validation Summary");
  console.log("═".repeat(30));
  console.log(`📊 Total Steps: ${validation.validationSteps.length}`);
  console.log(
    `✅ Passed: ${
      validation.validationSteps.filter((s) => s.status === "passed").length
    }`
  );
  console.log(
    `❌ Failed: ${
      validation.validationSteps.filter((s) => s.status === "failed").length
    }`
  );
  console.log(
    `⏭️  Skipped: ${
      validation.validationSteps.filter((s) => s.status === "skipped").length
    }`
  );
  console.log(`🎯 Overall Status: ${validation.overallStatus.toUpperCase()}`);
  console.log(
    `🚀 Ready for Phase 1C: ${validation.readyForNextPhase ? "YES" : "NO"}`
  );

  console.log("\n💡 Recommendations:");
  validation.recommendations.forEach((rec) => console.log(`   • ${rec}`));

  console.log(`\n📄 Full report saved to: ${reportFile}`);

  if (validation.overallStatus === "failed") {
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Validation script failed:", error);
    process.exit(1);
  });
