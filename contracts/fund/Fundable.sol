pragma solidity ^0.4.15;


contract Fundable {
  function fund(address from, uint256 value, string data) returns (bool success);
}