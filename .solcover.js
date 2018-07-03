'use strict';

module.exports = {
  norpc: true,
  compileCommand: '../node_modules/.bin/truffle compile',
  testCommand: 'node --max-old-space-size=4096 ../node_modules/.bin/truffle test --network coverage',
  skipFiles: [
    'mocks',
    'Migrations.sol',
    'Migrations.sol',
    'utils/strings.sol',
    'token/MiniMeToken.sol',
    'factory/MiniMeTokenFactory.sol',
  ],
  copyNodeModules: true,
};