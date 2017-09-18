const PRICING_STRATEGY = artifacts.require('./crowdsale/FlatPricingStrategy.sol');
const expect = require('chai').expect;

contract('FundRequestToken', function (accounts) {

  let pricingStrategy;
  const owner = accounts[0];

  beforeEach(async function () {
    console.log((1 * Math.pow(10, 18)/1235));
    pricingStrategy = await PRICING_STRATEGY.new((1 * Math.pow(10, 18))/1235); //still issues here with floats
  });

  it('should correcty calculate price', async function(){
    //send 10 ether
   let price = await pricingStrategy.calculatePrice(1 * Math.pow(10, 18), 0, 0, owner, 18);
   expect(price.toNumber()).to.equal(1235 * Math.pow(10, 18));
  });
});