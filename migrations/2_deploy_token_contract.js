const MiniMeTokenFactory = artifacts.require("./factory/MiniMeTokenFactory.sol");
const FundRequestToken = artifacts.require("./token/FundRequestToken.sol");

module.exports = function (deployer) {
	deployer.deploy(MiniMeTokenFactory).then(function () {
		return deployer.deploy(FundRequestToken,
			MiniMeTokenFactory.address,
			0x0,
			0,
			"FundRequest",
			18,
			"FND",
			false
		);
	});
};