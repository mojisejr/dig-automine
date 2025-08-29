import { expect } from "chai";
import hre from "hardhat";

describe("AutoMine Basic Tests", function () {
  it("Should deploy AutoMine contract", async function () {
    const [owner, feeCollector] = await hre.ethers.getSigners();

    // Deploy mock contracts
    const MockERC721 = await hre.ethers.deployContract("MockERC721", ["DigDragon", "DD"]);
    const MockHashPowerStorage = await hre.ethers.deployContract("MockHashPowerStorage");
    const MockDigDragonMine = await hre.ethers.deployContract("MockDigDragonMine");

    // Deploy AutoMine contract
    const autoMine = await hre.ethers.deployContract("AutoMine", [
      await MockERC721.getAddress(),
      await MockHashPowerStorage.getAddress(),
      await MockDigDragonMine.getAddress(),
      feeCollector.address,
    ]);

    expect(await autoMine.feePercentage()).to.equal(500n);
    expect(await autoMine.feeCollector()).to.equal(feeCollector.address);
  });

  it("Should set admin role correctly", async function () {
    const [owner, feeCollector] = await hre.ethers.getSigners();

    // Deploy mock contracts
    const MockERC721 = await hre.ethers.deployContract("MockERC721", ["DigDragon", "DD"]);
    const MockHashPowerStorage = await hre.ethers.deployContract("MockHashPowerStorage");
    const MockDigDragonMine = await hre.ethers.deployContract("MockDigDragonMine");

    // Deploy AutoMine contract
    const autoMine = await hre.ethers.deployContract("AutoMine", [
      await MockERC721.getAddress(),
      await MockHashPowerStorage.getAddress(),
      await MockDigDragonMine.getAddress(),
      feeCollector.address,
    ]);

    const hasAdminRole = await autoMine.hasRole(await autoMine.DEFAULT_ADMIN_ROLE(), owner.address);
    expect(hasAdminRole).to.be.true;
  });
});