pragma solidity ^0.4.18;


import "./MiniMeToken.sol";


// FundRequest Token
//
// @authors:
// Davy Van Roy <davy.van.roy@gmail.com>
// Quinten De Swaef <quinten.de.swaef@gmail.com>
//
// Security audit performed by LeastAuthority:
// https://github.com/FundRequest/audit-reports/raw/master/2018-02-06 - Least Authority - ICO Contracts Audit Report.pdf

contract FundRequestToken is MiniMeToken {

  function FundRequestToken(
    address _tokenFactory,
    address _parentToken, 
    uint _parentSnapShotBlock, 
    string _tokenName, 
    uint8 _decimalUnits, 
    string _tokenSymbol, 
    bool _transfersEnabled) 
    public 
    MiniMeToken(
      _tokenFactory,
      _parentToken, 
      _parentSnapShotBlock, 
      _tokenName, 
      _decimalUnits, 
      _tokenSymbol, 
      _transfersEnabled) 
  {
    //constructor
  }

  function safeApprove(address _spender, uint256 _currentValue, uint256 _amount) public returns (bool success) {
    require(allowed[msg.sender][_spender] == _currentValue);
    return doApprove(_spender, _amount);
  }

  function isFundRequestToken() public pure returns (bool) {
    return true;
  }
}