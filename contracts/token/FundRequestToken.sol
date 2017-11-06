pragma solidity ^0.4.18;


import "./MiniMeToken.sol";


/**
 * Creating an instance of CrowdsaleToken, for the specific reason that we'll need an entrypoint
 * to the fundrequest contracts with a mandate to tokens
 *
 */
contract FundRequestToken is MiniMeToken {

  function FundRequestToken(address _tokenFactory, address _parentToken, uint _parentSnapShotBlock, string _tokenName, uint8 _decimalUnits, string _tokenSymbol, bool _transfersEnabled) MiniMeToken(_tokenFactory, _parentToken, _parentSnapShotBlock, _tokenName, _decimalUnits, _tokenSymbol, _transfersEnabled) {
    //constructor
  }

  function isFundRequestToken() pure returns (bool) {
    return true;
  }
}