pragma solidity ^0.4.13;


import '../math/SafeMath.sol';
import '../token/FundRequestToken.sol';


contract FundRequestContract {

  using SafeMath for uint256;

  event Funded(address indexed from, uint256 value, bytes32 data, string user);

  FundRequestToken public token;

  struct Funding {
    address[] funders;
    mapping (address => uint256) balances;
    uint256 totalBalance;
  }

  mapping (bytes32 => Funding) funds;

  function FundRequestContract(address _tokenAddress) {
    token = FundRequestToken(_tokenAddress);
    assert(token.isFundRequestToken());
  }

  function fund(uint256 _value, bytes32 _data, string _user) returns (bool success) {
    require(token.transferFrom(msg.sender, address(this), _value));
    updateFunders(msg.sender, _data);
    updateBalances(msg.sender, _value, _data);
    Funded(msg.sender, _value, _data, _user);
    return true;
  }

  function balance(bytes32 _data) constant returns (uint256) {
    return funds[_data].totalBalance;
  }

  function updateFunders(address _from, bytes32 _data) internal {
    bool existing = funds[_data].balances[_from] > 0;
    if (!existing) {
      funds[_data].funders.push(_from);
    }
  }

  function updateBalances(address _from, uint256 _value, bytes32 _data) internal {
    funds[_data].balances[_from] = funds[_data].balances[_from].add(_value);
    funds[_data].totalBalance = funds[_data].totalBalance.add(_value);
  }
}