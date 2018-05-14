module.exports = {
  toBytes32: function (input) {
    return web3.fromAscii(input);
  },
  assertInvalidOpCode:  function(error) {
    assert(
      error.message.indexOf('VM Exception while processing transaction: revert') >= 0,
      'this should fail.' + error
    );
  },
  assertNonPayable:  function(error) {
    assert(
      error.message.indexOf('Cannot send value to non-payable function') >= 0,
      'this should fail.' + error
    );
  }
};