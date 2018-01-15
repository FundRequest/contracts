const LTA = artifacts.require('./token/transfer/DefaultLimitedTransferAgent.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');

const expect = require('chai').expect;
const log = console.log;

contract('LimitedTransferMiniMeToken', function (accounts) {

  let fnd;
  let lta;
  let tokenFactory;
  let owner = accounts[0];
  let contractAddress = accounts[3];

  beforeEach(async function () {
    tokenFactory = await TokenFactory.new();
    lta = await LTA.new();
    await lta.setContractAddress(contractAddress);
    fnd = await FND.new(lta.address, tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
    await fnd.changeController(owner);
    await fnd.generateTokens(owner, 666000000000000000000);
  });

  it('should be possible to transfer tokens when limited transfers enabled from correct sender to contract', async function () {
    await lta.enableLimitedTransfers(true);
    await lta.updateLimitedTransferAddress(owner, true);
    await fnd.transfer(contractAddress, 23, {from: owner});
    let balance = await fnd.balanceOf.call(contractAddress);
    expect(balance.toString()).to.equal('23');
  });

  it('should be possible to transfer tokens when limited transfers enabled from contract to any address', async function () {
    await lta.enableLimitedTransfers(true);
    await fnd.generateTokens(contractAddress, 666000000000000000000);
    await fnd.transfer(accounts[1], 23, {from: contractAddress});
    let balance = await fnd.balanceOf.call(accounts[1]);
    expect(balance.toString()).to.equal('23');
  });

  it('should be possible to approve tokens when limited transfers enabled', async function () {
    await lta.enableLimitedTransfers(true);
    await lta.updateLimitedTransferAddress(accounts[1], true);
    await fnd.approve(contractAddress, 23, {from: accounts[1]});
    let balance = await fnd.allowance.call(accounts[1], contractAddress);
    expect(balance.toString()).to.equal('23');
  });

  it('should not be possible to approve tokens when limited transfers enabled with incorrect address', async function () {
    await lta.enableLimitedTransfers(true);
    try {
      await fnd.approve(contractAddress, 23, {from: accounts[1]});
      assert.fail('fnds should never have been approved');
    } catch (error) {
      assertInvalidOpCode(error);
    }
  });

  it('should be possible to transfer tokens from addresses with limited transfers enabled with correct address', async function () {
    await lta.enableLimitedTransfers(true);
    await lta.updateLimitedTransferAddress(accounts[0], true);
    await fnd.approve(contractAddress, 23, {from: accounts[0]});
    await fnd.transferFrom(accounts[0], accounts[2], 23, {from: contractAddress});
    let balance = await fnd.balanceOf.call(accounts[2]);
    expect(balance.toString()).to.equal('23');
  });


  function assertInvalidOpCode(error) {
    assert(
      error.message.indexOf('VM Exception while processing transaction: revert') >= 0,
      'This should fail'
    );
  }


});