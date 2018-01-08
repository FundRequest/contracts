pragma solidity ^0.4.18;


import "./LimitedTransferAgent.sol";
import "../../ownership/Owned.sol";


/**
 * Limited MiniMe transfer Token as deployed by https://fundrequest.io
 * Davy Van Roy
 * Quinten De Swaef
 */
contract DefaultLimitedTransferAgent is LimitedTransferAgent, Owned {

  bool public limitedTransfersEnabled;

  address public contractAddress;

  mapping (address => bool) public limitedTransferAddresses;

  function DefaultLimitedTransferAgent() public {
    //constructor
  }

  function enableLimitedTransfers(bool _limitedTransfersEnabled) public onlyOwner {
    limitedTransfersEnabled = _limitedTransfersEnabled;
  }

  function updateLimitedTransferAddress(address _allowedAddress, bool _allowed) public onlyOwner returns (bool success) {
    limitedTransferAddresses[_allowedAddress] = _allowed;
    return true;
  }

  function setContractAddress(address _contractAddress) public onlyOwner returns (bool success) {
    contractAddress = _contractAddress;
    return true;
  }

  function isTransferEnabled(address _from, address _to) public returns (bool enabled) {
    if (limitedTransfersEnabled) {
      return
      (
      (limitedTransferAddresses[_from] == true && _to == contractAddress) || 
      _from == contractAddress);
    }
    return true;
  }
}