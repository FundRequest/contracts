'use strict';

module.exports = {
  norpc: true,
  compileCommand: 'npx truffle compile',
  testCommand: 'node --max-old-space-size=4096 ../node_modules/.bin/truffle test --network coverage',
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
  ],
  copyNodeModules: true,
};