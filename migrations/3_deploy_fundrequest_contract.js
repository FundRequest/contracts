const SafeMath = artifacts.require("./math/SafeMath.sol");
const Strings = artifacts.require("./util/strings.sol");
const FundRequestToken = artifacts.require("./token/FundRequestToken.sol");
const FundRequestContract = artifacts.require("./platform/FundRequestContract.sol");
const FundRepository = artifacts.require('./platform/repository/FundRepository.sol');
const ClaimRepository = artifacts.require('./platform/repository/ClaimRepository.sol');

module.exports = function (deployer) {
	deployer.deploy(SafeMath);
	deployer.deploy(Strings);
	deployer.link(SafeMath, FundRepository);
	deployer.deploy(FundRepository);
	deployer.link(SafeMath, ClaimRepository);
	deployer.deploy(ClaimRepository);
	deployer.link(SafeMath, FundRequestContract);
	deployer.link(Strings, FundRequestContract);
	deployer.deploy(FundRequestContract, FundRequestToken.address, 0, 0);
};