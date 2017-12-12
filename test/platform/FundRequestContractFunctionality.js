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

  let expectBalance = async function (platform, platformId, balance) {
    let bal = await frc.balance.call(web3.fromAscii(platform), web3.fromAscii(platformId));
    expect(bal.toNumber()).to.equal(balance);
  };

  it('should return 0 balance', async function () {
    await expectBalance("github", "1", 0);
  });

  it('should be able to fund an issue', async function () {
    let value = 100;
    let platform = "github";
    await frc.fund(web3.fromAscii(platform), web3.fromAscii("1"), value);
    await expectBalance(platform, "1", value);
    let totalBalance = await frc.totalBalance.call();
    expect(totalBalance.toNumber()).to.equal(value);
    let totalFunds = await frc.totalFunds.call();
    expect(totalFunds.toNumber()).to.equal(value);
    let totalPlatformBalances = await frc.totalPlatformBalances.call(web3.fromAscii(platform));
    expect(totalPlatformBalances.toNumber()).to.equal(value);
    let totalPlatformFunds = await frc.totalPlatformFunds.call(web3.fromAscii(platform));
    expect(totalPlatformFunds.toNumber()).to.equal(value);
  });
});