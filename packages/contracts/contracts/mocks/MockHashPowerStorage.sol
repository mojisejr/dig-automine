// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract MockHashPowerStorage {
    mapping(uint256 => uint256) private hashPowers;

    constructor() {
        // Set default hash power for testing
        for (uint256 i = 1; i <= 10; i++) {
            hashPowers[i] = 100; // Each NFT has 100 hash power
        }
    }

    function getHashPower(uint256 _tokenId) external view returns (uint256) {
        return hashPowers[_tokenId] > 0 ? hashPowers[_tokenId] : 100;
    }

    function setHashPower(uint256 _tokenId, uint256 _power) external {
        hashPowers[_tokenId] = _power;
    }
}