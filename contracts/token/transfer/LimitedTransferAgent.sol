pragma solidity ^0.4.18;


/**
 * Limited MiniMe transfer Token as deployed by https://fundrequest.io
 * Davy Van Roy
 * Quinten De Swaef
 */
contract LimitedTransferAgent {

  function isTransferEnabled(address _from, address _to) public returns (bool enabled);

}