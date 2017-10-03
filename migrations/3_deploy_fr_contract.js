const SafeMath = artifacts.require("./math/SafeMath.sol");

const DefaultFundrequestToken = artifacts.require("./token/DefaultFundRequestToken.sol");
const FundRequestContract = artifacts.require("./platform/FundRequestContract.sol");

module.exports = function (deployer, network, accounts) {
  deployer.link(SafeMath, FundRequestContract);
  deployer.deploy(FundRequestContract, DefaultFundrequestToken.address);
};