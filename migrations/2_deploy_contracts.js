var SafeMath = artifacts.require("./math/SafeMath.sol");
//var ERC20 = artifacts.require("./ERC20.sol");
var StandardToken = artifacts.require("./StandardToken.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SafeMath);
  //deployer.deploy(ERC20);
  deployer.deploy(StandardToken);
};