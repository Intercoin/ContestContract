const ERC20Mintable = artifacts.require("ERC20Mintable");
const ERC20Mintable2 = artifacts.require("ERC20Mintable");

const ContestETHOnly = artifacts.require("ContestETHOnly");
const ContestETHOnlyMock = artifacts.require("ContestETHOnlyMock");

const Contest = artifacts.require("Contest");
//const ContestMock = artifacts.require("ContestMock");


module.exports = function(deployer) {
  deployer.deploy(ERC20Mintable,'t2','t2');
  deployer.deploy(ERC20Mintable2,'t5','t5');
};
