const TGE = artifacts.require("./crowdsale/FundRequestTokenGeneration.sol");
const FundRequestToken = artifacts.require('./token/FundRequestToken.sol');

module.exports = function (deployer, network, accounts) {
	deployer.deploy(TGE,
		FundRequestToken.address,
		accounts[0],
		accounts[1],
		1800,
		(6000 * Math.pow(10, 18)),
		(1) * Math.pow(10, 18)
	);
};