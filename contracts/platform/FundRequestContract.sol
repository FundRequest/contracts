pragma solidity ^0.4.13;


import '../math/SafeMath.sol';
import '../token/FundRequestToken.sol';


contract FundRequestContract {

  using SafeMath for uint256;

  event Funded(address indexed from, uint256 value, bytes32 platform, bytes32 platformId);

  FundRequestToken public token;

  struct Funding {
  address[] funders;
  mapping (address => uint256) balances;
  uint256 totalBalance;
  }

  mapping (bytes32 => uint256) public totalPlatformBalances;

  mapping (bytes32 => uint256) public totalPlatformFunds;

  uint256 public totalBalance;

  uint256 public totalFunds;

  mapping (bytes32 => mapping (bytes32 => Funding)) funds;

  function FundRequestContract(address _tokenAddress) {
    token = FundRequestToken(_tokenAddress);
    assert(token.isFundRequestToken());
  }

  function fund(bytes32 _platform, bytes32 _platformId, uint256 _value) returns (bool success) {
    require(token.transferFrom(msg.sender, address(this), _value));
    updateFunders(msg.sender, _platform, _platformId);
    updateBalances(msg.sender, _value, _platform, _platformId);
    Funded(msg.sender, _value, _platform, _platformId);
    return true;
  }

  function balance(bytes32 _platform, bytes32 _platformId) constant returns (uint256) {
    return funds[_platform][_platformId].totalBalance;
  }


  function updateFunders(address _from, bytes32 _platform, bytes32 _platformId) internal {
    bool existing = funds[_platform][_platformId].balances[_from] > 0;
    if (!existing) {
      funds[_platform][_platformId].funders.push(_from);
    }
  }

  function updateBalances(address _from, uint256 _value, bytes32 _platform, bytes32 _platformId) internal {
    funds[_platform][_platformId].balances[_from] = funds[_platform][_platformId].balances[_from].add(_value);
    funds[_platform][_platformId].totalBalance = funds[_platform][_platformId].totalBalance.add(_value);
    totalBalance = totalBalance.add(_value);
    totalFunds = totalFunds.add(_value);
    totalPlatformBalances[_platform] = totalPlatformBalances[_platform].add(_value);
    totalPlatformFunds[_platform] = totalPlatformFunds[_platform].add(_value);
  }

}