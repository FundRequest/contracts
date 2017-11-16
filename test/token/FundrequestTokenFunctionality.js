const FND = artifacts.require('./token/FundRequestToken.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol'); 

const expect = require('chai').expect;
const log = console.log;

contract('FundRequestToken', function (accounts) {

  let fnd;
  let tokenFactory;  
  let owner = accounts[0];

  beforeEach(async function () {
    tokenFactory = await TokenFactory.new();    
    fnd = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
    await fnd.changeController(owner);
    await fnd.generateTokens(owner, 666000000000000000000);
  });

  it('contract should be set', function () {
    expect(fnd).to.not.be.null;
  });

  it('should be a fundrequest token', async function () {
    let isFndToken = await fnd.isFundRequestToken.call();
    expect(isFndToken).to.be.true;
  });

  it('should have correct controller', async function () {
    let retOwner = await fnd.controller.call();
    expect(retOwner).to.equal(owner)
  });

  it('should be possible to approve tokens', async function () {
    await fnd.approve(accounts[0], 23, {from: accounts[1]});
    let balance = await fnd.allowance.call(accounts[1], accounts[0]);
    expect(balance.toString()).to.equal('23');
  });

  it('should be possible to approve tokens with already an approve balance', async function () {
    await fnd.approve(accounts[0], 23, {from: accounts[1]});
    await fnd.safeApprove(accounts[0], 23, 13, {from: accounts[1]});
    let balance = await fnd.allowance.call(accounts[1], accounts[0]);
    expect(balance.toString()).to.equal('13');
  });
});