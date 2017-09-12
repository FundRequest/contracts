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
            .then(function () {
                fnd.setReleaseAgent(owner);
            }).then(function () {
                fnd.releaseTokenTransfer();
            })
            .then(done);
    });

    it('should be possible to transfer tokens', function () {
        var receiver = accounts[1];
        return fnd.transfer(receiver, 23)
            .then(function (res) {
                return fnd.balanceOf.call(receiver);
            }).then(function (res) {
                expect(res.toString()).to.equal('23');
            });
    });
});