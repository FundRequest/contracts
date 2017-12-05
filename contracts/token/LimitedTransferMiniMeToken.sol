pragma solidity ^0.4.13;


import "./MiniMeToken.sol";
import "./transfer/LimitedTransferAgent.sol";


/**
 * Limited MiniMe transfer Token as deployed by https://fundrequest.io
 * Davy Van Roy
 * Quinten De Swaef
 */
contract LimitedTransferMiniMeToken is MiniMeToken {

  LimitedTransferAgent public limitedTransferAgent;

  function LimitedTransferMiniMeToken(address _limitedTransferAgent, address _tokenFactory, address _parentToken, uint _parentSnapShotBlock, string _tokenName, uint8 _decimalUnits, string _tokenSymbol, bool _transfersEnabled) MiniMeToken(_tokenFactory, _parentToken, _parentSnapShotBlock, _tokenName, _decimalUnits, _tokenSymbol, _transfersEnabled) {
    limitedTransferAgent = LimitedTransferAgent(_limitedTransferAgent);
  }

  function approve(address _spender, uint256 _amount) public canTransfer(msg.sender, _spender) returns (bool success) {
    require(super.approve(_spender, _amount));
    return true;
  }

  function transfer(address _to, uint256 _amount) public canTransfer(msg.sender, _to) returns (bool success) {
    require(super.transfer(_to, _amount));
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _amount
  ) public canTransfer(msg.sender, _to) returns (bool success) {
    require(super.transferFrom(_from, _to, _amount));
    return true;
  }

  modifier canTransfer(address _from, address _to) {
    require(transfersEnabled);
    require(limitedTransferAgent.isTransferEnabled(_from, _to));
    _;
  }

}