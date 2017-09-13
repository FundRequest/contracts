require('chai');
const FND = artifacts.require('./token/FundRequestToken.sol');

contract('FundRequestToken', function (accounts) {

  let fnd;
  const owner = accounts[0];

  beforeEach(async function () {
    fnd = await FND.new("FundRequest", "FND", 666000000000000000000, 18, true);
    await fnd.setReleaseAgent(owner);
    await fnd.releaseTokenTransfer();
  });

  it('should be possible to transfer tokens', async function () {
    const receiver = accounts[1];
    await fnd.transfer(receiver, 23);
    let balance = await fnd.balanceOf.call(receiver);
    expect(balance.toString()).to.equal('23');
  });
});