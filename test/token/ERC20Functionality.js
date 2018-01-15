const FND = artifacts.require('./token/FundRequestToken.sol');
const LTA = artifacts.require('./token/transfer/DefaultLimitedTransferAgent.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');

const expect = require('chai').expect;

contract('ERC20Functionality', function (accounts) {
	let fnd;
	let lta;
	let tokenFactory;
	const owner = accounts[0];

	beforeEach(async function () {
		tokenFactory = await TokenFactory.new();
		lta = await LTA.new();
		await lta.enableLimitedTransfers(false);
		fnd = await FND.new(lta.address, tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
		await fnd.changeController(owner);
		await fnd.generateTokens(owner, 666000000000000000000);
	});

	it('should be possible to transfer tokens', async function () {
		const receiver = accounts[1];
		await fnd.transfer(receiver, 23, {from: owner});
		let balance = await fnd.balanceOf.call(receiver);
		expect(balance.toString()).to.equal('23');
	});
});