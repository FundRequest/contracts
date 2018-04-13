'use strict';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


contract('FundRequestContract', function (accounts) {

	const TOKEN_WHITELIST_PRECONDITION = artifacts.require('./platform/validation/TokenWhitelistPrecondition.sol');

	const expect = chai.expect;
	chai.use(chaiAsPromised);

	let tokenWhitelistPrecondition;
	const token = accounts[1];
	const funder = accounts[2];

	let createPrecondition = async function (active = true) {
		tokenWhitelistPrecondition = await TOKEN_WHITELIST_PRECONDITION.new('TokenWhitelistPrecondition', 1, active);
	};

	beforeEach(async function () {
		await createPrecondition();
	});

	it('isValid should return false when nothing is allowed', async () => {
		expect(
			tokenWhitelistPrecondition.isValid(web3.fromAscii('GITHUB'), '1', token, 1, funder)
		).to.eventually.be.false;
	});

	it('isValid should return true when not active', async () => {
		await createPrecondition(false);
		expect(
			tokenWhitelistPrecondition.isValid(web3.fromAscii('GITHUB'), '1', token, 1, funder)
		).to.eventually.be.true;
	});

	it('isValid should return true for default whitelisted token', async () => {
		await tokenWhitelistPrecondition.allowDefaultToken(token, true);
		expect(
			tokenWhitelistPrecondition.isValid(web3.fromAscii('GITHUB'), '1', token, 1, funder)
		).to.eventually.be.true;
	});

	it('isValid should return false when default whitelisted token is not allowed', async () => {
		await tokenWhitelistPrecondition.allowDefaultToken(token, false);
		expect(
			tokenWhitelistPrecondition.isValid(web3.fromAscii('GITHUB'), '1', token, 1, funder)
		).to.eventually.be.false;
	});

	it('isValid should return true for whitelisted token for specific organization', async () => {
		let platform = web3.fromAscii('GITHUB');
		let platformId = 'organization1|FR|repository|FR|pullrequest-1';
		await tokenWhitelistPrecondition.allow(platform, 'organization1', token, true);
		expect(
			tokenWhitelistPrecondition.isValid(platform, platformId, token, 1, funder)
		).to.eventually.be.true;
	});

	it('isValid should return true for whitelisted token for specific organization (implicitly)', async () => {
		let platform = web3.fromAscii('GITHUB');
		let platformId = 'organization1|FR|repository|FR|pullrequest-1';
		await tokenWhitelistPrecondition.allow(platform, 'organization2', token, true);
		expect(
			tokenWhitelistPrecondition.isValid(platform, platformId, token, 1, funder)
		).to.eventually.be.false;
	});

	it('isValid should return false for whitelisted token for specific organization when not allowed (explicitly)', async () => {
		let platform = web3.fromAscii('GITHUB');
		let platformId = 'organization2|FR|repository|FR|pullrequest-1';
		await tokenWhitelistPrecondition.allow(platform, 'organization2', token, false);
		expect(
			tokenWhitelistPrecondition.isValid(platform, platformId, token, 1, funder)
		).to.eventually.be.false;
	});

	it('it should return values of all tokens', async () => {
		let platform = web3.fromAscii('GITHUB');
		await tokenWhitelistPrecondition.allow(platform, 'organization2', token, false);
		let newVar = (await tokenWhitelistPrecondition.amountOfTokens()).toNumber();
		expect(newVar).to.equal(1);
	});
});