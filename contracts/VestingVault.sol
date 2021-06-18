// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
/*
Original work taken from https://github.com/tapmydata/tap-protocol/blob/main/contracts/VestingVault.sol
Has been amended to use openzepplin OwnableUpgradeable and include cliff in to vesting amount and original 
implement in:
https://gist.github.com/rstormsf/7cfb0c6b7a835c0c67b4a394b4fd9383#file-vesting-sol
*/

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

contract VestingVault is OwnableUpgradeable {
    using SafeMath for uint256;
    using SafeMath for uint16;
    uint256 internal constant SECONDS_PER_DAY = 86400;
    struct Grant {
        uint256 startTime;
        uint256 amount;
        uint16 vestingDuration;
        uint16 vestingCliff;
        uint16 daysClaimed;
        uint256 totalClaimed;
        address recipient;
    }

    event GrantAdded(address indexed recipient);
    event GrantTokensClaimed(address indexed recipient, uint256 amountClaimed);
    event GrantRevoked(address recipient, uint256 amountVested, uint256 amountNotVested);

    ERC20Upgradeable public token;

    mapping(address => Grant) private tokenGrants;

    uint256 public totalVestingCount;

    function initialize(ERC20Upgradeable _token) public initializer {
        require(address(_token) != address(0));
        __Ownable_init();
        token = _token;
    }

    function addTokenGrant(
        address _recipient,
        uint256 _amount,
        uint16 _vestingDurationInDays,
        uint16 _vestingCliffInDays
    ) external onlyOwner {
        require(tokenGrants[_recipient].amount == 0, "Grant already exists, must revoke first.");
        require(_vestingCliffInDays <= 10 * 365, "Cliff greater than 10 years");
        require(_vestingDurationInDays <= 25 * 365, "Duration greater than 25 years");

        uint256 amountVestedPerDay = _amount.div(_vestingDurationInDays);
        require(amountVestedPerDay > 0, "amountVestedPerDay > 0");

        // Transfer the grant tokens under the control of the vesting contract
        require(token.transferFrom(owner(), address(this), _amount));

        Grant memory grant = Grant({
            startTime: currentTime(),
            amount: _amount,
            vestingDuration: _vestingDurationInDays,
            vestingCliff: _vestingCliffInDays,
            daysClaimed: 0,
            totalClaimed: 0,
            recipient: _recipient
        });
        tokenGrants[_recipient] = grant;
        emit GrantAdded(_recipient);
    }

    /// @notice Allows a grant recipient to claim their vested tokens. Errors if no tokens have vested
    function claimVestedTokens() external {
        uint16 daysVested;
        uint256 amountVested;
        (daysVested, amountVested) = calculateGrantClaim(msg.sender);
        require(amountVested > 0, "amountVested is 0");

        Grant storage tokenGrant = tokenGrants[msg.sender];
        tokenGrant.daysClaimed = uint16(tokenGrant.daysClaimed.add(daysVested));
        tokenGrant.totalClaimed = uint256(tokenGrant.totalClaimed.add(amountVested));

        require(token.transfer(tokenGrant.recipient, amountVested), "no tokens");
        emit GrantTokensClaimed(tokenGrant.recipient, amountVested);
    }

    /// @notice Terminate token grant transferring all vested tokens to the `_recipient`
    /// and returning all non-vested tokens to the contract owner
    /// Secured to the contract owner only
    /// @param _recipient address of the token grant recipient
    function revokeTokenGrant(address _recipient) external onlyOwner {
        Grant storage tokenGrant = tokenGrants[_recipient];
        uint16 daysVested;
        uint256 amountVested;
        (daysVested, amountVested) = calculateGrantClaim(_recipient);

        uint256 amountNotVested = (tokenGrant.amount.sub(tokenGrant.totalClaimed)).sub(amountVested);

        require(token.transfer(owner(), amountNotVested));
        require(token.transfer(_recipient, amountVested));

        tokenGrant.startTime = 0;
        tokenGrant.amount = 0;
        tokenGrant.vestingDuration = 0;
        tokenGrant.daysClaimed = 0;
        tokenGrant.totalClaimed = 0;
        tokenGrant.recipient = address(0);

        emit GrantRevoked(_recipient, amountVested, amountNotVested);
    }

    function getGrantStartTime(address _recipient) public view returns (uint256) {
        Grant storage tokenGrant = tokenGrants[_recipient];
        return tokenGrant.startTime;
    }

    function getGrantAmount(address _recipient) public view returns (uint256) {
        Grant storage tokenGrant = tokenGrants[_recipient];
        return tokenGrant.amount;
    }

    /// @notice Calculate the vested and unclaimed months and tokens available for `_grantId` to claim
    /// Due to rounding errors once grant duration is reached, returns the entire left grant amount
    /// Returns (0, 0) if cliff has not been reached
    function calculateGrantClaim(address _recipient) private view returns (uint16, uint256) {
        Grant storage tokenGrant = tokenGrants[_recipient];

        require(tokenGrant.totalClaimed < tokenGrant.amount, "Grant fully claimed");

        // For grants created with a future start date, that hasn't been reached, return 0, 0
        if (currentTime() < tokenGrant.startTime) {
            return (0, 0);
        }

        // Check cliff was reached
        uint256 elapsedTime = currentTime().sub(tokenGrant.startTime);
        uint256 elapsedDays = elapsedTime.div(SECONDS_PER_DAY);

        if (elapsedDays < tokenGrant.vestingCliff) {
            return (uint16(elapsedDays), 0);
        }
        // If over vesting duration, all tokens vested
        if (elapsedDays >= tokenGrant.vestingDuration) {
            uint256 remainingGrant = tokenGrant.amount.sub(tokenGrant.totalClaimed);
            return (tokenGrant.vestingDuration, remainingGrant);
        }

        uint16 daysVested = uint16(elapsedDays.sub(tokenGrant.daysClaimed));
        uint256 amountVestedPerDay = tokenGrant.amount.div(uint256(tokenGrant.vestingDuration));
        uint256 amountVested = uint256(daysVested.mul(amountVestedPerDay));
        return (daysVested, amountVested);
    }

    function currentTime() private view returns (uint256) {
        return block.timestamp;
    }
}
