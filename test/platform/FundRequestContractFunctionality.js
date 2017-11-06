const FRC = artifacts.require('./token/FundRequestContract.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');
const expect = require('chai').expect;

contract('FundRequestContract', function (accounts) {

  let frc;
  let fnd;
  const owner = accounts[0];

  before(async function () {
    fnd = await FND.new(0x0, 0, "FundRequest", 18, "FND", true);
    await fnd.changeController(owner);
    await fnd.generateTokens(owner, 666000000000000000000);
  });

  beforeEach(async function () {
    frc = await FRC.new(fnd.address);
  });

  it('should return 0 balance', async function () {
    let balance = await frc.balance.call(web3.fromAscii("1"));
    expect(balance.toNumber()).to.equal(0);
  });
});