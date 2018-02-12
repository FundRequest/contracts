require('dotenv').config();
const fs = require('fs');
const sign = require('ethjs-signer').sign;
const SolidityFunction = require('web3/lib/web3/function');
const _ = require('lodash');
const Web3 = require('web3');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('https://ropsten.fundrequest.io'));
web3.eth.getTransactionReceiptMined = require("./getTransactionReceiptMined.js");

const p_key = process.env.PRIVATE_KEY;
const vw_address = process.env.VW_ADDRESS;


const getAbi = require('./Crowdsale.js');


const solidityFunction = new SolidityFunction('', _.find(getAbi(), {name: 'allowMultiple'}), '');

const doThings = function (whitelisted, _callback) {
	let payloadData = solidityFunction.toPayload([whitelisted, 4]).data;

	web3.eth.getTransactionCount('0xc31eb6e317054a79bb5e442d686cb9b225670c1d', function (_, nonce) {
		web3.eth.sendRawTransaction(sign({
			to: '0x93040a4f0fff7f975615ad69592631d207406d84',
			value: 0,
			gas: 3000000,
			data: payloadData,
			gasPrice: 20000000000,
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
			whitelisted.push(lines.pop().replace('​', ''))
		}
	}

	doThings(whitelisted, function (_callback) {
		if (lines.length > 0) {
			iterate(lines);
		}
	})
};

fs.readFile('csv/otters.csv', 'utf8', function (err, data) {
	if (err) throw err;
	iterate(data.split('\n'));
});