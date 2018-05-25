const Platform = artifacts.require("./platform/FundRequestContract.sol");

const TokenWhitelistPrecondition = artifacts.require('./platform/validation/TokenWhitelistPrecondition.sol');

module.exports = async function (deployer) {
  return deployer.deploy(TokenWhitelistPrecondition, 'token-whitelist', 2, true);
};