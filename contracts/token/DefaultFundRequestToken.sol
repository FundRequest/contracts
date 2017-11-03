pragma solidity ^0.4.15;


import "./CrowdsaleToken.sol";
import "../fund/Fundable.sol";
import "../token/FundRequestToken.sol";


/** 
 * Creating an instance of CrowdsaleToken, for the specific reason that we'll need an entrypoint 
 * to the fundrequest contracts with a mandate to tokens
 *
 */
contract DefaultFundRequestToken is FundRequestToken, CrowdsaleToken {

  Fundable public fundRequestContract;

  function DefaultFundRequestToken(string _name, string _symbol, uint256 _initialSupply, uint8 _decimals, bool _mintable) CrowdsaleToken(_name, _symbol, _initialSupply, _decimals, _mintable) {
    //constructor
  }

  /**
   * only the owner of the FundRequestToken should be able to set the fundrequest entrypoint  
   */
  function setFundRequestContractAddress(address _fundRequestContractAddress) onlyOwner {
    fundRequestContract = Fundable(_fundRequestContractAddress);
  }

  function transferFunding(uint256 value, bytes32 data, string user) {
    require(address(fundRequestContract) != address(0));
    super.transfer(fundRequestContract, value);
    bool success = fundRequestContract.fund(msg.sender, value, data, user);
    require(success);
  }
}