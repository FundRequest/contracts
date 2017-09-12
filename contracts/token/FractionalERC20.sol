pragma solidity ^0.4.15;

import "./ERC20.sol";


/**
 * A token that defines fractional units as decimals.
 */
contract FractionalERC20 is ERC20 {

  uint public decimals;

}