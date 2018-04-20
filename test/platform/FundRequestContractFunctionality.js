const FRC = artifacts.require('./platform/FundRequestContract.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');
const FRC_FUND_REPO = artifacts.require('./token/repository/FundRepository.sol');
const FRC_CLAIM_REPO = artifacts.require('./token/repository/ClaimRepository.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');
const EternalStorage = artifacts.require('./storage/EternalStorage.sol');

const expect = require('chai').expect;

contract('FundRequestContract', function (accounts) {

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
		await fnd.approve(frc.address, 1000);
	});

	let expectBalance = async function (data) {
		let bal = await fundRepository.balance.call(web3.fromAscii(data.platform), data.platformId, fnd.address);
		expect(bal.toNumber()).to.equal(data.value);
	};

	let fundRequest = async function (data) {
		await frc.fund(web3.fromAscii(data.platform), data.platformId, data.token, data.value);
	};

	it('should return 0 balance', async function () {
		await expectBalance({
			platform: "github",
			platformId: "1",
			value: 0
		});
	});

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
	it('should be able to fund an issue which updates the balance', async function () {
		let data = await fundDefaultRequest();
		await expectBalance(data);
	});

	it('should not be possible to fund 0 tokens', async function () {
		let data = {
			platform: "github",
			platformId: "1",
			value: 0,
			token: fnd.address
		};
		try {
			await fundRequest(data);
			assert.fail('should fail');
		} catch (error) {
			assertInvalidOpCode(error);
		}
	});


	it('should be able to query the fund information', async function () {
		let data = await fundDefaultRequest();
		let result = await fundRepository.getFundInfo.call(web3.fromAscii(data.platform), data.platformId, accounts[0], fnd.address);
		expect(result[0].toNumber()).to.equal(1);
		expect(result[1].toNumber()).to.equal(100);
		expect(result[2].toNumber()).to.equal(100);
	});

	function assertInvalidOpCode(error) {
		assert(
			error.message.indexOf('VM Exception while processing transaction: revert') >= 0,
			'this should fail.'
		);
	}
});