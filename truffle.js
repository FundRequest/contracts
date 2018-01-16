fs = require('fs');

const HDWalletProvider = require("truffle-hdwallet-provider");

const getMnemonic = function (env) {
  try {
    //var mnemonic = fs.readFileSync('./config/' + env + '/mnemonic').toString()
    //console.log("using predefined mnemonic for network " + env + ", value :" + mnemonic);
    return "dead fish racket soul plunger dirty boats cracker mammal nicholas cage";
  } catch (exception) {
    console.log('Error getting mnemonic');
    return "fundrequest"
  }
};

const getSecret = function () {
  try {
    return fs.readFileSync('./config/secrets/infura-token.js').toString();
  } catch (ex) {
    return "";
  }
};

module.exports = {

  networks: {
    development: {
      network_id: '*',
      host: "localhost",
      port: 8545,
    },
    local: {
      provider: new HDWalletProvider(getMnemonic('local'), "http://localhost:8545/"),
      network_id: '*',
    },
    kovan: {
      network_id: '42',
      host: "https://kovan.infura.io/" + getSecret(),
      provider: new HDWalletProvider(getMnemonic('kovan'), "https://kovan.infura.io/" + getSecret())
    },
    ropsten: {
      network_id: '3',
      host: "https://ropsten.infura.io/",
      provider: new HDWalletProvider(getMnemonic('ropsten'), "https://ropsten.infura.io/" + getSecret())
    },
    rinkeby: {
      network_id: '4',
      host: "https://rinkeby.infura.io/" + getSecret(),
      provider: new HDWalletProvider(getMnemonic('rinkeby'), "https://rinkeby.infura.io/" + getSecret())
    },
    rinkeby_local: {
      network_id: '4',
      host: "localhost",
      port: 8545,
      gas: 4612388
    },
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};