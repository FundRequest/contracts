pragma solidity 0.4.23;


/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 {
  function totalSupply() constant public returns (uint);

  function balanceOf(address who) constant public returns (uint256);

  function transfer(address to, uint256 value) public returns (bool);

  function allowance(address owner, address spender) public constant returns (uint256);

  function transferFrom(address from, address to, uint256 value) public returns (bool);

  function approve(address spender, uint256 value) public returns (bool);

  event Approval(address indexed _owner, address indexed _spender, uint256 _value);

  event Transfer(address indexed _from, address indexed _to, uint256 _value);
}