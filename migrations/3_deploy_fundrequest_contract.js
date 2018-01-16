const SafeMath = artifacts.require("./math/SafeMath.sol");
const Strings = artifacts.require("./util/strings.sol");
const FundRequestToken = artifacts.require("./token/FundRequestToken.sol");
const FundRequestContract = artifacts.require("./platform/FundRequestContract.sol");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(SafeMath);
  deployer.deploy(Strings);
  deployer.link(SafeMath, FundRequestContract);
  deployer.link(Strings, FundRequestContract);
  deployer.deploy(FundRequestContract, FundRequestToken.address);
};