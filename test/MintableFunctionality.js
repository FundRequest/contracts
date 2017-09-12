var FND = artifacts.require('./token/FundRequestToken.sol');
var expect = require('chai').expect;
var log = console.log;

contract('FundRequestToken', function (accounts) {

    var fnd;
    var owner = accounts[0];

    beforeEach(function (done) {
        FND.new("FundRequest",
                "FND",
                666000000000000000000,
                18,
                true).then(function (instance) {
                fnd = instance;
            })
            .then(done);
    });

    it('contract should be set', function () {
        expect(fnd).to.not.be.null;
    });


    it('should not be possible to be mintagent if not allowed to be', function () {
        return fnd.setMintAgent(accounts[0], true, {
            from: accounts[0]
        }).then(function (res) {
            return fnd.mintAgents.call(accounts[1]);
        }).then(function (res) {
            console.log("should be false: " + res);
            expect(res).to.be.false;
        });
    });

    it('should be possible to set the mint agent', function () {
        return fnd.setMintAgent(accounts[0], true, {
            from: accounts[0]
        }).then(function (res) {
            return fnd.mintAgents.call(accounts[0]);
        }).then(function (res) {
            console.log("should be true: " + res);
            expect(res).to.be.true;
        });
    });

    it('should be possible to mint as a mintAgent', function () {
        return fnd.setMintAgent(accounts[0], true, {
            from: accounts[0]
        }).then(function (res) {
            return fnd.mint(accounts[1], 20);
        }).then(function (res) {
            return fnd.balanceOf.call(accounts[1]);
        }).then(function (res) {
            expect(res.toNumber()).to.equal(20);
        });
    });

    it('should not be possible to mint as a non-mintAgent', function () {
        return fnd.setMintAgent(accounts[0], true, {
                from: accounts[0]
            }).then(function (res) {
                return fnd.mint(accounts[2], 20, {
                    from: accounts[1]
                });
            }).catch(log)
            .then(function (res) {
                return fnd.balanceOf.call(accounts[2]);
            }).then(function (res) {
                expect(res.toNumber()).to.equal(0);
            });
    });
});