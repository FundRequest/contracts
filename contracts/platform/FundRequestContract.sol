pragma solidity ^0.4.13;


import '../math/SafeMath.sol';
import '../token/FundRequestToken.sol';


contract FundRequestContract {

  using SafeMath for uint256;

  event Funded(address indexed from, bytes32 platform, bytes32 platformId, uint256 value);

  FundRequestToken public token;

  struct Funding {
  address[] funders;
  mapping (address => uint256) balances;
  uint256 totalBalance;
  }

  uint256 public totalBalance;

  uint256 public totalFunded;

  mapping (address => uint256) funders;

  uint256 public totalNumberOfFunders;

  uint256 public requestsFunded;


  mapping (bytes32 => mapping (bytes32 => Funding)) funds;

  function FundRequestContract(address _tokenAddress) {
    token = FundRequestToken(_tokenAddress);
    assert(token.isFundRequestToken());
  }

  function fund(bytes32 _platform, bytes32 _platformId, uint256 _value) returns (bool success) {
    require(token.transferFrom(msg.sender, address(this), _value));
    updateFunders(msg.sender, _platform, _platformId, _value);
    updateBalances(msg.sender, _platform, _platformId, _value);
    Funded(msg.sender, _platform, _platformId, _value);
    return true;
  }

  function balance(bytes32 _platform, bytes32 _platformId) constant returns (uint256) {
    return funds[_platform][_platformId].totalBalance;
  }


  function updateFunders(address _from, bytes32 _platform, bytes32 _platformId, uint256 _value) internal {
    bool existing = funds[_platform][_platformId].balances[_from] > 0;
    if (!existing) {
      funds[_platform][_platformId].funders.push(_from);
    }
    if (funders[_from] <= 0) {
      totalNumberOfFunders = totalNumberOfFunders.add(1);
    }
    funders[_from].add(_value);
  }

  function updateBalances(address _from, bytes32 _platform, bytes32 _platformId, uint256 _value) internal {
    if (funds[_platform][_platformId].totalBalance <= 0) {
      requestsFunded = requestsFunded.add(1);
    }
    funds[_platform][_platformId].balances[_from] = funds[_platform][_platformId].balances[_from].add(_value);
    funds[_platform][_platformId].totalBalance = funds[_platform][_platformId].totalBalance.add(_value);
    totalBalance = totalBalance.add(_value);
    totalFunded = totalFunded.add(_value);
  }

}