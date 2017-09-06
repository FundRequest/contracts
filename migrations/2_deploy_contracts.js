var SafeMath = artifacts.require("./math/SafeMath.sol");
var SafeMathLib = artifacts.require("./math/SafeMathLib.sol");
//var ERC20 = artifacts.require("./ERC20.sol");
var CrowdsaleToken = artifacts.require("./CrowdsaleToken.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SafeMath);
  deployer.deploy(SafeMathLib);
  deployer.link(SafeMathLib, CrowdsaleToken)
  deployer.deploy(CrowdsaleToken,
    "FundRequest",
    "FND",
    666000000000000000000,
    18,
    true
  );
};