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

  it('should be a fundrequest token', function () {
    return fnd.isFundRequestToken.call().then(function (res) {
      expect(res).to.be.true;
    });
  });

  it('should have correct owner', function () {
    return fnd.owner.call().then(function (res) {
      expect(res).to.equal(owner)
    });
  });

});