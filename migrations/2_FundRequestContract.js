const FundrequestToken = artifacts.require("./token/FundRequestToken.sol");

const FundRepository = artifacts.require('./platform/repository/FundRepository.sol');
const ClaimRepository = artifacts.require('./platform/repository/ClaimRepository.sol');
const Platform = artifacts.require("./platform/FundRequestContract.sol");

const Strings = artifacts.require("./util/strings.sol");
const SafeMath = artifacts.require("./math/SafeMath.sol");

module.exports = async function (deployer) {

	await deployer.deploy(FundrequestToken,
		0x0,
		0x0,
		0,
		'FundRequest',
		18,
		'FND',
		true);


	let token = await FundrequestToken.deployed();

	await deployer.deploy(ClaimRepository);
	await deployer.deploy(FundRepository);

	let claim = await ClaimRepository.deployed();
	let fund = await FundRepository.deployed();


	await deployer.deploy(Platform,
		token.address,
		fund.address,
		claim.address
	)
};