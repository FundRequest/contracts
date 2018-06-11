const FRC = artifacts.require('./platform/FundRequestContract.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');
const FRC_FUND_REPO = artifacts.require('./token/repository/FundRepository.sol');
const FRC_CLAIM_REPO = artifacts.require('./token/repository/ClaimRepository.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');
const EternalStorage = artifacts.require('./storage/EternalStorage.sol');

const expect = require('chai').expect;

const utils = require("ethereumjs-util");

contract('FundRequestContract', function (accounts) {

  let frc;
  let fnd;
  let fundRepository;
  let claimRepository;
  let tokenFactory;
  let db;

  const owner = accounts[0];
  const claimSignerAddress = "0x22813c64b97667adb77c66a4d0094b4b5ab81a1d";

  //PREP

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
    await fnd.approve(frc.address, 999999999999999999);

    await frc.updateCaller(accounts[1], true, {from: owner})
  });

  //TESTS

  it('should be possible to do a refundByUser with the correct signature', async function () {
    await fundDefaultRequest();

    await expectBalance({
      platform: "github",
      platformId: "1",
      value: 100
    });

    await frc.refund(web3.fromAscii("github"), "1", accounts[0], {from: accounts[1]});

    await expectBalance({
      platform: "github",
      platformId: "1",
      value: 0
    });
  });


  it('it should be possible to refund more than one fund', async function () {
    await fundDefaultRequest();
    await fundDefaultRequest();

    await expectBalance({
      platform: "github",
      platformId: "1",
      value: 200
    });

    await frc.refund(web3.fromAscii("github"), "1", accounts[0], {from: accounts[1]});

    await expectBalance({
      platform: "github",
      platformId: "1",
      value: 0
    });
  });


  it('refunding should put the user balance to 0 too', async function () {
    await fundDefaultRequest();


    let amountFundedBeforeRefund = await fundRepository.amountFunded(web3.fromAscii("github"), "1", accounts[0], fnd.address);
    expect(amountFundedBeforeRefund.toNumber()).to.equal(100);

    await frc.refund(web3.fromAscii("github"), "1", accounts[0], {from: accounts[1]});

    let amountFundedAfterRefund = await fundRepository.amountFunded(web3.fromAscii("github"), "1", accounts[0], fnd.address);
    expect(amountFundedAfterRefund.toNumber()).to.equal(0);
  });

  //UTILITY

  let expectBalance = async function (data) {
    let bal = await fundRepository.balance.call(web3.fromAscii(data.platform), data.platformId, fnd.address);
    expect(bal.toNumber()).to.equal(data.value);
  };

  function assertInvalidOpCode(error) {
    assert(
      error.message.indexOf('VM Exception while processing transaction: revert') >= 0,
      'this should fail.'
    );
  }

  let refundRequest = async () => {
    //await frc.refundByUser("github", "1", accounts[0], )
    return null;
  };

  let fundRequest = async function (data) {
    await frc.fund(web3.fromAscii(data.platform), data.platformId, data.token, data.value);
  };

  let fundDefaultRequest = async function () {
    let data = {
      platform: "github",
      platformId: "1",
      token: fnd.address,
      value: 100
    };
    await fundRequest(data);
    return data;
  };

  let createToken = async function () {
    tokenFactory = await TokenFactory.new();
    fnd = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
    await fnd.changeController(owner);
    await fnd.generateTokens(owner, 666000000000000000000);
  };
});