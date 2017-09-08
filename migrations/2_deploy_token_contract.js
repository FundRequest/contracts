var SafeMath = artifacts.require("./math/SafeMath.sol");

var FundrequestToken = artifacts.require("./token/FundRequestToken.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, FundrequestToken)
  deployer.deploy(FundrequestToken,
    "FundRequest",
    "FND",
    666000000000000000000,
    18,
    true
  );
};