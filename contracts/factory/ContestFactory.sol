// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "../Contest.sol";

import "./IContestFactory.sol";
import "./IIntercoin.sol";
import "./IContest.sol";

contract ContestFactory is OwnableUpgradeSafe {
    
    address private contractAddr;
    event Produced(address addr);
    
    function init(address contractToClone) public initializer {
        contractAddr = contractToClone;
        __Ownable_init();
    }

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
    function produce (
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
        returns (address)
    {
        IContest proxy = IContest(createClone(address(contractAddr)));
        
        proxy.init(
            token_address,
            stagesCount,
            stagesMinAmount,
            contestPeriodInSeconds,
            votePeriodInSeconds,
            revokePeriodInSeconds,
            percentForWinners,
            judges
        );
        
        // setIntercoinAddr must be before transferOwnership
        proxy.setIntercoinAddr(owner());
        
        proxy.transferOwnership(msg.sender);
        emit Produced(address(proxy));
        
        bool success =  IIntercoin(owner()).registerInstance(address(proxy));
        require(success == true, 'Can not register intstance');
        
        return address(proxy);
        
    }
    
    
    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            result := create(0, clone, 0x37)
        }
    }
    
}