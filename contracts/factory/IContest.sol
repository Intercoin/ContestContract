// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

interface IContest {
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
        uint256[] calldata stagesMinAmount,
        uint256 contestPeriodInSeconds,
        uint256 votePeriodInSeconds,
        uint256 revokePeriodInSeconds,
        uint256[] calldata percentForWinners,
        address[] calldata judges
    ) external;

    function transferOwnership(address newOwner) external;
}
