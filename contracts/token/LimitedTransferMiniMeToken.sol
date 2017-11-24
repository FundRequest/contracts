pragma solidity ^0.4.13;


import "./MiniMeToken.sol";


/**
 * Limited MiniMe transfer Token as deployed by https://fundrequest.io
 * Davy Van Roy
 * Quinten De Swaef
 */
contract LimitedTransferMiniMeToken is MiniMeToken {

  bool public limitedTransfersEnabled;

  address public contractAddress;

  mapping (address => bool) public limitedTransferAddresses;

  function LimitedTransferMiniMeToken(address _tokenFactory, address _parentToken, uint _parentSnapShotBlock, string _tokenName, uint8 _decimalUnits, string _tokenSymbol, bool _transfersEnabled) MiniMeToken(_tokenFactory, _parentToken, _parentSnapShotBlock, _tokenName, _decimalUnits, _tokenSymbol, _transfersEnabled) {
    //constructor
  }

  function addLimitedTransferAddress(address _allowed) public onlyController returns (bool success) {
    limitedTransferAddresses[_allowed] = true;
    return true;
  }

  function setContractAddress(address _contractAddress) public onlyController returns (bool success) {
    contractAddress = _contractAddress;
    return true;
  }

  function enableLimitedTransfers(bool _limitedTransfersEnabled) public onlyController {
    limitedTransfersEnabled = _limitedTransfersEnabled;
    if (_limitedTransfersEnabled) {
      super.enableTransfers(_limitedTransfersEnabled);
    }
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
    if (limitedTransfersEnabled) {
      require(
      (limitedTransferAddresses[_from] == true && _to == contractAddress)
      || _from == contractAddress
      );
    }
    _;
  }

}