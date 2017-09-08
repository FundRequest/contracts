pragma solidity ^0.4.11;

import "./PricingStrategy.sol";
import "../math/SafeMath.sol";

/**
 * Fixed crowdsale pricing - everybody gets the same price.
 */
contract FlatPricing is PricingStrategy {

  using SafeMath for uint256;

  /* How many weis one token costs */
  uint256 public oneTokenInWei;

  function FlatPricing(uint _oneTokenInWei) {
    oneTokenInWei = _oneTokenInWei;
  }

  /**
   * Calculate the current price for buy in amount.
   *
   * @param  {uint amount} Buy-in value in wei.
   */
  function calculatePrice(uint256 value, uint256 weiRaised, uint256 tokensSold, address msgSender, uint decimals) public constant returns (uint) {
    uint256 multiplier = 10 ** decimals;
    return value.times(multiplier) / oneTokenInWei;
  }

}