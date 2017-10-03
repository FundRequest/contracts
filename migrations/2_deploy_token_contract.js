const SafeMath = artifacts.require("./math/SafeMath.sol");

const DefaultFundrequestToken = artifacts.require("./token/DefaultFundRequestToken.sol");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, DefaultFundrequestToken);
  deployer.deploy(DefaultFundrequestToken,
    "FundRequest",
    "FND",
    666000000000000000000,
    18,
    true
  );
};