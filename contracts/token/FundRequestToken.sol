pragma solidity ^0.4.13;

import "./CrowdsaleToken.sol";

/**
 * Creating an instance of CrowdsaleToken, for the specific reason that we'll need an entrypoint 
 to the fundrequest contracts with a mandate to tokens
 */
contract FundRequestToken is CrowdsaleToken {

    function FundRequestToken(string _name, string _symbol, uint256 _initialSupply, uint _decimals, bool _mintable) CrowdsaleToken(_name, _symbol, _initialSupply, _decimals, _mintable) {
        //constructor
    }

  function isFundRequestToken() public constant returns(bool) {
    return true;
  }
}