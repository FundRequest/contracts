const FND = artifacts.require('./token/FundRequestToken.sol');
const LTA = artifacts.require('./token/transfer/DefaultLimitedTransferAgent.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');

const expect = require('chai').expect;
const log = console.log;

contract('MiniMeToken', function (accounts) {

  let fnd;
  let lta;
  let tokenFactory;
  let owner = accounts[0];

  beforeEach(async function () {
    tokenFactory = await TokenFactory.new();
    lta = await LTA.new();
    await lta.enableLimitedTransfers(false);
    fnd = await FND.new(lta.address, tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
    await fnd.changeController(owner);
    await fnd.generateTokens(owner, 666000000000000000000);
  });

  it('should be possible to transfer tokens', async function () {
    await fnd.transfer(accounts[1], 23, {from: owner});
    let balance = await fnd.balanceOf.call(accounts[1]);
    expect(balance.toString()).to.equal('23');
  });


  it('should be possible to approve', async function () {
    await fnd.approve(accounts[1], 23, {from: accounts[0]});
    let balance = await fnd.allowance.call(accounts[0], accounts[1]);
    expect(balance.toString()).to.equal('23');
  });

  it('should be possible to transferFrom', async function () {
    await fnd.approve(accounts[1], 23, {from: accounts[0]});
    await fnd.transferFrom(accounts[0], accounts[2], 23, {from: accounts[1]});
    let balance = await fnd.balanceOf.call(accounts[2]);
    expect(balance.toString()).to.equal('23');
  });

  function assertInvalidOpCode(error) {
    assert(
      error.message.indexOf('VM Exception while processing transaction: revert') >= 0,
      'This should fail.'
    );
  }

});