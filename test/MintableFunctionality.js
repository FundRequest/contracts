var FND = artifacts.require('./token/FundRequestToken.sol');
var expect = require('chai').expect;
var log = console.log;

contract('FundRequestToken', function (accounts) {

  var fnd;
  var owner = '0xc31eb6e317054a79bb5e442d686cb9b225670c1d';

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

  it('should be possible to set release agent', function () {
    return fnd.setReleaseAgent(owner).then(function (res) {
      return fnd.releaseAgent.call();
    }).then(function (res) {
      expect(res).to.equal(owner)
    });
  });

  it('should be possible to release token transfer', function () {
    return fnd.setReleaseAgent(owner).then(function (res) {
      return fnd.releaseTokenTransfer();
    }).then(function (res) {
      return fnd.released.call();
    }).then(function (res) {
      expect(res).to.be.true;
    });
  });

  it('should be possible to set token contract address', function () {
    return fnd.setFrContractAddress('0x9f88c5cc76148d41a5db8d0a7e581481efc9667b').then(function (res) {
      return fnd.frContractAddress.call();
    }).then(function (res) {
      expect(res).to.equal('0x9f88c5cc76148d41a5db8d0a7e581481efc9667b');
    });
  });

  it('should be possible to transfer tokens', function () {
    var receiver = '0xbb97f342884ed086dd83a192c8a7e649e095db7b';
    fnd.setReleaseAgent(owner).then(function (res) {
      return fnd.releaseTokenTransfer();
    }).then(function (res) {
      return fnd.transfer(receiver, 23);
    }).then(function (res) {
      return fnd.balanceOf.call(receiver);
    }).then(function (res) {
      expect(res.toString()).to.equal('23');
    });
  });

});