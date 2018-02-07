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
	let tokensaleWallet = accounts[2];
	let tokenBuyer = accounts[5];

	beforeEach(async function () {
		tokenFactory = await TokenFactory.new();
		fnd = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
		tge = await TGE.new(fnd.address, founderWallet, tokensaleWallet, 1800, getAmountInWei(20), getAmountInWei(5));
		await fnd.changeController(tge.address);
	});

	it('should only be possible by owner to whitelist', async function () {
		try {
			await tge.allow(tokenBuyer, 1, {from: tokenBuyer});
			assert.fail('should fail');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should not be possible to buy tokens with a payment less than 0.01 eth', async function () {
		await buyTokens(1);
		await expectBalance(tokenBuyer, 1800);
	});

	it('should be possible to buy tokens', async function () {
		try {
			await buyTokens(0.001);
			assert.fail("should have failed");
		} catch (error) {
			assertInvalidOpCode(error);
			await expectBalance(tokenBuyer, 0);
		}
	});

	it('should not be possible to buy tokens when not whitelisted', async function () {
		try {
			await tge.proxyPayment(tokenBuyer, {value: getAmountInWei(1)});
			assert.fail('should fail');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should not be possible to buytokens when contract is paused', async function () {
		try {
			await tge.pause();
			await buyTokens(1);
			assert.fail('should fail');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should be possible to update maxcap', async function () {
		await tge.setMaxCap(getAmountInWei(10));
		let maxCap = await tge.maxCap.call();
		expect(maxCap.toNumber()).to.equal(getAmountInWei(10));
	});

	it('should only be possible by owner to update maxcap', async function () {
		try {
			await tge.setMaxCap(getAmountInWei(10), {from: tokenBuyer});
			assert.fail('should fail');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should not be possible to go over max cap', async function () {
		try {
			await tge.setMaxCap(getAmountInWei(1), {from: tokenBuyer});
			await buyTokens(2);
			assert.fail('should fail');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should mint 60% of tokens extra when tokens are bought', async function () {
		await buyTokens(1);
		await expectBalance(tokensaleWallet, ((1800 / 40) * 60));
	});

	it('should update deposits when tokens are bought', async function () {
		await buyTokens(1);
		let deposits = await tge.deposits.call(tokenBuyer);
		expect(deposits.toNumber()).to.equal(getAmountInWei(1));
	});

	it('should update weiRaised count when tokens are bought', async function () {
		await buyTokens(1);
		let wei = await tge.totalCollected.call();
		expect(wei.toNumber()).to.equal(getAmountInWei(1));
	});

	it('should be possible to allocate tokens from previous rounds', async function () {
		await tge.allocateTokens(tokenBuyer, getAmountInWei(1800));
		await expectBalance(tokenBuyer, 1800);
		await expectBalance(tokensaleWallet, 810 + 90 + 1350 + 450);
	});

	it('only owner can assign tokens from previous rounds', async function () {
		try {
			await tge.allocateTokens(tokenBuyer, getAmountInWei(1800), {from: tokenBuyer});
			assert.fail('should fail');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should not be possible to allocate tokens when contract is paused', async function () {
		try {
			await tge.pause();
			await tge.allocateTokens(tokenBuyer, getAmountInWei(1800));
			assert.fail('should fail');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should be possible to update wallets as owner', async function () {
		await tge.setFounderWallet(accounts[1], {from: owner});
		await tge.setTokensaleWallet(accounts[3], {from: owner});

		expect(await tge.tokensaleWallet.call()).to.equal(accounts[3]);
		expect(await tge.founderWallet.call()).to.equal(accounts[1]);
	});

	it('should not be possible to update wallets as non-owner', async function () {
		try {
			await tge.setFounderWallet(accounts[1], {from: accounts[2]});
			assert.fail('should fail');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should have a default personal cap and be active', async function () {
		expect(await tge.personalCapActive.call()).to.be.true;
		expect((await tge.personalCap.call()).toNumber()).to.equal(getAmountInWei(5));
	});

	it('should be possible to update maxCap as owner', async function () {
		await tge.setPersonalCap(getAmountInWei(4), {from: owner});
		expect((await tge.personalCap.call()).toNumber()).to.equal(getAmountInWei(4));
	});

	it('should be possible to update if personal cap is active or not as owner', async function () {
		await tge.setPersonalCapActive(false, {from: owner});
		expect(await tge.personalCapActive.call()).to.be.false;
	});

	it('should not be possible to update if personal cap is active or not as non-owner', async function () {
		try {
			await tge.setPersonalCapActive(false, {from: accounts[2]});
			assert.fail('should have failed');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should not be possible to update if personal cap is active or not as non-owner', async function () {
		try {
			await tge.setPersonalCap(getAmountInWei(3), {from: accounts[2]});
			assertFail('should have failed');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should not be possible to immediately go over the personal cap during the first round', async function () {
		try {
			await buyTokens(6);
			assert.fail('should have failed');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should not be possible to go over the personal cap in multiple tries during the first round', async function () {
		await buyTokens(3);
		expectBalance(tokenBuyer, 1800 * 3);
		await buyTokens(2);
		expectBalance(tokenBuyer, 1800 * 5);
		try {
			await buyTokens(1);
			assert.fail('should have failed');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});

	it('should be possible to immediately go over the personal cap if were not in the personal cap round', async function () {
		tge.setPersonalCapActive(false, {from: owner});
		await buyTokens(10);
		expectBalance(tokenBuyer, 1800 * 10);
	});

	it('should be possible to go over the personal cap in multiple tries if were not in the personal cap round', async function () {
		tge.setPersonalCapActive(false, {from: owner});
		await buyTokens(2);
		await buyTokens(3);
		await buyTokens(1);
		expectBalance(tokenBuyer, 1800 * 6);
	});

	it('investing should send the funds to the wallet', async function () {
		let newFounderWallet = '0x6c3f822f95e5bf7f95afce66e3d5ed20b40f8533';
		tge.setPersonalCapActive(false, {from: owner});
		await tge.setFounderWallet(newFounderWallet, {from: owner});
		expect((await web3.eth.getBalance(newFounderWallet)).toNumber()).to.equal(getAmountInWei(0));

		await tge.allow('0x0f38b3dee21bcb6ea1ebb8a33badc338f739b80c', 1); //allow him for china
		await tge.proxyPayment('0x0f38b3dee21bcb6ea1ebb8a33badc338f739b80c', {value: getAmountInWei(1)});
		expect((await web3.eth.getBalance(newFounderWallet)).toNumber()).to.equal(getAmountInWei(1));
	});

  it('should return true onTransfer', async function () {
    let result = await tge.onTransfer.call(accounts[0], accounts[1], 1);
    expect(result).to.be.true;
  });

  it('should return true onApprove', async function () {
    let result = await tge.onApprove.call(accounts[0], accounts[1], 1);
    console.log(result);
    expect(result).to.be.true;
  });

	let buyTokens = async function (amountInEther) {
		await tge.allow(tokenBuyer, 1); //allow him for china
		amountInEther = amountInEther || 1;
		await tge.proxyPayment(tokenBuyer, {value: getAmountInWei(amountInEther)});
	};

	let expectBalance = async function (address, amount) {
		let balance = await fnd.balanceOf.call(address);
		expect(balance.toNumber()).to.equal(getAmountInWei(amount));
	};

	let getAmountInWei = function (number) {
		return number * Math.pow(10, 18);
	};


	function assertInvalidOpCode(error) {
		assert(
			error.message.indexOf('VM Exception while processing transaction: revert') >= 0,
			'Method should have reverted'
		);
	}
});