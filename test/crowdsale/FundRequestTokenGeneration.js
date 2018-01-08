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
    await tge.allow(tokenBuyer);
    let allowed = await tge.allowed.call(tokenBuyer);
    expect(allowed).to.be.true;
  });

  it('should only be possible by owner to whitelist', async function () {
    try {
      await tge.allow(tokenBuyer, {from: tokenBuyer});
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
    } catch(error) {
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

  it('should mint founder tokens when tokens are bought', async function () {
    await buyTokens(1);
    await expectBalance(founderWallet, 810);
  });

  it('should mint advisor tokens when tokens are bought', async function () {
    await buyTokens(1);
    await expectBalance(advisorWallet, 90);
  });

  it('should mint ecosystem tokens when tokens are bought', async function () {
    await buyTokens(1);
    await expectBalance(ecoSystemWallet, 1350);
  });

  it('should mint cold storage tokens when tokens are bought', async function () {
    await buyTokens(1);
    await expectBalance(coldStorageWallet, 450);
  });

  it('should update deposits when tokens are bought', async function () {
    await buyTokens(1);
    let deposits = await tge.deposits.call(tokenBuyer);
    expect(deposits.toNumber()).to.equal(getAmountInWei(1));
  });

  it('should update investorsCount when tokens are bought', async function () {
    await buyTokens(1);
    let count = await tge.investorCount.call();
    expect(count.toNumber()).to.equal(1);
  });

  it('should update investors when tokens are bought', async function () {
    await buyTokens(1);
    let investor = await tge.investors.call(0);
    expect(investor).to.equal(tokenBuyer);
  });

  it('should update weiRaised count when tokens are bought', async function () {
    await buyTokens(1);
    let wei = await tge.totalCollected.call();
    expect(wei.toNumber()).to.equal(getAmountInWei(1));
  });

  it('should be possible to allocate tokens from previous rounds', async function () {
    await tge.allocateTokens(tokenBuyer, getAmountInWei(1800));
    await expectBalance(tokenBuyer, 1800);
    await expectBalance(founderWallet, 810);
    await expectBalance(advisorWallet, 90);
    await expectBalance(ecoSystemWallet, 1350);
    await expectBalance(coldStorageWallet, 450);
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

  it('should be possible to update wallets as owner', async function() {
      await tge.setFounderWallet(accounts[1], { from: owner });
      await tge.setAdvisorWallet(accounts[2], { from: owner });
      await tge.setEcoSystemWallet(accounts[3], { from: owner });
      await tge.setColdStorageWallet(accounts[4], { from: owner });

      expect(await tge.ecoSystemWallet.call()).to.equal(accounts[3]);
      expect(await tge.founderWallet.call()).to.equal(accounts[1]);
      expect(await tge.coldStorageWallet.call()).to.equal(accounts[4]);
      expect(await tge.advisorWallet.call()).to.equal(accounts[2]);
  });

  it('should not be possible to update wallets as non-owner', async function() {
    try {
      await tge.setFounderWallet(accounts[1], {from: accounts[2]});
      assert.fail('should fail');
    } catch(error) {
      assertInvalidOpCode(error);
    }
});

  it('should have a default personal cap and be active', async function() {
    expect(await tge.personalCapActive.call()).to.be.true;
    expect((await tge.personalCap.call()).toNumber()).to.equal(getAmountInWei(5));
  });

  it('should be possible to update maxCap as owner', async function() {
    await tge.setPersonalCap(getAmountInWei(4), {from: owner});
    expect((await tge.personalCap.call()).toNumber()).to.equal(getAmountInWei(4));
  });

  it('should be possible to update if personal cap is active or not as owner', async function() {
    await tge.setPersonalCapActive(false, {from: owner});
    expect(await tge.personalCapActive.call()).to.be.false;    
  });

  it('should not be possible to update if personal cap is active or not as non-owner', async function() {
    try {
      await tge.setPersonalCapActive(false, {from: accounts[2]});
      assert.fail('should have failed');
    } catch(error) {
      assertInvalidOpCode(error);
    }
  });

  it('should not be possible to update if personal cap is active or not as non-owner', async function() {
    try {
      await tge.setPersonalCap(getAmountInWei(3), {from: accounts[2]});
      assertFail('should have failed');
    } catch(error) {
      assertInvalidOpCode(error);
    }
  });

  let buyTokens = async function (amountInEther) {
    await tge.allow(tokenBuyer);
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