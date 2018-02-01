const SafeMath = artifacts.require("./math/SafeMath.sol");
const Strings = artifacts.require("./util/strings.sol");
const FundRequestToken = artifacts.require("./token/FundRequestToken.sol");
const FundRequestContract = artifacts.require("./platform/FundRequestContract.sol");
const FundRepository = artifacts.require('./platform/repository/FundRepository.sol');
const ClaimRepository = artifacts.require('./platform/repository/ClaimRepository.sol');

module.exports = function (deployer) {
  deployer.deploy(SafeMath).then(function() {
    return deployer.deploy(Strings);
  }).then(function() {
    deployer.link(SafeMath, FundRepository);
    return deployer.deploy(FundRepository);
  }).then(function() {
    deployer.link(SafeMath, ClaimRepository);
    return deployer.deploy(ClaimRepository);
  }).then(function() {
    deployer.link(SafeMath, FundRequestContract);
    deployer.link(Strings, FundRequestContract);
    return deployer.deploy(FundRequestContract, FundRequestToken.address, FundRepository.address, ClaimRepository.address);
  });
};