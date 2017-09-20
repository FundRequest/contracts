const FND = artifacts.require('./token/FundRequestToken.sol');
const CROWDSALE = artifacts.require('./crowdsale/FundRequestCrowdsale.sol');
const expect = require('chai').expect;

contract('FundRequestToken', function (accounts) {

    let fnd;
    let crowdsale;
    const owner = accounts[0];
    let startBlock; 
    let hardCap = 10 * Math.pow(10, 18);
    let softCap = 1 * Math.pow(10, 18);

    beforeEach(async function () {
        startBlock = web3.eth.blockNumber;
        fnd = await FND.new("FundRequest", "FND", 0, 18, true);
        crowdsale = await CROWDSALE.new(fnd.address, accounts[0], getTimestamp(startBlock), getTimestamp(startBlock) + 3600, 1, hardCap, softCap);
        await fnd.setMintAgent(crowdsale.address, true);
    });

    it('contract should be set', function () {
        expect(crowdsale).to.not.be.null;
    });


    it('should not have reached the softcap at the start', async function () {
        let softcapReached = await crowdsale.softcapReached.call();
        expect(softcapReached).to.be.false;
    });

    it('should have reached the after investing the softcap in wei', async function () {
        await crowdsale.buy({from: accounts[1], value: web3.toWei(2 /* ether */)});
        let softcapReached = await crowdsale.softcapReached.call();
        expect(softcapReached).to.be.true;
    });

    function getTimestamp(block) {
        return web3.eth.getBlock(block).timestamp;
    }
});