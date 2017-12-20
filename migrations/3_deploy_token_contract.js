const SafeMath = artifacts.require("./math/SafeMath.sol");
const FundRequestToken = artifacts.require("./token/FundRequestToken.sol");
const DefaultLimitedTransferAgent = artifacts.require("./token/transfer/DefaultLimitedTransferAgent.sol");

module.exports = function (deployer, network, accounts) {

  deployer.deploy(FundRequestToken,
    DefaultLimitedTransferAgent.address,
    0x0,
    0x0,
    0,
    "FundRequest",
    18,
    "FND",
    true
  );
};