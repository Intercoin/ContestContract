pragma solidity >=0.6.0 <0.7.0;

import "./ContestBase.sol";
import "./openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract Contest is ContestBase {
    address token;
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
    constructor (
        address token_address,
        uint256 stagesCount,
        uint256[] memory stagesMinAmount,
        uint256 contestPeriodInSeconds,
        uint256 votePeriodInSeconds,
        uint256 revokePeriodInSeconds,
        uint256[] memory percentForWinners,
        address[] memory judges
    ) 
        ContestBase(stagesCount, stagesMinAmount, contestPeriodInSeconds, votePeriodInSeconds, revokePeriodInSeconds, percentForWinners, judges
    ) 
        public 
    {
        token = token_address;
    }
    
    receive() external payable {
        require(true == false, "Method does not support.");
    }
    
    // pledge(amount) can be used to send external token into the contract, and issue internal token balance
    function pledge(uint256 amount, uint256 stageID) public virtual override {
        uint256 _allowedAmount = IERC20(token).allowance(_msgSender(), address(this));
        require(
            (
                (amount <= _allowedAmount) ||
                (_allowedAmount > 0)
            ), 
            "Amount exceeds allowed balance");

        // try to get
        bool success = IERC20(token).transferFrom(_msgSender(), address(this), _allowedAmount);
        require(success == true, "Transfer tokens were failed"); 
        
        _pledge(amount, stageID);
    }
    
    
    function revokeAfter(uint256 amount) internal virtual override {
        // todo: 0 return back to user 
        bool success = IERC20(token).transfer(_msgSender(),amount);
        require(success == true, 'Transfer tokens were failed');    
    }
    function _claimAfter(uint256 amount) internal virtual override {
        bool success = IERC20(token).transfer(_msgSender(),amount);
        require(success == true, 'Transfer tokens were failed');    
    }
}