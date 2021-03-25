// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ContestBase.sol";

contract ContestETHOnly is ContestBase {
    
    /**
     * Recieved ether and transfer token to sender
     */
    receive() external payable {
        require(true == false, "Method does not support. Send ETH with pledgeETH() method");
    }
    
    /**
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
        __ContestBase__init(
            stagesCount,
            stagesMinAmount,
            contestPeriodInSeconds,
            votePeriodInSeconds,
            revokePeriodInSeconds,
            percentForWinners,
            judges
        );
    }
    
    /**
     * pledge(amount) can be used to send external token into the contract, and issue internal token balance
     * @param amount amount
     * @param stageID Stage number
     */
    function pledgeETH(uint256 amount, uint256 stageID) public payable nonReentrant() {
        require (msg.value == amount, "Sent ETH does not equal with amount");
        _pledge(msg.value, stageID);
    }
    
    /**
     * @param amount amount
     */
    function revokeAfter(uint256 amount) internal virtual override nonReentrant() {
        // parameter "revokeFee" have already applied 
        address payable addr1 = payable(_msgSender()); // correct since Solidity >= 0.6.0
        bool success = addr1.send(amount);
        require(success == true, 'Transfer ether was failed'); 
    }
    
    /**
     * @param amount amount
     */
    function _claimAfter(uint256 amount) internal virtual override nonReentrant() {
        address payable addr1 = payable(_msgSender()); // correct since Solidity >= 0.6.0
        bool success = addr1.send(amount);
        require(success == true, 'Transfer ether was failed'); 
    }
}