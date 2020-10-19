pragma solidity >=0.6.0 <0.7.0;

import "../ContestETHOnly.sol";

contract ContestETHOnlyMock is ContestETHOnly {
   
    constructor (
        uint256 stagesCount,
        uint256[] memory stagesMinAmount,
        uint256 contestPeriodInSeconds,
        uint256 votePeriodInSeconds,
        uint256 revokePeriodInSeconds,
        uint256[] memory percentForWinners,
        address[] memory judges
    ) 
        ContestETHOnly(stagesCount, stagesMinAmount, contestPeriodInSeconds, votePeriodInSeconds, revokePeriodInSeconds, percentForWinners, judges)
        public
    {
        
    }
    function getRevokeFee() public view returns (uint256) {
        return revokeFee;
    }
    // function test_pledge() public payable {
    //     _pledge(msg.value);
    // }
    function getStageAmount( uint256 stageID) public view returns (uint256) {
        return _contest._stages[stageID].amount;
    }
    function getStageNumber() public view returns (uint256) {
        return _contest.stage;
    }
    function getBalanceAfter( address addr, uint256 stageID) public view returns (uint256) {
        return _contest._stages[stageID].participants[addr].balanceAfter;
    }
    
    function getWeight( address addr, uint256 stageID) public view returns (uint256) {
        return _contest._stages[stageID].participants[addr].weight;
    }
    
    
}


