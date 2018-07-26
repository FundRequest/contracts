const Migrations = artifacts.require("./Migrations.sol");
const FundRepository = artifacts.require('./platform/repository/FundRepository.sol');
const ClaimRepository = artifacts.require('./platform/repository/ClaimRepository.sol');
const Platform = artifacts.require("./platform/FundRequestContract.sol");
const EternalStorage = artifacts.require('./storage/EternalStorage.sol');

module.exports = function(deployer, network) {

  return deployer.deploy(Migrations)
    .then(function (migration) {
      let eternalStorageAddress;

      if (network === 'test') {
        eternalStorageAddress = '0x1e5370467e0fa38de1902fa02ed8096b7a81ba74';
      } else if (network === 'staging') {
        eternalStorageAddress = '0xea4f67d52771e177037c5787e3d73c5eca0d83ae';
      } else if (network === 'mainnet') {
        eternalStorageAddress = '0x0821d33c50d2d2d1381b5dfca34900bacad909a7';
      } else {
        console.log("unknown network");
        return;
      }

      return EternalStorage.at(eternalStorageAddress)
        .then(function (eternalStorage) {
          return deployer.deploy(FundRepository, eternalStorageAddress)
            .then(function (fund) {
              return deployer.deploy(ClaimRepository, eternalStorageAddress)
                .then(function (claim) {
                  return deployer.deploy(Platform, fund.address, claim.address)
                    .then(function (platform) {
                      return claim.updateCaller(platform.address, true)
                        .then(function () {
                          return fund.updateCaller(platform.address, true)
                            .then(function () {
                              return eternalStorage.updateCaller(claim.address, true);
                            }).then(function () {
                              return eternalStorage.updateCaller(fund.address, true);
                            });
                        });
                    });
                });
            });
        });
    });
};