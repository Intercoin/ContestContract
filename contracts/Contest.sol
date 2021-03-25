// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ContestBase.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract Contest is ContestBase {
    address token;
    
    /**
     * @param token_address token address
     * @param stagesCount count of stages for first Contest
     * @param stagesMinAmount array of minimum amount that need to reach at each stage
     * @param contestPeriodInSeconds duration in seconds  for contest period(exclude before reach minimum amount)
     * @param votePeriodInSeconds duration in seconds  for voting period
     * @param revokePeriodInSeconds duration in seconds  for revoking period
     * @param percentForWinners array of values in percentages of overall amount that will gain winners 
     * @param judges array of judges' addresses. if empty than everyone can vote
     * 
     */
    function init(
        address token_address,
        uint256 stagesCount,
        uint256[] memory stagesMinAmount,
        uint256 contestPeriodInSeconds,
        uint256 votePeriodInSeconds,
        uint256 revokePeriodInSeconds,
        uint256[] memory percentForWinners,
        address[] memory judges
    ) 
        public 
        initializer 
    {
        __ContestBase__init(stagesCount, stagesMinAmount, contestPeriodInSeconds, votePeriodInSeconds, revokePeriodInSeconds, percentForWinners, judges);
        token = token_address;
    }
        
    
    receive() external payable {
        require(true == false, "Method does not support.");
    }
    
    
    /**
     * pledge(amount) can be used to send external token into the contract, and issue internal token balance
     * @param amount amount
     * @param stageID Stage number
     */
    function pledge(uint256 amount, uint256 stageID) public virtual override nonReentrant() {
        uint256 _allowedAmount = IERC20Upgradeable(token).allowance(_msgSender(), address(this));
        require(
            (
                (amount <= _allowedAmount) ||
                (_allowedAmount > 0)
            ), 
            "Amount exceeds allowed balance");

        // try to get
        bool success = IERC20Upgradeable(token).transferFrom(_msgSender(), address(this), _allowedAmount);
        require(success == true, "Transfer tokens were failed"); 
        
        _pledge(amount, stageID);
    }
    
    /**
     * @param amount amount
     */
    function revokeAfter(uint256 amount) internal virtual override nonReentrant() {
        // todo: 0 return back to user 
        bool success = IERC20Upgradeable(token).transfer(_msgSender(),amount);
        require(success == true, 'Transfer tokens were failed');    
    }
    
    /**
     * @param amount amount
     */
    function _claimAfter(uint256 amount) internal virtual override nonReentrant() {
        bool success = IERC20Upgradeable(token).transfer(_msgSender(),amount);
        require(success == true, 'Transfer tokens were failed');    
    }
}