// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
interface IDigDragonMine {
    function stake(uint[] calldata _tokenIds) external;
    function unstake(uint[] calldata _tokenIds) external;
    function earnReward() external;
    function pendingReward(address _miner) external view returns (uint);
}

interface IHashPowerStorage {
    function getHashPower(uint256 _tokenId) external view returns (uint256 power);
}

contract AutoMine is ERC721Holder, ReentrancyGuard, AccessControl, Pausable {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant BOT_ROLE = keccak256("BOT_ROLE");

    IERC721 public digDragonContract;
    IHashPowerStorage public hashPowerStorage;
    IDigDragonMine public currentMine;
    IDigDragonMine public targetMine;

    uint256 public feePercentage = 500; // 5% (in basis points)
    uint256 public constant MAX_FEE_PERCENTAGE = 2000; // 20% maximum
    address public feeCollector;

    struct UserInfo {
        uint256[] stakedTokenIds;
        uint256 totalHashPower;
        uint256 lastRewardClaim;
        bool isActive;
    }

    mapping(address => UserInfo) public userInfo;
    mapping(uint256 => address) public tokenOwner;
    
    uint256 public totalStakedTokens;
    uint256 public totalUsers;

    event NFTDeposited(address indexed user, uint256[] tokenIds, uint256 totalHashPower);
    event NFTWithdrawn(address indexed user, uint256[] tokenIds);
    event RewardClaimed(address indexed user, uint256 grossReward, uint256 fee, uint256 netReward);
    event MineSwitch(address indexed from, address indexed to, uint256 totalTokens);
    event EmergencyUnstake(address indexed admin, address indexed user, uint256[] tokenIds);
    event FeePercentageUpdated(uint256 oldFee, uint256 newFee);
    event MineAddressUpdated(address indexed mineType, address indexed oldAddress, address indexed newAddress);

    error InvalidTokenId();
    error NotTokenOwner();
    error TokenNotDeposited();
    error NoTokensDeposited();
    error InvalidFeePercentage();
    error InvalidMineAddress();
    error InsufficientBalance();
    error TransferFailed();

    modifier onlyTokenOwner(uint256[] calldata tokenIds) {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenOwner[tokenIds[i]] != msg.sender) {
                revert NotTokenOwner();
            }
        }
        _;
    }

    modifier hasDepositedTokens() {
        if (userInfo[msg.sender].stakedTokenIds.length == 0) {
            revert NoTokensDeposited();
        }
        _;
    }

    constructor(
        address _digDragonContract,
        address _hashPowerStorage,
        address _currentMine,
        address _feeCollector
    ) {
        if (_digDragonContract == address(0) || 
            _hashPowerStorage == address(0) || 
            _currentMine == address(0) || 
            _feeCollector == address(0)) {
            revert InvalidMineAddress();
        }

        digDragonContract = IERC721(_digDragonContract);
        hashPowerStorage = IHashPowerStorage(_hashPowerStorage);
        currentMine = IDigDragonMine(_currentMine);
        feeCollector = _feeCollector;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function deposit(uint256[] calldata _tokenIds) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        if (_tokenIds.length == 0) {
            revert InvalidTokenId();
        }

        UserInfo storage user = userInfo[msg.sender];
        uint256 totalHashPower = 0;

        for (uint256 i = 0; i < _tokenIds.length; i++) {
            uint256 tokenId = _tokenIds[i];
            
            if (digDragonContract.ownerOf(tokenId) != msg.sender) {
                revert NotTokenOwner();
            }

            digDragonContract.safeTransferFrom(msg.sender, address(this), tokenId);
            
            uint256 hashPower = hashPowerStorage.getHashPower(tokenId);
            user.stakedTokenIds.push(tokenId);
            user.totalHashPower = user.totalHashPower + hashPower;
            tokenOwner[tokenId] = msg.sender;
            totalHashPower = totalHashPower + hashPower;
        }

        if (!user.isActive) {
            user.isActive = true;
            totalUsers = totalUsers + 1;
        }

        totalStakedTokens = totalStakedTokens + _tokenIds.length;

        currentMine.stake(_tokenIds);

        emit NFTDeposited(msg.sender, _tokenIds, totalHashPower);
    }

    function claimReward() 
        external 
        nonReentrant 
        whenNotPaused 
        hasDepositedTokens 
    {
        currentMine.earnReward();
        
        uint256 grossReward = currentMine.pendingReward(address(this));
        
        if (grossReward == 0) return;

        UserInfo storage user = userInfo[msg.sender];
        uint256 userReward = grossReward * user.totalHashPower / _getTotalHashPower();
        
        uint256 fee = userReward * feePercentage / 10000;
        uint256 netReward = userReward - fee;

        user.lastRewardClaim = block.timestamp;

        (bool feeSuccess, ) = payable(feeCollector).call{value: fee}("");
        if (!feeSuccess) revert TransferFailed();

        (bool userSuccess, ) = payable(msg.sender).call{value: netReward}("");
        if (!userSuccess) revert TransferFailed();

        emit RewardClaimed(msg.sender, userReward, fee, netReward);
    }

    function withdrawAllNFT() 
        external 
        nonReentrant 
        whenNotPaused 
        hasDepositedTokens 
    {
        UserInfo storage user = userInfo[msg.sender];
        uint256[] memory tokenIds = user.stakedTokenIds;

        currentMine.unstake(tokenIds);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            digDragonContract.safeTransferFrom(address(this), msg.sender, tokenId);
            delete tokenOwner[tokenId];
        }

        totalStakedTokens = totalStakedTokens - tokenIds.length;
        totalUsers = totalUsers - 1;

        delete userInfo[msg.sender];

        emit NFTWithdrawn(msg.sender, tokenIds);
    }

    function switchMine(address _targetMine) 
        external 
        onlyRole(BOT_ROLE) 
        nonReentrant 
        whenNotPaused 
    {
        if (_targetMine == address(0) || _targetMine == address(currentMine)) {
            revert InvalidMineAddress();
        }

        uint256[] memory allTokenIds = _getAllStakedTokenIds();
        
        if (allTokenIds.length > 0) {
            currentMine.unstake(allTokenIds);
            
            targetMine = IDigDragonMine(_targetMine);
            targetMine.stake(allTokenIds);
            
            address oldMine = address(currentMine);
            currentMine = targetMine;
            
            emit MineSwitch(oldMine, _targetMine, allTokenIds.length);
        }
    }

    function emergencyUnstake(address _user, uint256[] calldata _tokenIds) 
        external 
        onlyRole(ADMIN_ROLE) 
        nonReentrant 
        onlyTokenOwner(_tokenIds)
    {
        currentMine.unstake(_tokenIds);

        for (uint256 i = 0; i < _tokenIds.length; i++) {
            uint256 tokenId = _tokenIds[i];
            digDragonContract.safeTransferFrom(address(this), _user, tokenId);
            delete tokenOwner[tokenId];
        }

        UserInfo storage user = userInfo[_user];
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            _removeTokenFromUser(user, _tokenIds[i]);
        }

        totalStakedTokens = totalStakedTokens - _tokenIds.length;

        emit EmergencyUnstake(msg.sender, _user, _tokenIds);
    }

    function setMine(address _current, address _target) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        if (_current != address(0)) {
            address oldCurrent = address(currentMine);
            currentMine = IDigDragonMine(_current);
            emit MineAddressUpdated(address(0), oldCurrent, _current);
        }
        if (_target != address(0)) {
            address oldTarget = address(targetMine);
            targetMine = IDigDragonMine(_target);
            emit MineAddressUpdated(address(1), oldTarget, _target);
        }
    }

    function setFeePercentage(uint256 _newFee) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        if (_newFee > MAX_FEE_PERCENTAGE) {
            revert InvalidFeePercentage();
        }
        
        uint256 oldFee = feePercentage;
        feePercentage = _newFee;
        
        emit FeePercentageUpdated(oldFee, _newFee);
    }

    function setDigDragonContract(address _nftAddress) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        if (_nftAddress == address(0)) {
            revert InvalidMineAddress();
        }
        
        digDragonContract = IERC721(_nftAddress);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function getUserInfo(address _user) 
        external 
        view 
        returns (uint256[] memory tokenIds, uint256 totalHashPower, uint256 lastRewardClaim, bool isActive) 
    {
        UserInfo memory user = userInfo[_user];
        return (user.stakedTokenIds, user.totalHashPower, user.lastRewardClaim, user.isActive);
    }

    function getContractStats() 
        external 
        view 
        returns (uint256 totalTokens, uint256 activeUsers, address current, address target) 
    {
        return (totalStakedTokens, totalUsers, address(currentMine), address(targetMine));
    }

    function _getAllStakedTokenIds() internal view returns (uint256[] memory) {
        uint256[] memory allTokenIds = new uint256[](totalStakedTokens);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= 10000; i++) {
            if (tokenOwner[i] != address(0)) {
                allTokenIds[index] = i;
                index++;
            }
        }
        
        return allTokenIds;
    }

    function _getTotalHashPower() internal view returns (uint256) {
        uint256 totalHashPower = 0;
        for (uint256 i = 1; i <= 10000; i++) {
            if (tokenOwner[i] != address(0)) {
                totalHashPower = totalHashPower + hashPowerStorage.getHashPower(i);
            }
        }
        return totalHashPower;
    }

    function _removeTokenFromUser(UserInfo storage user, uint256 tokenId) internal {
        for (uint256 i = 0; i < user.stakedTokenIds.length; i++) {
            if (user.stakedTokenIds[i] == tokenId) {
                user.stakedTokenIds[i] = user.stakedTokenIds[user.stakedTokenIds.length - 1];
                user.stakedTokenIds.pop();
                
                uint256 hashPower = hashPowerStorage.getHashPower(tokenId);
                user.totalHashPower = user.totalHashPower - hashPower;
                break;
            }
        }
    }

    receive() external payable {}
}