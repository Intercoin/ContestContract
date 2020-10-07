pragma solidity >=0.6.0 <0.7.0;

import "../ContestETHOnly.sol";

contract ContestETHOnlyMock is ContestETHOnly {
   
    function getRevokeFee() public view returns (uint256) {
        return revokeFee;
    }
    // function test_pledge() public payable {
    //     _pledge(msg.value);
    // }
    function getStageAmount( uint256 stageID, uint256 contestID) public view returns (uint256) {
        return _contests[contestID]._stages[stageID].amount;
    }
    function getStageNumber(uint256 contestID) public view returns (uint256) {
        return _contests[contestID].stage;
    }
    function getBalanceAfter( address addr, uint256 stageID, uint256 contestID) public view returns (uint256) {
        return _contests[contestID]._stages[stageID].participants[addr].balanceAfter;
    }
    
    function getWeight( address addr, uint256 stageID, uint256 contestID) public view returns (uint256) {
        return _contests[contestID]._stages[stageID].participants[addr].weight;
    }
    
    
}


