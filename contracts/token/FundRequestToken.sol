pragma solidity ^0.4.15;


import "./CrowdsaleToken.sol";
import "../fund/Fundable.sol";


/** 
 * Creating an instance of CrowdsaleToken, for the specific reason that we'll need an entrypoint 
 * to the fundrequest contracts with a mandate to tokens
 *
 */
contract FundRequestToken is CrowdsaleToken {

  address public fundRequestContractAddress;

  function FundRequestToken(string _name, string _symbol, uint256 _initialSupply, uint _decimals, bool _mintable) CrowdsaleToken(_name, _symbol, _initialSupply, _decimals, _mintable) {
    //constructor
  }

  function isFundRequestToken() public constant returns (bool) {
    return true;
  }

  function setFundRequestContractAddress(address _fundRequestContractAddress) onlyOwner {
    fundRequestContractAddress = _fundRequestContractAddress;
  }

  function transferFunding(uint256 value, string data) {
    super.transfer(fundRequestContractAddress, value);
    Fundable fundRequestContract = Fundable(fundRequestContractAddress);
    bool success = fundRequestContract.fund(msg.sender, value, data);
    require(success);
  }
}
