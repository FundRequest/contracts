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


  it('should be possible to set fundrequest contract address as owner', async function () {
    const contractAddr = accounts[1];
    await fnd.setFundRequestContractAddress(contractAddr, {
      from: accounts[0]
    });
    let result = await fnd.fundRequestContract.call();
    expect(result).to.equal(contractAddr);
  });

  it('should not be possible to set fundrequest contract address non-owner', async function () {
    const contractAddr = accounts[2];
    try {
      await fnd.setFundRequestContractAddress(contractAddr, {
        from: accounts[1]
      });
      assert.fail('call should never have come here');
    } catch (error) {
      assert(
        error.message.indexOf('invalid opcode') >= 0,
        'releaseTokenTransfer should throw an opCode exception.'
      );
    }
  });

  it('When funding, amount is transferred to fundrequest contract', async function () {
    // const contractAddr = accounts[1];
    // await fnd.setFundRequestContractAddress(contractAddr);
    // await fnd.transferFunding(132, 'data');
    // let balance = await fnd.balanceOf.call(contractAddr);
    // expect(balance.toString()).to.equal('132');
  });
});