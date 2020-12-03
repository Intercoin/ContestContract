// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

interface IIntercoin {
    function registerInstance(address) external returns(bool);
    function checkInstance(address) external returns(bool);
}