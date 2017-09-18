const FND = artifacts.require('./token/FundRequestToken.sol');
const expect = require('chai').expect;

contract('FundRequestToken', function (accounts) {

  let fnd;
  const owner = accounts[0];

  beforeEach(async function () {
    fnd = await FND.new("FundRequest", "FND", 666000000000000000000, 18, true);
    await fnd.setReleaseAgent(owner);
    await fnd.releaseTokenTransfer();
  });
});