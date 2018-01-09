const FRC = artifacts.require('./token/FundRequestContract.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');
const LTA = artifacts.require('./token/transfer/DefaultLimitedTransferAgent.sol');
const expect = require('chai').expect;

contract('FundRequestContract', function (accounts) {

  let frc;
  let fnd;
  let lta;
  let tokenFactory;
  const owner = accounts[0];
  const funder = accounts[1];

  beforeEach(async function () {
    tokenFactory = await TokenFactory.new();
    lta = await LTA.new();
    await lta.enableLimitedTransfers(false);
    fnd = await FND.new(lta.address, tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
    await fnd.changeController(owner);
    await fnd.generateTokens(owner, 666000000000000000000);
    frc = await FRC.new(fnd.address);
    await fnd.approve(frc.address, 1000);
  });

  let expectBalance = async function (data) {
    let bal = await frc.balance.call(web3.fromAscii(data.platform), web3.fromAscii(data.platformId));
    expect(bal.toNumber()).to.equal(data.value);
  };

  let fundRequest = async function (data) {
    await frc.fund(web3.fromAscii(data.platform), web3.fromAscii(data.platformId), data.url, data.value);
  };

  it('should return 0 balance', async function () {
    await expectBalance({
      platform: "github",
      platformId: "1",
      value: 0
    });
  });

  let fundDefaultRequest = async function () {
    let data = {
      platform: "github",
      platformId: "1",
      value: 100,
      url: 'https://github.com'
    };
    await fundRequest(data);
    return data;
  };
  it('should be able to fund an issue which updates the balance', async function () {
    let data = await fundDefaultRequest();
    await expectBalance(data);
  });

  it('should not be possible to fund 0 tokens', async function () {
    let data = {
      platform: "github",
      platformId: "1",
      value: 0,
      url: 'https://github.com'
    };
    try {
      await fundRequest(data);
      assert.fail('should fail');
    } catch (error) {
      assertInvalidOpCode(error);
    }
  });

  it('should update totalBalance when funding', async function () {
    let data = await fundDefaultRequest();
    let totalBalance = await frc.totalBalance.call();
    expect(totalBalance.toNumber()).to.equal(data.value);
  });

  it('should update totalFunded when funding', async function () {
    let data = await fundDefaultRequest();
    let totalFunded = await frc.totalFunded.call();
    expect(totalFunded.toNumber()).to.equal(data.value);
  });

  it('should update totalNumberOfFunders when funding', async function () {
    await fundDefaultRequest();
    let totalNumberOfFunders = await frc.totalNumberOfFunders.call();
    expect(totalNumberOfFunders.toNumber()).to.equal(1);
  });

  it('should update requestsFunded when funding', async function () {
    await fundDefaultRequest();
    let requestsFunded = await frc.requestsFunded.call();
    expect(requestsFunded.toNumber()).to.equal(1);
  });

  it('should be able to query the fund information', async function () {
    //TODO: this does not query the fund information
    let data = await fundDefaultRequest();
    expect(data.platform).to.equal('github');
    expect(data.platformId).to.equal('1');
    expect(data.value).to.equal(100);
    expect(data.url).to.equal('https://github.com');
  });

  function assertInvalidOpCode(error) {
    assert(
      error.message.indexOf('VM Exception while processing transaction: revert') >= 0,
      'this should fail.'
    );
  }
});