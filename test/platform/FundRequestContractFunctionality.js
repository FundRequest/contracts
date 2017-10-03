const FRC = artifacts.require('./token/FundRequestContract.sol');
const FND = artifacts.require('./token/DefaultFundRequestToken.sol');
const expect = require('chai').expect;

contract('FundRequestContract', function (accounts) {

  let frc;
  let fnd;
  const owner = accounts[0];

  before(async function () {
    fnd = await FND.new("FundRequest", "FND", 666000000000000000000, 18, true);
    await fnd.setReleaseAgent(owner);
    await fnd.releaseTokenTransfer();
  });

  beforeEach(async function () {
    frc = await FRC.new(fnd.address);
  });

  it('should return 0 balance', async function () {
    let balance = await frc.balance.call(web3.fromAscii("1"));
    expect(balance.toNumber()).to.equal(0);
  });
});