
const { ethers} = require('hardhat');
const { expect } = require('chai');
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
require("@nomicfoundation/hardhat-chai-matchers");

const { constants } = require('@openzeppelin/test-helpers');

module.exports = async function(instance, trustedForwarder, trustedForwarderMode, from_, func_signature_, params_, revertedMessage_, revertedMessageArgs_){
    let expectError = (typeof(revertedMessage_) === 'undefined') ? false : true;
    let existsErrorArgs = (typeof(revertedMessageArgs_) === 'undefined') ? false : true;

    if (
        trustedForwarderMode &&
        (typeof(trustedForwarder) === 'object') && 
        (typeof(trustedForwarder.address) === 'string') && 
        (trustedForwarder.address != constants.ZERO_ADDRESS)
    )  {
        //const dataTx = await instance.connect(trustedForwarder).populateTransaction[func_signature_](...params_);
        const dataTx = await instance.connect(trustedForwarder)[func_signature_.replace(/\([^()]*\)/g, '')].populateTransaction(...params_);
        
        dataTx.data = dataTx.data.concat((from_.address).substring(2));
        if (expectError) {
            if (existsErrorArgs) {
                return await expect(trustedForwarder.sendTransaction(dataTx)).to.be.revertedWithCustomError(instance, revertedMessage_).withArgs(...revertedMessageArgs_);
            } else {
                return await expect(trustedForwarder.sendTransaction(dataTx)).to.be.revertedWith(instance, revertedMessage_);
            }
        } else {
            return await trustedForwarder.sendTransaction(dataTx);
        }
    } else {
        if (expectError) {
            if (existsErrorArgs) {
                return await expect(instance.connect(from_)[func_signature_](...params_)).to.be.revertedWithCustomError(instance, revertedMessage_).withArgs(...revertedMessageArgs_);
            } else {
                return await expect(instance.connect(from_)[func_signature_](...params_)).to.be.revertedWith(instance, revertedMessage_);
            }
        } else {
            return await instance.connect(from_)[func_signature_](...params_);
        }
    }
}

