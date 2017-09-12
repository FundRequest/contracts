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

  it('should have correct owner', function () {
    return fnd.owner.call().then(function (res) {
      expect(res).to.equal(owner)
    });
  });

  /* methods concerning release-agents and releasing */

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


  it('should set minting to finished once we released the token', function () {
    return fnd.setReleaseAgent(owner).then(function (res) {
        return fnd.mintingFinished.call();
      }).then(function (res) {
        expect(res).to.be.false;
        return fnd.releaseTokenTransfer();
      })
      .then(function (res) {
        return fnd.released.call();
      }).then(function (res) {
        expect(res).to.be.true;
        return fnd.mintingFinished.call();
      })
      .then(function (res) {
        expect(res).to.be.true;
      });
  });

  /* methods concerning transfer agents */

  it('shouldnt have anyone as releaseagent by default', function () {

    return fnd.transferAgents.call(owner)
      .then(function (res) {
        expect(res).to.be.false;
      });
  });

  it('should be possible to set release agent', function () {
    return fnd.setTransferAgent(owner, true, {
      from: owner
    }).then(function (res) {
      return fnd.transferAgents.call(owner);
    }).then(function (res) {
      expect(res).to.be.true;
    });
  });

});