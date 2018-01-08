pragma solidity ^0.4.18;


import "./LimitedTransferMiniMeToken.sol";


/**
 * Fundrequest Token as deployed by https://fundrequest.io
 * Davy Van Roy
 * Quinten De Swaef
 */
contract FundRequestToken is LimitedTransferMiniMeToken {

  function FundRequestToken(
    address _limitedTransferAgent, 
    address _tokenFactory, 
    address _parentToken, 
    uint _parentSnapShotBlock, 
    string _tokenName, 
    uint8 _decimalUnits, 
    string _tokenSymbol, 
    bool _transfersEnabled) 
    public 
    LimitedTransferMiniMeToken(
      _limitedTransferAgent, 
      _tokenFactory, 
      _parentToken, 
      _parentSnapShotBlock, 
      _tokenName, 
      _decimalUnits, 
      _tokenSymbol, 
      _transfersEnabled) {
    //constructor
  }

  function safeApprove(address _spender, uint256 _currentValue, uint256 _amount) public canTransfer(msg.sender, _spender) returns (bool success) {
    require(allowed[msg.sender][_spender] == _currentValue);
    return doApprove(_spender, _amount);
  }

  function isFundRequestToken() public pure returns (bool) {
    return true;
  }
}