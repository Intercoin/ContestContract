// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Contest.sol";
import "./ContestETHOnly.sol";

contract ContestFactory is Ownable {
    using Clones for address;

    Contest public immutable contestImplementation;
    ContestETHOnly public immutable contestETHOnlyImplementation;

    address[] public instances;
    
    event InstanceCreated(address instance, uint instancesCount);

    constructor() {
        contestImplementation = new Contest();
        contestETHOnlyImplementation = new ContestETHOnly();
    }

    ////////////////////////////////////////////////////////////////////////
    // external section ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
    * @dev view amount of created instances
    * @return amount amount instances
    * @custom:shortd view amount of created instances
    */
    function instancesCount()
        external 
        view 
        returns (uint256 amount) 
    {
        amount = instances.length;
    }

    ////////////////////////////////////////////////////////////////////////
    // public section //////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    
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
    function produce(
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
        returns (address instance) 
    {
        instance = address(contestImplementation).clone();
        _produce(instance);
        Contest(payable(instance)).init(token_address, stagesCount, stagesMinAmount, contestPeriodInSeconds, votePeriodInSeconds, revokePeriodInSeconds, percentForWinners, judges);
        Ownable(instance).transferOwnership(msg.sender);
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
    function produceETHOnly(
        uint256 stagesCount,
        uint256[] memory stagesMinAmount,
        uint256 contestPeriodInSeconds,
        uint256 votePeriodInSeconds,
        uint256 revokePeriodInSeconds,
        uint256[] memory percentForWinners,
        address[] memory judges
    ) 
        public 
        returns (address instance) 
    {
        instance = address(contestETHOnlyImplementation).clone();
        _produce(instance);
        ContestETHOnly(payable(instance)).init(stagesCount, stagesMinAmount, contestPeriodInSeconds, votePeriodInSeconds, revokePeriodInSeconds, percentForWinners, judges);
        Ownable(instance).transferOwnership(msg.sender);
    }

    ////////////////////////////////////////////////////////////////////////
    // internal section ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    function _produce(
        address instance
    ) 
        internal
    {
        require(instance != address(0), "Factory: INSTANCE_CREATION_FAILED");

        instances.push(instance);
        
        emit InstanceCreated(instance, instances.length);
    }

}