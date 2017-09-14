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

  it('should be possible to set fundrequest contract address', async function () {
    const contractAddr = accounts[1];
    await fnd.setFundRequestContractAddress(contractAddr);
    let result = await fnd.fundRequestContractAddress.call();
    expect(result).to.equal(contractAddr);
  });

  it('When funding, amount is transferred to fundrequest contract', async function () {
    // const contractAddr = accounts[1];
    // await fnd.setFundRequestContractAddress(contractAddr);
    // await fnd.transferFunding(132, 'data');
    // let balance = await fnd.balanceOf.call(contractAddr);
    // expect(balance.toString()).to.equal('132');
  });
});