pragma solidity >=0.6.0 <0.7.0;

import "./ContestBase.sol";

contract ContestETHOnly is ContestBase {
    
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
    constructor (
        uint256 stagesCount,
        uint256[] memory stagesMinAmount,
        uint256 contestPeriodInSeconds,
        uint256 votePeriodInSeconds,
        uint256 revokePeriodInSeconds,
        uint256[] memory percentForWinners,
        address[] memory judges
    ) 
        ContestBase(stagesCount, stagesMinAmount, contestPeriodInSeconds, votePeriodInSeconds, revokePeriodInSeconds, percentForWinners, judges)
        public
    {
        
    }
    
    /**
     * Recieved ether and transfer token to sender
     */
    receive() external payable {
        require(true == false, "Method does not support. Send ETH with pledgeETH() method");
    }
    
    function pledgeETH(uint256 amount, uint256 stageID) public payable {
        require (msg.value == amount, "Sent ETH does not equal with amount");
        _pledge(msg.value, stageID);
    }
    
    
    function revokeAfter(uint256 amount) internal virtual override {

        // parameter "revokeFee" have already applied 
        address payable addr1 = payable(_msgSender()); // correct since Solidity >= 0.6.0
        bool success = addr1.send(amount);
        require(success == true, 'Transfer ether was failed'); 
        
    }
    function _claimAfter(uint256 amount) internal virtual override {
        address payable addr1 = payable(_msgSender()); // correct since Solidity >= 0.6.0
        bool success = addr1.send(amount);
        require(success == true, 'Transfer ether was failed'); 
    }
}