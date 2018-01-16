const FundRequestToken = artifacts.require("./token/FundRequestToken.sol");

module.exports = function (deployer, network, accounts) {

  deployer.deploy(FundRequestToken,
    0x0,
    0x0,
    0,
    "FundRequest",
    18,
    "FND",
    true
  );
};