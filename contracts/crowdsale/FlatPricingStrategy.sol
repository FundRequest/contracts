/**
 * This smart contract code is Copyright 2017 TokenMarket Ltd. For more information see https://tokenmarket.net
 *
 * Licensed under the Apache License, version 2.0: https://github.com/TokenMarketNet/ico/blob/master/LICENSE.txt
 */

pragma solidity ^0.4.15;

import "./PricingStrategy.sol";
import "../math/SafeMath.sol";

/**
 * Fixed crowdsale pricing - everybody gets the same price.
 */
contract FlatPricingStrategy is PricingStrategy {

  using SafeMath for uint256;

  /* How many weis one token costs */
  uint public oneTokenInWei;

  function FlatPricingStrategy(uint256 _oneTokenInWei) {
    require(_oneTokenInWei > 0);
    oneTokenInWei = _oneTokenInWei;
  }

  /**
   * Calculate the current price for buy in amount.
   *
   */
  function calculatePrice(uint256 value, uint256 weiRaised, uint256 tokensSold, address msgSender, uint decimals) public constant returns (uint256) {
    uint multiplier = 10 ** decimals;
    return value.mul(multiplier) / oneTokenInWei;
  }
}