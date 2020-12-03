// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "../ContestETHOnly.sol";

contract ContestETHOnlyMock is ContestETHOnly {
   
    
    function getRevokeFee() public view returns (uint256) {
        return revokeFee;
    }
   
    function getStageAmount( uint256 stageID) public view returns (uint256) {
        return _contest._stages[stageID].amount;
    }
    
    function getStageNumber() public view returns (uint256) {
        return _contest.stage;
    }
    /*
    function getBalanceAfter( address addr, uint256 stageID) public view returns (uint256) {
        return _contest._stages[stageID].participants[addr].balanceAfter;
    }
    
    function getWeight( address addr, uint256 stageID) public view returns (uint256) {
        return _contest._stages[stageID].participants[addr].weight;
    }
    
    function calculateRevokeFee(uint256 stageID) public view returns (uint256) {
        return _calculateRevokeFee(stageID);
    }
    
    function timePassWhileRevoke(uint256 stageID) public view returns (uint256) {
        uint256 endContestTimestamp = (_contest._stages[stageID].startTimestampUtc).add(_contest._stages[stageID].contestPeriod);
        return now.sub(endContestTimestamp);
    }
    function timeVotePeriod(uint256 stageID) public view returns (uint256) {
        uint256 endContestTimestamp = (_contest._stages[stageID].startTimestampUtc).add(_contest._stages[stageID].contestPeriod);
        uint256 endVoteTimestamp = (_contest._stages[stageID].startTimestampUtc).add(_contest._stages[stageID].contestPeriod).add(_contest._stages[stageID].votePeriod);
        return endVoteTimestamp.sub(endContestTimestamp);
    }
    */
}


