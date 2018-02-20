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


const solidityFunction = new SolidityFunction('', _.find(getAbi(), {name: 'allocateTokens'}), '');

const doThings = function (address, amount, _callback) {
	let payloadData = solidityFunction.toPayload([address, amount]).data;

	web3.eth.getTransactionCount('0x0020d8f4052358ee01ef8d4164e5c97c95744235', function (_, nonce) {
		web3.eth.sendRawTransaction(sign({
			to: '0xbcc546eb5a290977180f85cafaa712019893729c',
			value: 0,
			gas: 500000,
			data: payloadData,
			gasPrice: 8000000000,
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
	let line = lines.pop();
	let allocation = line.split(",");
	if (allocation.length > 5) {
		let address = allocation[3];
		let tokensNotVested = allocation[4];

		console.log('allocating tokens for ' + address + ' -> ' + tokensNotVested * Math.pow(10, 18));

		doThings(address, tokensNotVested * Math.pow(10, 18), function (_callback) {
			console.log("Done for address: " + address);
			if (lines.length > 0) {
				iterate(lines);
			}
		});
	}
};

fs.readFile('csv/presale.csv', 'utf8', function (err, data) {
	if (err) throw err;
	iterate(data.split('\n'));
});