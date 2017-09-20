const FND = artifacts.require('./token/FundRequestToken.sol');
const CROWDSALE = artifacts.require('./crowdsale/MintedEthCappedCrowdsale.sol');
const PRICING_STRATEGY = artifacts.require('./crowdsale/FlatPricingStrategy.sol');
const expect = require('chai').expect;

contract('FundRequestToken', function (accounts) {

  let fnd;
  let pricingStrategy;
  let crowdsale;
  const owner = accounts[0];

  beforeEach(async function () {
    fnd = await FND.new("FundRequest", "FND", 666000000000000000000, 18, true);

    crowdsale = await CROWDSALE.new('')
  });
});