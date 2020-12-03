// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

contract IntercoinStorage is OwnableUpgradeSafe {
    address private intercoinAddr;
	function init() public initializer {
        __Ownable_init();
	}
    function setIntercoinAddr(address _intercoinAddr) public onlyOwner {
        intercoinAddr = _intercoinAddr;
    }
    function getIntercoinAddr() public view returns(address) {
        return intercoinAddr;
    }
}