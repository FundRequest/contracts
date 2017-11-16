pragma solidity ^0.4.13;


import "./MiniMeToken.sol";


/**
 * Fundrequest Token as deployed by https://fundrequest.io
 * Davy Van Roy
 * Quinten De Swaef
 */
contract FundRequestToken is MiniMeToken {

  function FundRequestToken(address _tokenFactory, address _parentToken, uint _parentSnapShotBlock, string _tokenName, uint8 _decimalUnits, string _tokenSymbol, bool _transfersEnabled) MiniMeToken(_tokenFactory, _parentToken, _parentSnapShotBlock, _tokenName, _decimalUnits, _tokenSymbol, _transfersEnabled) {
    //constructor
  }

  function approve(address _spender, uint256 _currentValue, uint256 _amount) returns (bool success) {
    require(allowed[msg.sender][_spender] == _currentValue);
    return doApprove(_spender, _amount);
  }

  function isFundRequestToken() constant returns (bool) {
    return true;
  }
}