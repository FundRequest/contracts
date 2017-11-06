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

  function isFundRequestToken() constant returns (bool) {
    return true;
  }
}