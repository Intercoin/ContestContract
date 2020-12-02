// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "../ContestETHOnly.sol";

contract ContestETHOnlyFactory {
    
    ContestETHOnly[] public contestETHOnlyAddresses;

    event ContestETHOnlyCreated(ContestETHOnly contestETHOnly);
    
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
    function createContest (
        uint256 stagesCount,
        uint256[] memory stagesMinAmount,
        uint256 contestPeriodInSeconds,
        uint256 votePeriodInSeconds,
        uint256 revokePeriodInSeconds,
        uint256[] memory percentForWinners,
        address[] memory judges
    ) 
        public
    {
        ContestETHOnly contestETHOnly = new ContestETHOnly();
        contestETHOnly.init(stagesCount, stagesMinAmount, contestPeriodInSeconds, votePeriodInSeconds, revokePeriodInSeconds, percentForWinners, judges);
        contestETHOnlyAddresses.push(contestETHOnly);
        emit ContestETHOnlyCreated(contestETHOnly);
        contestETHOnly.transferOwnership(msg.sender);  
    }
    
}