const FRC = artifacts.require('./token/FundRequestContract.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');
const expect = require('chai').expect;

contract('ReceiveApprovalFunctionality', function (accounts) {

	let frc;
	let fnd;
	let tokenFactory;
	const owner = accounts[0];

	beforeEach(async function () {
		tokenFactory = await TokenFactory.new();
		fnd = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
		await fnd.changeController(owner);
		await fnd.generateTokens(owner, tokens(666));
		frc = await FRC.new(fnd.address);
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

		await fnd.approveAndCall(frc.address, amount, web3.fromAscii(platform + "|" + platformId + "|" + url), {from: owner});

		let bal = await frc.balance.call(web3.fromAscii(platform), web3.fromAscii(platformId));
		expect(bal.toNumber()).to.equal(amount)
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