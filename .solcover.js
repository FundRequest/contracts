'use strict';

module.exports = {
  port: 8555,
  testrpcOptions: '-p 8555 -u 0x54fd80d6ae7584d8e9a19fe1df43f04e5282cc43',
  testCommand: 'mocha --timeout 5000',
  norpc: true,
  skipFiles: [
    'mocks',
    'Migrations.sol',
    'Migrations.sol',
    'utils/strings.sol',
    'token/MiniMeToken.sol',
    'factory/MiniMeTokenFactory.sol',
    'crowdsale/FundRequestTokenGeneration.sol',
    'token/*.sol',
    'utils/strings.sol'
  ]
};