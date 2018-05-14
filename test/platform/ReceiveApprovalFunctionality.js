const FRC = artifacts.require('./token/FundRequestContract.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');
const FRC_FUND_REPO = artifacts.require('./token/repository/FundRepository.sol');
const FRC_CLAIM_REPO = artifacts.require('./token/repository/ClaimRepository.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');
const EternalStorage = artifacts.require('./storage/EternalStorage.sol');

const expect = require('chai').expect;

contract('ReceiveApprovalFunctionality', function (accounts) {

  let frc;
  let fnd;
  let fundRepository;
  let claimRepository;
  let tokenFactory;
  let db;

  const owner = accounts[0];

  let createToken = async function () {
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
  });

  it('should be possible to come in with approveAndCall', async function () {
    let amount = tokens(1);
    let platform = "github";
    let platformId = "1";

    await fnd.approveAndCall(frc.address, amount, web3.fromAscii(platform + "|AAC|" + platformId), {from: owner});

    let bal = await fundRepository.balance.call(web3.fromAscii(platform), platformId, fnd.address);
    expect(bal.toNumber()).to.equal(amount);
    let fundInfo = await fundRepository.getFundInfo.call(web3.fromAscii(platform), platformId, owner, fnd.address);
    expect(fundInfo[0].toNumber()).to.equal(1);
    expect(fundInfo[1].toNumber()).to.equal(amount);https://github.com/ethereum/EIPs/pull/681
    expect(fundInfo[2].toNumber()).to.equal(amount);
  });

  function tokens(_amount) {
    return _amount * Math.pow(10, 18);
  }
});