import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Fixing target mine configuration...");
  
  const AutoMine = await ethers.getContractFactory("AutoMine");
  const automine = AutoMine.attach("0x9cf4C3F902dd56A94AeBd09526325F63f8BF7eDd");
  
  await automine.setMine(
    "0x1B48a622d4f190b9060462020320d4cA8C588899", // current mine
    "0x0a32B6924785D443D2D7f2B7Cf42b4C8694F1Ebf"  // target mine
  );
  
  console.log("✅ Target mine configured");
  
  const stats = await automine.getContractStats();
  console.log("📊 Updated stats:", {
    currentMine: stats[2],
    targetMine: stats[3]
  });
}

main().catch(console.error);