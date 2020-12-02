// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "../Contest.sol";

contract ContestFactory {
    
    Contest[] public contestAddresses;

    event ContestCreated(Contest contest);
    
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
    function createContest (
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
    {
        Contest contest = new Contest();
        contest.init(token_address, stagesCount, stagesMinAmount, contestPeriodInSeconds, votePeriodInSeconds, revokePeriodInSeconds, percentForWinners, judges);
        contestAddresses.push(contest);
        emit ContestCreated(contest);
        contest.transferOwnership(msg.sender);  
    }
    
}