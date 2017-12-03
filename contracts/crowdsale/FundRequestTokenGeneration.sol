pragma solidity ^0.4.13;


import '../math/SafeMath.sol';
import '../pause/Pausable.sol';
import "../token/MiniMeToken.sol";


contract FundRequestTokenGeneration is Pausable {
  using SafeMath for uint256;

  address public founderWallet;

  address public advisorWallet;

  address public ecoSystemWallet;

  address public coldStorageWallet;

  uint public rate;

  mapping (address => uint) public deposits;

  mapping (address => uint) public balances;

  address[] public investors;

  uint public investorCount;

  mapping (address => uint) public allowed;

  MiniMeToken public tokenContract;

  uint public maxCap;         // In wei
  uint256 public totalCollected;         // In wei


  function FundRequestTokenGeneration(address _tokenAddress, address _founderWallet, address _advisorWallet, address _ecoSystemWallet, address _coldStorageWallet, uint _rate, uint _maxCap) {
    tokenContract = MiniMeToken(_tokenAddress);
    founderWallet = _founderWallet;
    advisorWallet = _advisorWallet;
    ecoSystemWallet = _ecoSystemWallet;
    coldStorageWallet = _coldStorageWallet;
    rate = _rate;
    maxCap = _maxCap;
  }

  function() payable whenNotPaused {
    doPayment(msg.sender);
  }

  /// @notice `proxyPayment()` allows the caller to send ether to the Campaign and
  /// have the tokens created in an address of their choosing
  /// @param _owner The address that will hold the newly created tokens

  function proxyPayment(address _owner) payable whenNotPaused returns (bool) {
    doPayment(_owner);
    return true;
  }

  function doPayment(address beneficiary) whenNotPaused internal {
    require(validPurchase(beneficiary));
    require(maxCapNotReached());
    bool existing = deposits[beneficiary] > 0;
    uint256 weiAmount = msg.value;
    uint256 updatedWeiRaised = totalCollected.add(weiAmount);
    uint256 tokensInWei = weiAmount.mul(rate);
    totalCollected = updatedWeiRaised;
    deposits[beneficiary] = deposits[beneficiary].add(msg.value);
    balances[beneficiary] = balances[beneficiary].add(tokensInWei);
    if (!existing) {
      investors.push(beneficiary);
      investorCount++;
    }
    distributeTokens(beneficiary, tokensInWei);
    return;
  }

  function allocateTokens(address beneficiary, uint256 tokensSold) whenNotPaused onlyOwner {
    distributeTokens(beneficiary, tokensSold);
  }

  function distributeTokens(address beneficiary, uint256 tokensSold) internal {
    uint256 totalTokensInWei = tokensSold.mul(100).div(40);
    require(generateTokens(totalTokensInWei, beneficiary, 40));
    require(generateTokens(totalTokensInWei, founderWallet, 18));
    require(generateTokens(totalTokensInWei, advisorWallet, 2));
    require(generateTokens(totalTokensInWei, ecoSystemWallet, 30));
    require(generateTokens(totalTokensInWei, coldStorageWallet, 10));
  }

  function validPurchase(address beneficiary) internal returns (bool) {
    require(tokenContract.controller() != 0);
    require(msg.value >= 0.01 ether);
    require(msg.value <= allowed[beneficiary]);
    return true;
  }

  function generateTokens(uint256 _total, address _owner, uint _pct) internal returns (bool) {
    uint256 tokensInWei = _total.div(100).mul(_pct);
    require(tokenContract.generateTokens(_owner, tokensInWei));
    return true;
  }

  function allow(address beneficiary, uint _cap) onlyOwner {
    allowed[beneficiary] = _cap;
  }

  function maxCapNotReached() internal returns (bool) {
    return totalCollected.add(msg.value) <= maxCap;
  }

  function setMaxCap(uint _maxCap) onlyOwner {
    maxCap = _maxCap;
  }

}