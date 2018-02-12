const FundRepository = artifacts.require("./platform/repository/FundRepository.sol");
const ClaimRepository = artifacts.require("./platform/repository/ClaimRepository.sol");

module.exports = function (deployer, network, accounts) {

	let result = deployer.deploy(FundRepository);
	let result2 = deployer.deploy(ClaimRepository);

};