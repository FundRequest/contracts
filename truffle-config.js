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
		kovan: {
			network_id: '42',
			provider: new HDWalletProvider(process.env.MNEMONIC, "https://kovan.fundrequest.io/")
		},
		mainnet: {
			network_id: '1',
			host: "localhost",
			port: 8545,
			gas: 4612388
		}
	},
	mocha: {
		useColors: true
	}
};