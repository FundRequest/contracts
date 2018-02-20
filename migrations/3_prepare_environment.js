const FundrequestToken = artifacts.require("./token/FundRequestToken.sol");

const FundRepository = artifacts.require('./platform/repository/FundRepository.sol');
const ClaimRepository = artifacts.require('./platform/repository/ClaimRepository.sol');
const Platform = artifacts.require("./platform/FundRequestContract.sol");

module.exports = async function (deployer, network, accounts) {

	if(network !== 'mainnet') {
		console.log("We're on " + network);
		let token = await FundrequestToken.at('0x23b98d4ff90a169d88bfab8b8829f0b0c0e3bce0');
		let platform = await Platform.at('0xc1b66749fe5e2a15034b882da9e690490d5a1336');
		let claim = await ClaimRepository.at('0x0e3ae6bd121afc617a16648e0bc51880e99bcd2a');
		let fund = await FundRepository.at('0x757289ff29da4f01ea5292a6724024bcf70a1435');

		await claim.updateCaller(platform.address, true);
		await fund.updateCaller(platform.address, true);

		await token.generateTokens(accounts[0], 20000 * Math.pow(10, 18));
	}
};