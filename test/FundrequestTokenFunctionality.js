const FND = artifacts.require('./token/FundRequestToken.sol');
const expect = require('chai').expect;
const log = console.log;

contract('FundRequestToken', function (accounts) {

  let fnd;
  let owner = accounts[0];

  beforeEach(async function () {
    fnd = await FND.new("FundRequest", "FND", 666000000000000000000, 18, true);
    await fnd.setReleaseAgent(owner);
    await fnd.releaseTokenTransfer();
  });

  it('contract should be set', function () {
    expect(fnd).to.not.be.null;
  });

  it('should be a fundrequest token', async function () {
    let isFndToken = await fnd.isFundRequestToken.call();
    expect(isFndToken).to.be.true;
  });

  it('should have correct owner', async function () {
    let retOwner = await fnd.owner.call();
    expect(retOwner).to.equal(owner)
  });
});