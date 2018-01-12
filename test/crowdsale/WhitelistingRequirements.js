const FND = artifacts.require('./token/FundRequestToken.sol');
const TGE = artifacts.require('./crowdsale/FundRequestTokenGeneration.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');

const expect = require('chai').expect;
const log = console.log;

contract('FundRequestTokenGeneration', function (accounts) {

	let fnd;
	let tge;
	let tokenFactory;
	let owner = accounts[0];
	let founderWallet = accounts[1];
	let advisorWallet = accounts[2];
	let ecoSystemWallet = accounts[3];
	let coldStorageWallet = accounts[4];
	let tokenBuyer = accounts[5];

	beforeEach(async function () {
		tokenFactory = await TokenFactory.new();
		fnd = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
		await fnd.generateTokens(owner, 666000000000000000000);
		tge = await TGE.new(fnd.address, founderWallet, advisorWallet, ecoSystemWallet, coldStorageWallet, 1800, getAmountInWei(20), getAmountInWei(5));
		await fnd.changeController(tge.address);
	});

	it('should be possible to whitelist', async function () {
		await tge.allow(tokenBuyer, 1 /* china */);
		let allowed = (await tge.allowed.call(tokenBuyer)).toNumber();
		expect(allowed).to.equal(1);
	});

	it('a non-whitelisted user has value of 0', async function () {
		let allowed = (await tge.allowed.call(tokenBuyer)).toNumber();
		expect(allowed).to.equal(0);
	});


	it('disallowing non-whitelist should not be allowed', async function () {
		try {
			await tge.allowCountry(0, false);
		} catch(error) {
			assertInvalidOpCode(error);
		}
	});

	it('by default, all countries allowed', async function () {
		expect((await tge.allowedCountries.call(1))).to.be.true; //CHINA
		expect((await tge.allowedCountries.call(2))).to.be.true; //KOREA
		expect((await tge.allowedCountries.call(3))).to.be.true; //USA
		expect((await tge.allowedCountries.call(4))).to.be.true; //OTHER
	});

	it('by default, not-whitelist not allowed', async function () {
		expect((await tge.allowedCountries.call(0))).to.be.false; //NOT_WHITELISTED
	});

	it('should be possible to update allow of country', async function () {
		await tge.allowCountry(1, false); //CHINA
		expect((await tge.allowedCountries.call(1))).to.be.false; //NOT_WHITELISTED
	});

	it('should be possible to buy for a country', async function() {
		await buyTokens(1, 1); //china
		await expectBalance(tokenBuyer, 1800);
	});

	it('should not be possible to buy for a non-alllowed country', async function() {
		await tge.allowCountry(1, false); //CHINA
		try {
			await buyTokens(1, 1); //china
		} catch(error) {
			assertInvalidOpCode(error);
		}
 	});


	let getAmountInWei = function (number) {
		return number * Math.pow(10, 18);
	};

	let expectBalance = async function (address, amount) {
		let balance = await fnd.balanceOf.call(address);
		expect(balance.toNumber()).to.equal(getAmountInWei(amount));
	};

	let buyTokens = async function (amountInEther, country) {
		tge.setPersonalCapActive(false, { from: owner });
		await tge.allow(tokenBuyer, country);
		amountInEther = amountInEther || 1;
		await tge.proxyPayment(tokenBuyer, {value: getAmountInWei(amountInEther)});
	};

	function assertInvalidOpCode(error) {
		assert(
			error.message.indexOf('VM Exception while processing transaction: revert') >= 0,
			'Method should have reverted'
		);
	}
});