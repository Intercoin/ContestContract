// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
   
}


