const PRICING_STRATEGY = artifacts.require('./crowdsale/FlatPricingStrategy.sol');
const expect = require('chai').expect;

contract('FundRequestToken', function (accounts) {

  let pricingStrategy;
  const owner = accounts[0];

  beforeEach(async function () {
    pricingStrategy = await PRICING_STRATEGY.new(5);
  });

  it('should correcty calculate price', async function(){
   let price = await pricingStrategy.calculatePrice(5, 0, 0, owner, 18);
   expect(price.toNumber()).to.equal(Math.pow(1, 18));
  });
});