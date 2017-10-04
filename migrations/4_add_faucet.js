const SafeMath = artifacts.require("./math/SafeMath.sol");

const Faucet = artifacts.require("./faucet/FundRequestFaucet.sol");
const DefaultFundrequestToken = artifacts.require("./token/DefaultFundRequestToken.sol");

module.exports = function (deployer, network, accounts) {
    if (network == "rinkeby" || network == "development" || network == "local") {
        console.log("We'll need a faucet");
        deployer.link(SafeMath, Faucet);
        deployer.deploy(Faucet, DefaultFundrequestToken.address);

        deployer.then(function () {
            DefaultFundrequestToken.deployed().then(function (instance) {
                instance.setMintAgent(
                    Faucet.address, true, {from: accounts[0]}
                );
            });
        });
    } else {
        console.log(network + ": don't need a faucet");
    }
};