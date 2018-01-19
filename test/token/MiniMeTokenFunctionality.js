const FND = artifacts.require('./token/FundRequestToken.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');

const expect = require('chai').expect;
const log = console.log;

contract('MiniMeToken', function (accounts) {

	let fnd;
	let tokenFactory;
	let owner = accounts[0];

	beforeEach(async function () {
		tokenFactory = await TokenFactory.new();
		fnd = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
		await fnd.changeController(owner);
		await fnd.generateTokens(owner, 100);
	});

	it('should be possible to transfer tokens', async function () {
		await fnd.transfer(accounts[1], 23, {from: owner});
		let balance = await fnd.balanceOf.call(accounts[1]);
		expect(balance.toString()).to.equal('23');
	});

	it("should return correct balances after transfer", async function () {
		await fnd.transfer(accounts[1], 100);
		let balance0 = await fnd.balanceOf(accounts[0]);
		assert.equal(balance0, 0);

		let balance1 = await fnd.balanceOf(accounts[1]);
		assert.equal(balance1, 100);
	});


	it('should be possible to approve', async function () {
		await fnd.approve(accounts[1], 23, {from: accounts[0]});
		let balance = await fnd.allowance.call(accounts[0], accounts[1]);
		expect(balance.toString()).to.equal('23');
	});

	it('should be possible to transferFrom', async function () {
		await fnd.approve(accounts[1], 23, {from: accounts[0]});
		await fnd.transferFrom(accounts[0], accounts[2], 23, {from: accounts[1]});
		let balance = await fnd.balanceOf.call(accounts[2]);
		expect(balance.toString()).to.equal('23');
	});

	it("should return the correct allowance amount after approval", async function () {
		let approve = await fnd.approve(accounts[1], 100);
		let allowance = await fnd.allowance(accounts[0], accounts[1]);

		assert.equal(allowance, 100);
	});

	it("should throw an error when trying to transfer more than balance", async function () {
		await fnd.transfer(accounts[1], 101, {from: owner});
		let worked = await fnd.balanceOf(accounts[1]);
		assert.equal(worked.toNumber(), 0);
	});

	it("should return correct balances after transfering from another account", async function () {
		let approve = await fnd.approve(accounts[1], 100);
		let transferFrom = await fnd.transferFrom(accounts[0], accounts[2], 100, {from: accounts[1]});

		let balance0 = await fnd.balanceOf(accounts[0]);
		assert.equal(balance0, 0);

		let balance1 = await fnd.balanceOf(accounts[2]);
		assert.equal(balance1, 100);

		let balance2 = await fnd.balanceOf(accounts[1]);
		assert.equal(balance2, 0);
	});

	it("should throw an error when trying to transfer more than allowed", async function () {
		await fnd.approve(accounts[1], 99);
		await fnd.transferFrom(accounts[0], accounts[2], 100, {from: accounts[1]});
		let worked = await fnd.balanceOf(accounts[2]);
		assert.equal(worked.toNumber(), 0);
	});
});