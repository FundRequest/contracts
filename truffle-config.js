require('dotenv').config();
'use strict';

require('babel-register')({
	only: '/test/'
});
require('babel-polyfill');

const HDWalletProvider = require("truffle-hdwallet-provider");

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
		}
	},
	mocha: {
		useColors: true
	}
};