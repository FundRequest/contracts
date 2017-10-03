/**
 * This smart contract code is Copyright 2017 TokenMarket Ltd. For more information see https://tokenmarket.net
 *
 * Licensed under the Apache License, version 2.0: https://github.com/TokenMarketNet/ico/blob/master/LICENSE.txt
 */

pragma solidity ^0.4.15;

import "../math/SafeMath.sol";
import "../lifecycle/Haltable.sol";
import "../token/DefaultFundRequestToken.sol";


/**
 * Abstract base contract for token sales.
 *
 * Handle
 * - start and end dates
 * - accepting investments
 * - minimum funding goal and refund
 * - various statistics during the crowdfund
 * - different investment policies (require server side customer id, allow only whitelisted addresses)
 *
 */
contract Crowdsale is Haltable {

  /* Max investment count when we are still allowed to change the multisig address */
  uint public MAX_INVESTMENTS_BEFORE_MULTISIG_CHANGE = 5;

  bool public softcapReached = false;

  using SafeMath for uint256;

  /* The token we are selling */
  DefaultFundRequestToken public token;

  /* tokens will be transfered from this address */
  address public multisigWallet;

  /* if the funding goal is not reached, investors may withdraw their funds */
  uint public minimumFundingGoal;

  /* the UNIX timestamp start date of the crowdsale */
  uint public startsAt;

  /* the UNIX timestamp end date of the crowdsale */
  uint public endsAt;

  /* the number of tokens already sold through this contract*/
  uint public tokensSold = 0;

  /* How many wei of funding we have raised */
  uint public weiRaised = 0;

  /* Calculate incoming funds from presale contracts and addresses */
  uint public presaleWeiRaised = 0;

  /* How many distinct addresses have invested */
  uint public investorCount = 0;

  /* How much wei we have returned back to the contract after a failed crowdfund. */
  uint256 public loadedRefund = 0;

  /* How much wei we have given back to investors.*/
  uint256 public weiRefunded = 0;

  uint256 public softcap = 0;

  /* Has this crowdsale been finalized */
  bool public finalized;

  /** How much ETH each address has invested to this crowdsale */
  mapping (address => uint256) public investedAmountOf;

  /** How much tokens this crowdsale has credited for each investor address */
  mapping (address => uint256) public tokenAmountOf;

  /** Addresses that are allowed to invest even before ICO offical opens. For testing, for ICO partners, etc. */
  mapping (address => bool) public earlyParticipantWhitelist;

  /** State machine
   *
   * - Preparing: All contract initialization calls and variables have not been set yet
   * - Prefunding: We have not passed start time yet
   * - Funding: Active crowdsale
   * - Success: Minimum funding goal reached
   * - Failure: Minimum funding goal not reached before ending time
   * - Finalized: The finalized has been called and succesfully executed
   * - Refunding: Refunds are loaded on the contract for reclaim.
   */
  enum State{Unknown, Preparing, PreFunding, Funding, Success, Failure, Finalized, Refunding}

  // A new investment was made
  event Invested(address investor, uint weiAmount, uint tokenAmount);

  // Refund was processed for a contributor
  event Refund(address investor, uint weiAmount);

  // Crowdsale end time has been changed
  event EndsAtChanged(uint newEndsAt);

  function Crowdsale(address _token, address _multisigWallet, uint _start, uint _end, uint256 _minimumFundingGoal, uint256 _softcap) {

    owner = msg.sender;

    token = DefaultFundRequestToken(_token);

    softcap = _softcap;

    multisigWallet = _multisigWallet;
    if(multisigWallet == 0) {
        throw;
    }

    if(_start == 0) {
        revert();
    }

    startsAt = _start;

    if(_end == 0) {
        revert();
    }

    endsAt = _end;

    // Don't mess the dates
    if(startsAt >= endsAt) {
        throw;
    }

    // Minimum funding goal can be zero
    minimumFundingGoal = _minimumFundingGoal;
  }

  /**
   * Don't expect to just send in money and get tokens.
   */
  function() payable {
    throw;
  }

  event Generic(string message);

  /**
   * Make an investment.
   *
   * Crowdsale must be running for one to invest.
   * We must have not pressed the emergency brake.
   *
   * @param receiver The Ethereum address who receives the tokens
   *
   */
   function investInternal(address receiver) stopInEmergency private {

     //The only state we're allowed to fund is the Funding State
     if(getState() != State.Funding) {
       revert();
     }
    uint weiAmount = msg.value;

    // Account presale sales separately, so that they do not count against pricing tranches
    uint tokenAmount = calculateTokensPerWei(weiAmount); 
    
    if(tokenAmount == 0) {
      // Dust transaction
      revert();
    }

    

    if(investedAmountOf[receiver] == 0) {
       // A new investor
       investorCount++;
    }

    // Update investor
    investedAmountOf[receiver] = investedAmountOf[receiver].add(weiAmount);
    tokenAmountOf[receiver] = tokenAmountOf[receiver].add(tokenAmount);

    // Update totals
    weiRaised = weiRaised.add(weiAmount);
    tokensSold = tokensSold.add(tokenAmount);
    
    // Check that we did not bust the cap
    if(isBreakingCap(weiAmount, tokenAmount, weiRaised, tokensSold)) {
      revert();
    }

    assignTokens(receiver, tokenAmount);

    // Pocket the money
    if(!multisigWallet.send(weiAmount)) {
        revert();
    }

    //if this is the first time reaching the softcap, set the softcap + endtime is now + 1 day
    if(!softcapReached && weiRaised >= softcap) {
      softcapReached = true;
      endsAt = block.timestamp + 1 days;
    }
    
    // Tell us invest was success
    Invested(receiver, weiAmount, tokenAmount);
  }

  function calculateTokensPerWei(uint256 _weiAmount) public constant returns (uint256 tokensPerWei) {
    return _weiAmount.mul(1800);
  }

  /**
   * Preallocate tokens for the early investors.
   *
   * Preallocated tokens have been sold before the actual crowdsale opens.
   * This function mints the tokens and moves the crowdsale needle.
   *
   * Investor count is not handled; it is assumed this goes for multiple investors
   * and the token distribution happens outside the smart contract flow.
   *
   * No money is exchanged, as the crowdsale team already have received the payment.
   *
   * @param fullTokens tokens as full tokens - decimal places added internally
   * @param weiPrice Price of a single full token in wei
   *
   */
  function preallocate(address receiver, uint fullTokens, uint weiPrice) public onlyOwner {

    uint tokenAmount = fullTokens * 10**token.decimals();
    uint weiAmount = weiPrice * fullTokens;

    weiRaised = weiRaised.add(weiAmount);
    tokensSold = tokensSold.add(tokenAmount);

    investedAmountOf[receiver] = investedAmountOf[receiver].add(weiAmount);
    tokenAmountOf[receiver] = tokenAmountOf[receiver].add(tokenAmount);

    assignTokens(receiver, tokenAmount);

    // Tell us invest was success
    Invested(receiver, weiAmount, tokenAmount);
  }

  /**
   * Allow anonymous contributions to this crowdsale.
   */
  function invest(address addr) public payable {
    investInternal(addr);
  }

  /**
   * The basic entry point to participate the crowdsale process.
   *
   * Pay for funding, get invested tokens back in the sender address.
   */
  function buy() public payable {
        Generic("Buying");
    invest(msg.sender);
  }

  /**
   * Finalize a succcesful crowdsale.
   * 
   * This will not release the token to be transferrable, that's something we need to do ourselves.
   */
  function finalize() public inState(State.Success) onlyOwner stopInEmergency {

    // Already finalized
    if(finalized) {
      revert();
    }

    finalized = true;
  }

  /**
   * Allow crowdsale owner to close early or extend the crowdsale.
   *
   * This is useful e.g. for a manual soft cap implementation:
   * - after X amount is reached determine manual closing
   *
   * This may put the crowdsale to an invalid state,
   * but we trust owners know what they are doing.
   *
   */
  function setEndsAt(uint time) onlyOwner {

    if(now > time) {
      revert(); // Don't change past
    }

    endsAt = time;
    EndsAtChanged(endsAt);
  }

  /**
   * Allow to change the team multisig address in the case of emergency.
   *
   * This allows to save a deployed crowdsale wallet in the case the crowdsale has not yet begun
   * (we have done only few test transactions). After the crowdsale is going
   * then multisig address stays locked for the safety reasons.
   */
  function setMultisig(address addr) public onlyOwner {
    multisigWallet = addr;
  }

  /**
   * Allow load refunds back on the contract for the refunding.
   *
   * The team can transfer the funds back on the smart contract in the case the minimum goal was not reached..
   */
  function loadRefund() public payable inState(State.Failure) {
    require(msg.value > 0);
    loadedRefund = loadedRefund.add(msg.value);
  }

  /**
   * Investors can claim refund.
   *
   * Note that any refunds from proxy buyers should be handled separately,
   * and not through this contract.
   */
  function refund() public inState(State.Refunding) {
    uint256 weiValue = investedAmountOf[msg.sender];
    require(weiValue > 0);
    investedAmountOf[msg.sender] = 0;
    weiRefunded = weiRefunded.add(weiValue);
    Refund(msg.sender, weiValue);
    if (!msg.sender.send(weiValue)) {
        revert();
    }
  }

  /**
   * @return true if the crowdsale has raised enough money to be a successful.
   */
  function isMinimumGoalReached() public constant returns (bool reached) {
    return weiRaised >= minimumFundingGoal;
  }



  /**
   * Crowdfund state machine management.
   *
   * We make it a function and do not assign the result to a variable, so there is no chance of the variable being stale.
   */
  function getState() public constant returns (State) {
    if(finalized) {
        return State.Finalized;
    }  else if (block.timestamp < startsAt) {
        return State.Preparing;
    } else if (block.timestamp <= endsAt && !isCrowdsaleFull()) {
        return State.Funding;
    } else if (isMinimumGoalReached()) {
         return State.Success;
    } else if (!isMinimumGoalReached() && weiRaised > 0 && loadedRefund >= weiRaised) {
        return State.Refunding;
    } else {
        return State.Failure;
    }
  }

  /** Interface marker. */
  function isCrowdsale() public constant returns (bool) {
    return true;
  }

  //
  // Modifiers
  //

  /** Modified allowing execution only if the crowdsale is currently running.  */
  modifier inState(State state) {
    require(getState() == state);
    _;
  }


  //
  // Abstract functions
  //

  /**
   * Check if the current invested breaks our cap rules.
   *
   *
   * The child contract must define their own cap setting rules.
   * We allow a lot of flexibility through different capping strategies (ETH, token count)
   * Called from invest().
   *
   * @param weiAmount The amount of wei the investor tries to invest in the current transaction
   * @param tokenAmount The amount of tokens we try to give to the investor in the current transaction
   * @param weiRaisedTotal What would be our total raised balance after this transaction
   * @param tokensSoldTotal What would be our total sold tokens count after this transaction
   *
   * @return true if taking this investment would break our cap rules
   */
  function isBreakingCap(uint weiAmount, uint tokenAmount, uint weiRaisedTotal, uint tokensSoldTotal) constant returns (bool limitBroken);

  /**
   * Check if the current crowdsale is full and we can no longer sell any tokens.
   */
  function isCrowdsaleFull() public constant returns (bool);

  /**
   * Create new tokens or transfer issued tokens to the investor depending on the cap model.
   */
  function assignTokens(address receiver, uint tokenAmount) private;
}