const FRC = artifacts.require('./token/FundRequestContract.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');
const FRC_FUND_REPO = artifacts.require('./token/repository/FundRepository.sol');
const FRC_CLAIM_REPO = artifacts.require('./token/repository/ClaimRepository.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');
const expect = require('chai').expect;

contract('ReceiveApprovalFunctionality', function (accounts) {

	let frc;
	let fnd;
	let fundRepository;
	let claimRepository;
	let tokenFactory;
	const owner = accounts[0];

	let createToken = async function () {
		tokenFactory = await TokenFactory.new();
		fnd = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
		await fnd.changeController(owner);
		await fnd.generateTokens(owner, 666000000000000000000);
	};

	beforeEach(async function () {
		await createToken();

		fundRepository = await FRC_FUND_REPO.new();
		claimRepository = await FRC_CLAIM_REPO.new();
		frc = await FRC.new(fnd.address, fundRepository.address, claimRepository.address);
		await fundRepository.updateCaller(frc.address, true, {from: owner});
		await claimRepository.updateCaller(frc.address, true, {from: owner});
	});

	it('should not be able to receive a different token to be approved by the fndContract', async function () {
		try {
			let fnd2 = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest2", 18, "FND", true);
			await fnd.changeController(owner);
			await fnd2.generateTokens(owner, 666000000000000000000);

			await fnd2.approveAndCall(frc.address, tokens(1), web3.fromAscii("github|1|https://github.com"));

			assert.fail('should have failed');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should be possible to come in with approveAndCall', async function () {
		let amount = tokens(1);
		let platform = "github";
		let platformId = "1";
		let url = "https://github.com";

		await fnd.approveAndCall(frc.address, amount, web3.fromAscii(platform + "|AAC|" + platformId), {from: owner});

		let bal = await fundRepository.balance.call(web3.fromAscii(platform), web3.fromAscii(platformId));
		expect(bal.toNumber()).to.equal(amount);
		let fundInfo = await fundRepository.getFundInfo.call(web3.fromAscii(platform), web3.fromAscii(platformId), owner);
		expect(fundInfo[0].toNumber()).to.equal(1);
		expect(fundInfo[1].toNumber()).to.equal(amount);
		expect(fundInfo[2].toNumber()).to.equal(amount);
	});

	function tokens(_amount) {
		return _amount * Math.pow(10, 18);
	}

	function assertInvalidOpCode(error) {
		assert(
			error.message.indexOf('VM Exception while processing transaction: revert') >= 0,
			'this should fail.'
		);
	}
});