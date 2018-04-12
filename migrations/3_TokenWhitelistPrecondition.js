const TokenWhiteListPrecondition = artifacts.require('./platform/validation/TokenWhitelistPrecondition.sol');
const Platform = artifacts.require("./platform/FundRequestContract.sol");

module.exports = async function (deployer) {

	return deployer.deploy(TokenWhiteListPrecondition, 'token-whitelist', 2, true)
		.then(function () {
			return Platform.deployed()
				.then(function (_platform) {
					return TokenWhiteListPrecondition.deployed()
						.then(function (_whitelist) {
							return _platform.addPrecondition(_whitelist.address);
						});
				});
		});
};