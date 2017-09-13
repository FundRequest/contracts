const FND = artifacts.require('./token/FundRequestToken.sol');
const expect = require('chai').expect;
const log = console.log;

contract('FundRequestToken', function (accounts) {

    let fnd;
    let owner = accounts[0];

    beforeEach(async function () {
        fnd = await FND.new("FundRequest", "FND", 666000000000000000000, 18, true);
        await fnd.setMintAgent(accounts[0], true, {
            from: accounts[0]
        });
    });

    it('should not be possible to be mintagent if not allowed to be', async function () {
        let isMintAgent = await fnd.mintAgents.call(accounts[1]);
        expect(isMintAgent).to.be.false;
    });

    it('should be possible to set the mint agent', async function () {
        let isMintAgent = await fnd.mintAgents.call(accounts[0]);
        expect(isMintAgent).to.be.true;
    });

    it('should be possible to mint as a mintAgent', async function () {
        await fnd.mint(accounts[1], 20)
        let balance = await fnd.balanceOf.call(accounts[1]);
        expect(balance.toNumber()).to.equal(20);
    });

    it('should not be possible to mint as a non-mintAgent', async function () {
        try {
            await fnd.mint(accounts[2], 20, {
                from: accounts[1]
            })
            assert.fail('fnds should never have been minted');
        } catch (error) {
            assert(
                error.message.indexOf('invalid opcode') >= 0,
                'releaseTokenTransfer should throw an opCode exception.'
            );
        }
        let balance = await fnd.balanceOf.call(accounts[2]);
        expect(balance.toNumber()).to.equal(0);
    });
});