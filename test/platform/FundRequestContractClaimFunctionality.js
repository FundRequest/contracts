const FRC = artifacts.require('./token/FundRequestContract.sol');
const FND = artifacts.require('./token/FundRequestToken.sol');
const FRC_REPO = artifacts.require('./token/repository/FundRepository.sol');
const TokenFactory = artifacts.require('./factory/MiniMeTokenFactory.sol');
const expect = require('chai').expect;

contract('FundRequestContract', function (accounts) {

	let frc;
	let fnd;
	let repository;
	let tokenFactory;
	const owner = accounts[0];

	let createToken = async function () {
		tokenFactory = await TokenFactory.new();
		fnd = await FND.new(tokenFactory.address, 0x0, 0, "FundRequest", 18, "FND", true);
		await fnd.changeController(owner);
		await fnd.generateTokens(owner, 666000000000000000000);
	};

	beforeEach(async function () {
		await createToken();

		repository = await FRC_REPO.new();
		frc = await FRC.new(fnd.address, repository.address);
		await repository.updateCaller(frc.address, true, {from: owner});
		await fnd.approve(frc.address, 10000);
		await frc.setClaimSignerAddress('0xc31eb6e317054a79bb5e442d686cb9b225670c1d');
	});


	let expectTokenBalance = async function (address, amount) {
		let bal = await fnd.balanceOf.call(address);
		expect(bal.toNumber()).to.equal(amount);
	};
	it('should be possible to claim a funded request', async function () {
		let fundData = {
			platform: 'GITHUB',
			platformId: '38',
			url: 'https://github.com',
			value: 1000
		};
		await frc.fund(web3.fromAscii(fundData.platform), web3.fromAscii(fundData.platformId), fundData.url, fundData.value);
		let solverAddress = '0x35d80d4729993a4b288fd1e83bfa16b3533df524';

		await frc.claim(
			web3.fromAscii(fundData.platform),
			web3.fromAscii(fundData.platformId),
			'davyvanroy',
			solverAddress,
			'0xdc440aac3d6057083e194dc26750c897790c63282f92dd1d7421b6e401de7178',
			'0x531fa36ad434e377f72ce5b16399c57f0cb17ecd03cc2e631d3150d301ca0d3a',
			28);

		await expectTokenBalance(frc.address, 0);
		await expectTokenBalance(solverAddress, 1000);

		let totalBalance = await frc.totalBalance.call();
		expect(totalBalance.toNumber()).to.equal(0);

		let totalFunded = await frc.totalFunded.call();
		expect(totalFunded.toNumber()).to.equal(1000);

		let totalNumberOfFunders = await frc.totalNumberOfFunders.call();
		expect(totalNumberOfFunders.toNumber()).to.equal(1);

		let requestsFunded = await frc.requestsFunded.call();
		expect(requestsFunded.toNumber()).to.equal(1);

	});

});