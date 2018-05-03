module.exports = function getAbi() {
	return [
    {
      "constant": false,
      "inputs": [
        {
          "name": "_tokenAddress",
          "type": "address"
        },
        {
          "name": "_beneficiaries",
          "type": "address[]"
        },
        {
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "batchTransferFixedAmount",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_tokenAddress",
          "type": "address"
        },
        {
          "name": "_beneficiaries",
          "type": "address[]"
        },
        {
          "name": "_amounts",
          "type": "uint256[]"
        }
      ],
      "name": "batchTransfer",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]};