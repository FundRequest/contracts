const FRC = artifacts.require('./token/FundRequestContract.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');
const FRC_FUND_REPO = artifacts.require('./token/repository/FundRepository.sol');
const FRC_CLAIM_REPO = artifacts.require('./token/repository/ClaimRepository.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');
const EternalStorage = artifacts.require('./storage/EternalStorage.sol');

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

contract('FundRequestContract', function (accounts) {

  const expect = chai.expect;
  chai.use(chaiAsPromised);

  let frc;
  let fnd;
  let fundRepository;
  let claimRepository;
  let tokenFactory;
  let db;

  let fundData;


  const solverAddress = '0x35d80d4729993a4b288fd1e83bfa16b3533df524';

  const owner = accounts[0];

  let createToken = async () => {
    tokenFactory = await TokenFactory.new();
    fnd = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
    await fnd.changeController(owner);
    await fnd.generateTokens(owner, 666000000000000000000);
  };

  beforeEach(async function () {
    await createToken();

    db = await EternalStorage.new();

    fundRepository = await FRC_FUND_REPO.new(db.address);
    claimRepository = await FRC_CLAIM_REPO.new(db.address);

    await db.updateCaller(claimRepository.address, true);
    await db.updateCaller(fundRepository.address, true);


    frc = await FRC.new(fundRepository.address, claimRepository.address);
    await fundRepository.updateCaller(frc.address, true, {from: owner});
    await claimRepository.updateCaller(frc.address, true, {from: owner});
    await fnd.approve(frc.address, 10000);
    await frc.setClaimSignerAddress('0xc31eb6e317054a79bb5e442d686cb9b225670c1d');

    fundData = {
      platform: 'GITHUB',
      platformId: '38',
      value: 1000,
      token: fnd.address
    };
  });

  it('should correctly update the FundRepository data after claiming one token', async () => {
    await fund();
    expect((await fundRepository.balance(web3.fromAscii(fundData.platform), fundData.platformId, fnd.address)).toNumber()).to.equal(1000);
    expect((await fundRepository.getFunderCount(web3.fromAscii(fundData.platform), fundData.platformId)).toNumber()).to.equal(1);

    await claim();

    expect((await fundRepository.issueResolved(web3.fromAscii(fundData.platform), fundData.platformId))).to.be.true;
    expect((await fundRepository.balance(web3.fromAscii(fundData.platform), fundData.platformId, fnd.address)).toNumber()).to.equal(0);
    expect((await fundRepository.getFunderCount(web3.fromAscii(fundData.platform), fundData.platformId)).toNumber()).to.equal(0);
  });


  it('should correctly transfer balances', async () => {
    await fund();

    await expectTokenBalance(solverAddress, 0);
    await expectTokenBalance(frc.address, 1000);

    await claim();

    await expectTokenBalance(frc.address, 0);
    await expectTokenBalance(solverAddress, 1000);
  });


  const fund = function (extraData) {
    return frc.fund(web3.fromAscii(fundData.platform), fundData.platformId, fundData.token, fundData.value, extraData);
  };

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

  const expectTokenBalance = async function (address, amount) {
    expect(
      (await fnd.balanceOf.call(address)).toNumber()
    ).to.equal(amount);
  };

  const mapToNumber = function (promise) {
    return promise.then(x => x.toNumber());
  };
});
