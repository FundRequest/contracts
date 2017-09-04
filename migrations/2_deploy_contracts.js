var FundRequestPrivateSeed = artifacts.require("./presale/FundRequestPrivateSeed.sol");
var SafeMath = artifacts.require("./math/SafeMath.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, FundRequestPrivateSeed);
  deployer.deploy(FundRequestPrivateSeed,
    4500,
    accounts[0]
  );
};