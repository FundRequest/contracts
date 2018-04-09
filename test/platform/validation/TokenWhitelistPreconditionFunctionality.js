const TOKEN_WHITELIST_PRECONDITION = artifacts.require('./platform/validation/TokenWhitelistPrecondition.sol');
const expect = require('chai').expect;

contract('FundRequestContract', function (accounts) {

	let tokenWhitelistPrecondition;
	const owner = accounts[0];
	const token = accounts[1];
	const funder = accounts[2];

	let createPrecondition = async function (active = true) {
		tokenWhitelistPrecondition = await TOKEN_WHITELIST_PRECONDITION.new('TokenWhitelistPrecondition', 1, active);
	};

	beforeEach(async function () {
		await createPrecondition();
	});

	it('isValid should return false when nothing is allowed', async function () {
		let isValid = await tokenWhitelistPrecondition.isValid(web3.fromAscii('GITHUB'), '1', token, 1, funder);
		expect(isValid).to.be.false;
	});

	it('isValid should return true when not active', async function () {
		await createPrecondition(false);
		let isValid = await tokenWhitelistPrecondition.isValid(web3.fromAscii('GITHUB'), '1', token, 1, funder);
		expect(isValid).to.be.true;
	});

	it('isValid should return true for default whitelisted token', async function () {
		await tokenWhitelistPrecondition.allowDefaultToken(token, true);
		let isValid = await tokenWhitelistPrecondition.isValid(web3.fromAscii('GITHUB'), '1', token, 1, funder);
		expect(isValid).to.be.true;
	});

	it('isValid should return false when default whitelisted token is not allowed', async function () {
		await tokenWhitelistPrecondition.allowDefaultToken(token, false);
		let isValid = await tokenWhitelistPrecondition.isValid(web3.fromAscii('GITHUB'), '1', token, 1, funder);
		expect(isValid).to.be.false;
	});

	it('isValid should return true for whitelisted token for specific organization', async function () {
		let platform = web3.fromAscii('GITHUB');
		let platformId = 'organization1|FR|repository|FR|pullrequest-1';
		await tokenWhitelistPrecondition.allow(platform, 'organization1', token, true);
		let isValid = await tokenWhitelistPrecondition.isValid(platform, platformId, token, 1, funder);
		expect(isValid).to.be.true;
	});

	it('isValid should return true for whitelisted token for specific organization (implicitly)', async function () {
		let platform = web3.fromAscii('GITHUB');
		let platformId = 'organization1|FR|repository|FR|pullrequest-1';
		await tokenWhitelistPrecondition.allow(platform, 'organization2', token, true);
		let isValid = await tokenWhitelistPrecondition.isValid(platform, platformId, token, 1, funder);
		expect(isValid).to.be.false;
	});

	it('isValid should return false for whitelisted token for specific organization when not allowed (explicitly)', async function () {
		let platform = web3.fromAscii('GITHUB');
		let platformId = 'organization2|FR|repository|FR|pullrequest-1';
		await tokenWhitelistPrecondition.allow(platform, 'organization2', token, false);
		let isValid = await tokenWhitelistPrecondition.isValid(platform, platformId, token, 1, funder);
		expect(isValid).to.be.false;
	});

});