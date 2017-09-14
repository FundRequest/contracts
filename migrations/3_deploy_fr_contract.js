const SafeMath = artifacts.require("./math/SafeMath.sol");

const FundrequestToken = artifacts.require("./token/FundRequestToken.sol");
const FundRequestContract = artifacts.require("./platform/FundRequestContract.sol");

module.exports = function (deployer, network, accounts) {
  deployer.link(SafeMath, FundRequestContract);
  deployer.deploy(FundRequestContract, FundrequestToken.address);
};