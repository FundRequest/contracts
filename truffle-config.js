const HDWalletProvider = require("truffle-hdwallet-provider");
const PrivateKeyProvider = require('truffle-privatekey-provider');

require('dotenv').config();
'use strict';

require('babel-register')({
	only: '/test/'
});
require('babel-polyfill');



const mochaGasSettings = {
  reporter: 'eth-gas-reporter',
  reporterOptions : {
    currency: 'USD',
    gasPrice: 3
  }
}

const mocha = process.env.GAS_REPORTER ? mochaGasSettings : {};

module.exports = {
	networks: {
		development: {
			network_id: '*',
			host: "localhost",
			port: 8545,
		},
		staging: {
			network_id: '42',
			provider: new HDWalletProvider(process.env.MNEMONIC, "https://kovan.fundrequest.io/")
		},
		test: {
			network_id: '42',
			provider: new HDWalletProvider(process.env.MNEMONIC, "https://kovan.fundrequest.io/")
		},
		mainnet: {
			network_id: '1',
      provider: new HDWalletProvider(process.env.MNEMONIC_MAINNET, "https://mainnet.fundrequest.io"),
			from: process.env.MAINNET_FROM,
			gas: 4612388,
			gasPrice: 23000000000
		},
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,
      gas: 0xffffffffff,
      gasPrice: 0x01
    }
	},
	build: {},
	mocha,
};