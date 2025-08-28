// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MockDigDragonMine is ERC721Holder {
    uint256 private pendingRewardAmount;
    mapping(address => uint256[]) public stakedTokens;
    
    event Staked(address indexed user, uint256[] tokenIds);
    event Unstaked(address indexed user, uint256[] tokenIds);
    event RewardEarned(address indexed user, uint256 amount);

    function stake(uint[] calldata _tokenIds) external {
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            stakedTokens[msg.sender].push(_tokenIds[i]);
        }
        emit Staked(msg.sender, _tokenIds);
    }

    function unstake(uint[] calldata _tokenIds) external {
        // Simple implementation - remove from array
        uint256[] storage userTokens = stakedTokens[msg.sender];
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            for (uint256 j = 0; j < userTokens.length; j++) {
                if (userTokens[j] == _tokenIds[i]) {
                    userTokens[j] = userTokens[userTokens.length - 1];
                    userTokens.pop();
                    break;
                }
            }
        }
        emit Unstaked(msg.sender, _tokenIds);
    }

    function earnReward() external {
        emit RewardEarned(msg.sender, pendingRewardAmount);
    }

    function pendingReward(address) external view returns (uint256) {
        return pendingRewardAmount;
    }

    function setReward(uint256 _amount) external {
        pendingRewardAmount = _amount;
    }

    function getStakedTokens(address _user) external view returns (uint256[] memory) {
        return stakedTokens[_user];
    }

    receive() external payable {}
}