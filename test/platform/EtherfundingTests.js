const EternalStorage = artifacts.require('./platform/storage/EternalStorage.sol');
const FRC = artifacts.require('./platform/FundRequestContract.sol');
const FRC_FUND_REPO = artifacts.require('./token/repository/FundRepository.sol');
const FRC_CLAIM_REPO = artifacts.require('./token/repository/ClaimRepository.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');

const utils = require('../TestUtils.js');
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

contract('FundRepositoryContract', function (accounts) {

  let db;
  let fnd;
  let tokenFactory;
  let fundRepository;
  let claimRepository;
  let frc;
  let fundData;

  let owner = accounts[0];

  const solverAddress = '0x35d80d4729993a4b288fd1e83bfa16b3533df524';

  const expect = chai.expect;
  chai.use(chaiAsPromised);


  let createToken = async () => {
    tokenFactory = await TokenFactory.new();
    fnd = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
    await fnd.changeController(owner);
    await fnd.generateTokens(owner, 666000000000000000000);
  };

  beforeEach(async () => {
    await createToken();
    db = await EternalStorage.new();

    fundRepository = await FRC_FUND_REPO.new(db.address);
    claimRepository = await FRC_CLAIM_REPO.new(db.address);

    await db.updateCaller(claimRepository.address, true);
    await db.updateCaller(fundRepository.address, true);

    frc = await FRC.new(fundRepository.address, claimRepository.address);
    await fundRepository.updateCaller(frc.address, true, {from: owner});
    await claimRepository.updateCaller(frc.address, true, {from: owner});

    await frc.setClaimSignerAddress('0xc31eb6e317054a79bb5e442d686cb9b225670c1d');

    await fnd.approve(frc.address, 10000);

    fundData = {
      platform: 'GITHUB',
      platformId: '38',
      value: 1000,
      ether: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      token: fnd.address
    };
  });

  it('should be possible to fund with ether by calling the etherFund function', async () => {

    let originalBalance = (await web3.eth.getBalance(frc.address)).toNumber();
    expect(originalBalance).to.equal(0);

    await frc.etherFund(utils.toBytes32(fundData.platform), fundData.platformId, {value: 1000});

    let tokenCount = (await fundRepository.getFundedTokenCount(utils.toBytes32(fundData.platform), fundData.platformId)).toNumber();
    expect(tokenCount).to.equal(1);

    let resultingBalance = (await web3.eth.getBalance(frc.address)).toNumber();
    expect(resultingBalance).to.equal(1000);
  });

  it('should not be possible to fund with 0 ether', async () => {
    try {
      await frc.etherFund(utils.toBytes32(fundData.platform), fundData.platformId, {value: 0});
      assert.fail('should never come here');
    } catch (error) {
      utils.assertInvalidOpCode(error);
    }

  });

  it('should not be possible to call fund with a different amount of ether than actually sent', async () => {
    try {
      await frc.fund(utils.toBytes32(fundData.platform), fundData.platformId, fundData.ether, 1000000000, {value: 0});
      assert.fail('should have failed');
    } catch (error) {
      utils.assertInvalidOpCode(error);
    }
  });

  it('should not be possible to call fund with ether', async () => {
    try {
      await frc.fund(utils.toBytes32(fundData.platform), fundData.platformId, fundData.ether, 1000, {value: 1000});
      assert.fail('should have failed');
    } catch (error) {
      utils.assertNonPayable(error);
    }
  });

  it('should be possible to claim', async () => {
    await frc.etherFund(utils.toBytes32(fundData.platform), fundData.platformId, {value: 1000});

    let originalBalance = (await web3.eth.getBalance(frc.address)).toNumber();
    expect(originalBalance).to.equal(1000);

    const claimEventWatcher = frc.Claimed();

    await frc.claim(
      web3.fromAscii(fundData.platform),
      fundData.platformId,
      'davyvanroy',
      solverAddress,
      '0xdc440aac3d6057083e194dc26750c897790c63282f92dd1d7421b6e401de7178',
      '0x531fa36ad434e377f72ce5b16399c57f0cb17ecd03cc2e631d3150d301ca0d3a',
      28);


    let resultingBalance = (await web3.eth.getBalance(frc.address)).toNumber();
    expect(resultingBalance).to.equal(0);

    const events = claimEventWatcher.get();
    expect(events[0].args.token).to.equal('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
    expect((await events[0].args.value).toNumber()).to.equal(1000);
  });

  it('should be possible to claim ether and tokens at the same time', async () => {
    await frc.etherFund(utils.toBytes32(fundData.platform), fundData.platformId, {value: 1000});
    await frc.fund(utils.toBytes32(fundData.platform), fundData.platformId, fundData.token, 5000, {value: 0});

    let originalBalance = (await web3.eth.getBalance(frc.address)).toNumber();
    expect(originalBalance).to.equal(1000);

    const claimEventWatcher = frc.Claimed();

    await frc.claim(
      web3.fromAscii(fundData.platform),
      fundData.platformId,
      'davyvanroy',
      solverAddress,
      '0xdc440aac3d6057083e194dc26750c897790c63282f92dd1d7421b6e401de7178',
      '0x531fa36ad434e377f72ce5b16399c57f0cb17ecd03cc2e631d3150d301ca0d3a',
      28);

    const events = claimEventWatcher.get();
    expect(events[0].args.token).to.equal('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
    expect((await events[0].args.value).toNumber()).to.equal(1000);
    expect(events[1].args.token).to.equal(fnd.address);
    expect((await events[1].args.value).toNumber()).to.equal(5000);

    let resultingBalance = (await web3.eth.getBalance(frc.address)).toNumber();
    expect(resultingBalance).to.equal(0);

    let resultingTokens = (await fnd.balanceOf(solverAddress)).toNumber();
    expect(resultingTokens).to.equal(5000);

  });
});