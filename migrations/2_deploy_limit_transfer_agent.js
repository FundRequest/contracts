const DefaultLimitedTransferAgent = artifacts.require("./token/transfer/DefaultLimitedTransferAgent.sol");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(DefaultLimitedTransferAgent);
};