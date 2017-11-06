const SafeMath = artifacts.require("./math/SafeMath.sol");

const FundRequestToken = artifacts.require("./token/FundRequestToken.sol");
const TokenFactory = artifacts.require("./factory/MiniMeTokenFactory.sol");

module.exports = function (deployer, network, accounts) {

  deployer.deploy(TokenFactory).then(function(){
    deployer.deploy(FundRequestToken,
      TokenFactory.address,
      0x0,
      0,
      "FundRequest",
      18,
      "FND",
      true
    );
  });
};