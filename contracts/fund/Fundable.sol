pragma solidity ^0.4.15;


contract Fundable {
  function fund(address from, uint256 value, bytes32 data, string user) returns (bool success);
}