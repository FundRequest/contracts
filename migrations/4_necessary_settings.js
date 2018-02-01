const FundRequestContract = artifacts.require("./platform/FundRequestContract.sol");
const FundRepository = artifacts.require('./platform/repository/FundRepository.sol');
const ClaimRepository = artifacts.require('./platform/repository/ClaimRepository.sol');

module.exports = function (deployer, network, accounts) {
	deployer.then(function () {
		return ClaimRepository.deployed().then(function (claim_instance) {
			claim_instance.updateCaller(FundRequestContract.address, true, {from: accounts[0]})
				.then(function () {
					console.log('done with claim_instance');
				}).then(function () {
				return FundRepository.deployed().then(function (fr_instance) {
					fr_instance.updateCaller(FundRequestContract.address, true, {from: accounts[0]})
						.then(function () {
							console.log('done with fr_instance');
						})
				});
			});
		})
	});
};