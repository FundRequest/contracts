require('dotenv').config();
const fs = require('fs');
const sign = require('ethjs-signer').sign;
const SolidityFunction = require('web3/lib/web3/function');
const _ = require('lodash');
const Web3 = require('web3');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('https://mainnet.fundrequest.io'));
web3.eth.getTransactionReceiptMined = require("./getTransactionReceiptMined.js");

const p_key = process.env.PRIVATE_KEY;


const getAbi = require('./Crowdsale.js');


const solidityFunction = new SolidityFunction('', _.find(getAbi(), {name: 'allowMultiple'}), '');

const doThings = function (whitelisted, _callback) {
	let payloadData = solidityFunction.toPayload([whitelisted, 3]).data;

	web3.eth.getTransactionCount('0x0020d8f4052358ee01ef8d4164e5c97c95744235', function (_, nonce) {
		web3.eth.sendRawTransaction(sign({
			to: '0xbcc546eb5a290977180f85cafaa712019893729c',
			value: 0,
			gas: 3000000,
			data: payloadData,
			gasPrice: 4000000000,
			nonce: nonce
		}, p_key), function (_, txHash) {
			if (_) {
				console.log(_);
				_callback(null);
			} else {
				console.log('[sending] Transaction Hash', txHash);
				web3.eth.getTransactionReceiptMined(txHash).then(function (txHash) {
					console.log(txHash);
					_callback(txHash);
				});
			}
		});
	});
};


let iterate = function (lines) {
	let whitelisted = [];
	for (let i = 0; i < 100; i++) {
		if(lines.length > 0) {
			whitelisted.push(lines.pop())
		}
	}

	doThings(whitelisted, function (_callback) {
		if (lines.length > 0) {
			iterate(lines);
		}
	})
};

fs.readFile('csv/usa2.csv', 'utf8', function (err, data) {
	if (err) throw err;
	iterate(data.split('\n'));
});