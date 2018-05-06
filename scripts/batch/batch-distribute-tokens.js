require('dotenv').config();
const fs = require('fs');
const sign = require('ethjs-signer').sign;
const SolidityFunction = require('web3/lib/web3/function');
const _ = require('lodash');
const Web3 = require('web3');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('https://kovan.fundrequest.io'));
web3.eth.getTransactionReceiptMined = require("./getTransactionReceiptMined.js");

const p_key = process.env.PRIVATE_KEY;
const p_address = '0xB3eC406B6338513A9396948Ba7de91ae572fd52f';
const p_contract = '0x2e185e709c3c670a5ab75448Aa3431124B2c1DEa';
const p_token = '0x02F96eF85cAd6639500CA1cc8356F0b5CA5bF1D2';

const logFile = 'debug_' + Date.now() + ".log";

const getAbi = require('./ERC20BatchTransfer.js');

const solidityFunction = new SolidityFunction('', _.find(getAbi(), {name: 'batchTransfer'}), '');

const doThings = function (ids, fromAddresses, amounts, _callback) {
  let payloadData = solidityFunction.toPayload([p_token, fromAddresses, amounts]).data;

  web3.eth.getTransactionCount(p_address, function (_, nonce) {
    web3.eth.sendRawTransaction(sign({
      to: p_contract,
      value: 0,
      gas: 4000000,
      data: payloadData,
      gasPrice: 1000000000,
      nonce: nonce
    }, p_key), function (_, txHash) {
      if (_) {
        console.log(_);
        _callback(null);
      } else {
        // console.log('[sending] Transaction Hash', txHash);
        web3.eth.getTransactionReceiptMined(txHash).then(function (txHash) {
          console.log(txHash);
          fromAddresses.forEach(function (value, i) {
            logToFile(ids[i] + "," + value + "," + amounts[i] + "," + txHash.transactionHash + "\n");
            // console.log(output);
          });
          _callback(txHash);
        });
      }
    });
  });
};

let logToFile = function (data) {
  fs.appendFile(logFile, data, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

  })
};


let iterate = function (lines) {
  let ids = [];
  let fromAddresses = [];
  let amounts = [];
  for (let i = 0; i < 100; i++) {
    if (lines.length > 0) {
      let line = lines.pop();
      let transfer = line.split(",");
      ids.push(transfer[0]);
      fromAddresses.push(transfer[1]);
      amounts.push(web3.toWei(transfer[2], 'ether'));
    }
  }

  doThings(ids, fromAddresses, amounts, function (_callback) {
    if (lines.length > 0) {
      iterate(lines);
    }
  })
};

fs.readFile('transfers.csv', 'utf8', function (err, data) {
  if (err) throw err;
  iterate(data.split('\n'));
});
