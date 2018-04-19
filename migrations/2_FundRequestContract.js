const FundrequestToken = artifacts.require("./token/FundRequestToken.sol");

const FundRepository = artifacts.require('./platform/repository/FundRepository.sol');
const ClaimRepository = artifacts.require('./platform/repository/ClaimRepository.sol');
const Platform = artifacts.require("./platform/FundRequestContract.sol");

const EternalStorage = artifacts.require('./storage/EternalStorage.sol');

const Strings = artifacts.require("./util/strings.sol");
const SafeMath = artifacts.require("./math/SafeMath.sol");

const TokenWhiteListPrecondition = artifacts.require('./platform/validation/TokenWhitelistPrecondition.sol');

module.exports = async function (deployer) {

  return deployer.deploy(FundrequestToken,
    0x0,
    0x0,
    0,
    'FundRequest',
    18,
    'FND',
    true).then(function () {
    return FundrequestToken.deployed()
      .then(function (token) {
        return deployer.deploy(EternalStorage)
          .then(function () {
            return EternalStorage.deployed()
              .then(function (db) {
                return deployer.deploy(ClaimRepository, db.address)
                  .then(function () {
                    return deployer.deploy(FundRepository, db.address)
                      .then(function () {
                        return ClaimRepository.deployed()
                          .then(function (claim) {
                            return FundRepository.deployed()
                              .then(function (fund) {
                                return deployer.deploy(Platform,
                                  fund.address,
                                  claim.address
                                ).then(function () {
                                  return Platform.deployed()
                                    .then(function (platform) {
                                      return claim.updateCaller(platform.address, true)
                                        .then(function () {
                                          return fund.updateCaller(platform.address, true)
                                            .then(function () {
                                              return db.updateCaller(claim.address, true);
                                            });
                                        });
                                    });
                                });
                              })
                          });
                      });
                  });
              });
          });
      });
  });
};