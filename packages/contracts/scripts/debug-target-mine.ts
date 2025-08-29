import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Debugging target mine configuration...");
  
  const [deployer] = await ethers.getSigners();
  const AutoMine = await ethers.getContractFactory("AutoMine");
  const automine = AutoMine.attach("0x9cf4C3F902dd56A94AeBd09526325F63f8BF7eDd");
  
  console.log("👤 Deployer address:", deployer.address);
  
  // Check admin role
  const ADMIN_ROLE = await automine.ADMIN_ROLE();
  const hasAdminRole = await automine.hasRole(ADMIN_ROLE, deployer.address);
  console.log("🔐 Has ADMIN_ROLE:", hasAdminRole);
  
  // Check current state
  const stats = await automine.getContractStats();
  console.log("📊 Current state:", {
    currentMine: stats[2],
    targetMine: stats[3]
  });
  
  if (hasAdminRole) {
    console.log("🔧 Setting target mine...");
    
    try {
      const tx = await automine.setMine(
        "0x0000000000000000000000000000000000000000", // Don't change current
        "0x0a32B6924785D443D2D7f2B7Cf42b4C8694F1Ebf"  // Set target
      );
      
      await tx.wait();
      console.log("✅ Transaction confirmed:", tx.hash);
      
      const newStats = await automine.getContractStats();
      console.log("📊 New state:", {
        currentMine: newStats[2],
        targetMine: newStats[3]
      });
      
    } catch (error) {
      console.error("❌ Failed to set target mine:", error);
    }
  } else {
    console.log("❌ No admin permissions to set target mine");
  }
}

main().catch(console.error);