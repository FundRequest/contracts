const SafeMath = artifacts.require("./math/SafeMath.sol");
const FundRequestToken = artifacts.require("./token/FundRequestToken.sol");
const FundRequestContract = artifacts.require("./platform/FundRequestContract.sol");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, FundRequestContract);
  deployer.deploy(FundRequestContract, FundRequestToken.address);
};