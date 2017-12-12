pragma solidity ^0.4.13;


/**
 * Limited MiniMe transfer Token as deployed by https://fundrequest.io
 * Davy Van Roy
 * Quinten De Swaef
 */
contract LimitedTransferAgent {

  function isTransferEnabled(address _from, address _to) returns (bool enabled);

}