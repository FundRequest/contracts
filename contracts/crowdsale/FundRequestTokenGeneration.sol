pragma solidity ^0.4.13;


import '../math/SafeMath.sol';
import '../ownership/Owned.sol';
import "../token/MiniMeToken.sol";


contract FundRequestTokenGeneration is Owned {
  using SafeMath for uint256;

  address public founderWallet;

  address public advisorWallet;

  address public ecoSystemWallet;

  address public coldStorageWallet;

  uint256 public rate;

  mapping (address => uint) public deposits;

  mapping (address => uint) public balances;

  address[] public investors;

  uint public investorCount;

  uint256 public weiRaised;

  mapping (address => uint) public allowed;

  MiniMeToken public tokenContract;

  function FundRequestTokenGeneration(address _tokenAddress, address _founderWallet, address _advisorWallet, address _ecoSystemWallet, address _coldStorageWallet, uint256 _rate) {
    tokenContract = MiniMeToken(_tokenAddress);
    founderWallet = _founderWallet;
    advisorWallet = _advisorWallet;
    ecoSystemWallet = _ecoSystemWallet;
    coldStorageWallet = _coldStorageWallet;
    rate = _rate;
  }

  function() payable {
    doPayment(msg.sender);
  }

  /// @notice `proxyPayment()` allows the caller to send ether to the Campaign and
  /// have the tokens created in an address of their choosing
  /// @param _owner The address that will hold the newly created tokens

  function proxyPayment(address _owner) payable returns (bool) {
    doPayment(_owner);
    return true;
  }

  function doPayment(address beneficiary) internal {
    require(tokenContract.controller() != 0);
      require(msg.value >= 0.01 ether);
//        require(validPurchase());
    //    require(validBeneficiary(_owner));
    //    require(maxCapNotReached());
    //    require(now >= startFundingTime);
    //    require(now <= endFundingTime);
    bool existing = deposits[beneficiary] > 0;
    uint256 weiAmount = msg.value;
    uint256 updatedWeiRaised = weiRaised.add(weiAmount);
    uint256 tokensInWei = weiAmount.mul(rate);
    weiRaised = updatedWeiRaised;
    deposits[beneficiary] = deposits[beneficiary].add(msg.value);
    balances[beneficiary] = balances[beneficiary].add(tokensInWei);
    if (!existing) {
      investors.push(beneficiary);
      investorCount++;
    }

    uint256 totalTokensInWei = tokensInWei.mul(100).div(40);
    require(generateTokens(totalTokensInWei, beneficiary, 40));
    require(generateTokens(totalTokensInWei, founderWallet, 18));
    require(generateTokens(totalTokensInWei, advisorWallet, 2));
    require(generateTokens(totalTokensInWei, ecoSystemWallet, 30));
    require(generateTokens(totalTokensInWei, coldStorageWallet, 10));

    return;
  }

  function generateTokens(uint256 _total, address _owner, uint _pct) internal returns (bool) {
    uint256 tokensInWei = _total.div(100).mul(_pct);
    require(tokenContract.generateTokens(_owner, tokensInWei));
    return true;
  }

}