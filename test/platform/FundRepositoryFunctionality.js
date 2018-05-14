const FRC = artifacts.require('./platform/FundRequestContract.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');
const FRC_FUND_REPO = artifacts.require('./token/repository/FundRepository.sol');
const FRC_CLAIM_REPO = artifacts.require('./token/repository/ClaimRepository.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');
const EternalStorage = artifacts.require('./storage/EternalStorage.sol');


import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

contract('FundRepositoryContract', function (accounts) {

  const expect = chai.expect;
  chai.use(chaiAsPromised);

  let frc;
  let fnd;
  let alternativeToken;
  let fundRepository;
  let claimRepository;
  let tokenFactory;
  let db;

  let fundData;

  const solverAddress = '0x35d80d4729993a4b288fd1e83bfa16b3533df524';


  const owner = accounts[0];

  let createToken = async function () {
    let newToken = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
    await newToken.changeController(owner);
    await newToken.generateTokens(owner, 666000000000000000000);
    await newToken.generateTokens(accounts[1], 666000000000000000000);
    return newToken;
  };

  beforeEach(async function () {
    tokenFactory = await TokenFactory.new();

    fnd = await createToken();
    alternativeToken = await createToken();

    db = await EternalStorage.new();

    fundRepository = await FRC_FUND_REPO.new(db.address);
    claimRepository = await FRC_CLAIM_REPO.new(db.address);

    await db.updateCaller(claimRepository.address, true);
    await db.updateCaller(fundRepository.address, true);

    frc = await FRC.new(fundRepository.address, claimRepository.address);

    await fundRepository.updateCaller(frc.address, true, {from: owner});
    await claimRepository.updateCaller(frc.address, true, {from: owner});
    await fnd.approve(frc.address, 1000000000000, {from: accounts[0]});
    await fnd.approve(frc.address, 1000000000000, {from: accounts[1]});
    await alternativeToken.approve(frc.address, 1000000000000, {from: accounts[0]});
    await alternativeToken.approve(frc.address, 1000000000000, {from: accounts[1]});

    await frc.setClaimSignerAddress('0xc31eb6e317054a79bb5e442d686cb9b225670c1d');

    fundData = {
      platform: 'GITHUB',
      platformId: '38',
      value: 1000,
      token: fnd.address,
      alternativeToken: alternativeToken.address
    };
  });

  it('should have the correct funders after funding once', async function () {
    await fund();

    let funderCount = await mapToNumber(fundRepository.getFunderCount(toBytes32(fundData.platform), fundData.platformId));
    expect(funderCount).to.equal(1);

    expect((await fundRepository.getFunderByIndex(toBytes32(fundData.platform), fundData.platformId, 0))).to.equal(owner);
    expect((await fundRepository.getFunderByIndex(toBytes32(fundData.platform), fundData.platformId, 1))).to.equal('0x0000000000000000000000000000000000000000');
  });

  it('should have the correct funders after funding twice with the same user', async function () {
    await fund();
    await fund();

    let funderCount = await mapToNumber(fundRepository.getFunderCount(toBytes32(fundData.platform), fundData.platformId));
    expect(funderCount).to.equal(1);

    expect((await fundRepository.getFunderByIndex(toBytes32(fundData.platform), fundData.platformId, 0))).to.equal(owner);
    expect((await fundRepository.getFunderByIndex(toBytes32(fundData.platform), fundData.platformId, 1))).to.equal('0x0000000000000000000000000000000000000000');
  });

  it('should have the correct funders after funding twice with the different users and same token', async function () {
    await fund({from: accounts[0]});
    await fund({from: accounts[1]});

    let funderCount = await mapToNumber(fundRepository.getFunderCount(toBytes32(fundData.platform), fundData.platformId));
    expect(funderCount).to.equal(2);

    expect((await fundRepository.getFunderByIndex(toBytes32(fundData.platform), fundData.platformId, 0))).to.equal(accounts[0]);
    expect((await fundRepository.getFunderByIndex(toBytes32(fundData.platform), fundData.platformId, 1))).to.equal(accounts[1]);
  });

  it('should have the correct funders after funding twice with the different users and different token', async function () {
    await fund({from: accounts[0]});
    await alternativeFund({from: accounts[1]});

    let funderCount = await mapToNumber(fundRepository.getFunderCount(toBytes32(fundData.platform), fundData.platformId));
    expect(funderCount).to.equal(2);

    expect((await fundRepository.getFunderByIndex(toBytes32(fundData.platform), fundData.platformId, 0))).to.equal(accounts[0]);
    expect((await fundRepository.getFunderByIndex(toBytes32(fundData.platform), fundData.platformId, 1))).to.equal(accounts[1]);
  });


  it('should have the correct balances after funding twice with the different users', async function () {
    await fund({from: accounts[0]});
    await fund({from: accounts[1]});

    let balance = await mapToNumber(fundRepository.balance(toBytes32(fundData.platform), fundData.platformId, fnd.address));
    expect(balance).to.equal(fundData.value * 2);
  });

  it('should have the correct balances after funding twice with the different tokens and the same user', async function () {
    await fund({from: accounts[0]});
    await alternativeFund({from: accounts[0]});

    let fndBalance = await mapToNumber(fundRepository.balance(toBytes32(fundData.platform), fundData.platformId, fnd.address));
    expect(fndBalance).to.equal(fundData.value);

    let alternativeTokenBalance = await mapToNumber(fundRepository.balance(toBytes32(fundData.platform), fundData.platformId, alternativeToken.address));
    expect(alternativeTokenBalance).to.equal(fundData.value);
  });

  it('should have the correct tokens after funding once', async function () {
    await fund();

    let tokenCount = await mapToNumber(fundRepository.getFundedTokenCount(toBytes32(fundData.platform), fundData.platformId));
    expect(tokenCount).to.equal(1);

    expect((await fundRepository.getFundedTokensByIndex(toBytes32(fundData.platform), fundData.platformId, 0))).to.equal(fnd.address);
    expect((await fundRepository.getFundedTokensByIndex(toBytes32(fundData.platform), fundData.platformId, 1))).to.equal('0x0000000000000000000000000000000000000000');
  });

  it('should have the correct balance for a funder after funding once', async () => {
    await fund();

    return expect(
      mapToNumber(fundRepository.amountFunded(toBytes32(fundData.platform), fundData.platformId, owner, fnd.address))
    ).to.eventually.equal(fundData.value);
  });

  it('should have the correct balance for a funder after funding twice', async () => {
    await fund();
    await fund();

    return expect(
      mapToNumber(fundRepository.amountFunded(toBytes32(fundData.platform), fundData.platformId, owner, fnd.address))
    ).to.eventually.equal(fundData.value * 2);
  });

  it('should have the correct balance for a token after funding once', async () => {
    await fund();

    return expect(
      mapToNumber(fundRepository.balance(toBytes32(fundData.platform), fundData.platformId, fnd.address))
    ).to.eventually.equal(fundData.value);
  });

  it('should have the correct balance for a token after funding twice', async () => {
    await fund();
    await fund();

    return expect(
      mapToNumber(fundRepository.balance(toBytes32(fundData.platform), fundData.platformId, fnd.address))
    ).to.eventually.equal(fundData.value * 2);
  });

  it('after claiming, the issue should be resolved', async () => {
    await fund();

    await expect(
      fundRepository.issueResolved(toBytes32(fundData.platform), fundData.platformId)
    ).to.eventually.equal(false);

    await claim();

    return expect(
      fundRepository.issueResolved(toBytes32(fundData.platform), fundData.platformId)
    ).to.eventually.equal(true);
  });




  const claim = async function () {
    await frc.claim(
      web3.fromAscii(fundData.platform),
      fundData.platformId,
      'davyvanroy',
      solverAddress,
      '0xdc440aac3d6057083e194dc26750c897790c63282f92dd1d7421b6e401de7178',
      '0x531fa36ad434e377f72ce5b16399c57f0cb17ecd03cc2e631d3150d301ca0d3a',
      28);
  };

  const fund = function (extraData) {
    return frc.fund(web3.fromAscii(fundData.platform), fundData.platformId, fundData.token, fundData.value, extraData);
  };

  const alternativeFund = function (extraData) {
    return frc.fund(web3.fromAscii(fundData.platform), fundData.platformId, fundData.alternativeToken, fundData.value, extraData);
  };

  const mapToNumber = function (promise) {
    return promise.then(x => x.toNumber());
  };

  let toBytes32 = function (input) {
    return web3.fromAscii(input);
  };
});