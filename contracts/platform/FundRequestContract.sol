pragma solidity ^0.4.15;


import "../math/SafeMath.sol";
import "../fund/Fundable.sol";


contract FundRequestContract is Fundable {

  using SafeMath for uint256;

  address public tokenAddress;

  struct Funding {
  address[] funders;
  mapping (address => uint256) balances;
  uint256 totalBalance;
  }

  mapping (string => Funding) funds;


  function FundRequestContract(address _tokenAddress) {
    tokenAddress = _tokenAddress;
  }

  function fund(address _from, uint256 _value, string _data) canFund(msg.sender) returns (bool success) {
    updateFunders(_from, _data);
    updateBalances(_from, _value, _data);
    return true;
  }

  function balance(string _data) constant returns (uint256) {
    return funds[_data].totalBalance;
  }

  function updateFunders(address _from, string _data) internal {
    bool existing = funds[_data].balances[_from] > 0;
    if (!existing) {
      funds[_data].funders.push(_from);
    }
  }

  function updateBalances(address _from, uint256 _value, string _data) internal {
    funds[_data].balances[_from] = funds[_data].balances[_from].add(_value);
    funds[_data].totalBalance = funds[_data].totalBalance.add(_value);
  }

  modifier canFund(address _sender) {
    if (_sender != tokenAddress) {
      revert();
    }
    _;
  }
}