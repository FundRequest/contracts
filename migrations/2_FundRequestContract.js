var Platform = artifacts.require("./platform/FundRequestContract.sol");
var Strings = artifacts.require("./util/strings.sol");
var SafeMath = artifacts.require("./math/SafeMath.sol");

module.exports = function (deployer) {

	deployer.deploy(SafeMath).then(function () {
		return deployer.deploy(Strings);
	}).then(function () {
		deployer.link(SafeMath, Platform);
		deployer.link(Strings, Platform);
		return deployer.deploy(Platform, '0x4df47b4969b2911c966506e3592c41389493953b', '0xda3493c713c99737c684e4ee5a97654a1aa80922', '0xe305312618fa07a8a95643f3d79e5950d0b865fd');
	});
};