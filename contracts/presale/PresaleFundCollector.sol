pragma solidity ^0.4.6;


import "../token/Crowdsale.sol";
import "../math/SafeMathLib.sol";

/**
 * Collect funds from presale investors to be send to the crowdsale smart contract later.
 *
 * - Collect funds from pre-sale investors
 * - Send funds to the crowdsale when it opens
 * - Allow owner to set the crowdsale
 * - Have refund after X days as a safety hatch if the crowdsale doesn't materilize
 *
 */
contract PresaleFundCollector is Ownable {

  using SafeMathLib for uint;

  /** How many investors when can carry per a single contract */
  uint public MAX_INVESTORS = 100;

  /** How many investors we have now */
  uint public investorCount;

  /** Who are our investors (iterable) */
  address[] public investors;

  /** How much they have invested */
  mapping(address => uint) public balances;
  
  /** What is the minimum buy in */
  uint public weiMinimumLimit;

  /** Have we begun to move funds */
  bool public moving;

  /** Our ICO contract where we will move the funds */
  Crowdsale public crowdsale;

  event Invested(address investor, uint value);
  event Refunded(address investor, uint value);

  /**
   * Create presale contract where lock up period is given days
   */
  function PresaleFundCollector(address _owner, uint _weiMinimumLimit) {

    owner = _owner;

    // Give argument
    if(_weiMinimumLimit == 0) {
      throw;
    }

    weiMinimumLimit = _weiMinimumLimit;
  }

  /**
   * Participate to a presale.
   */
  function invest() public payable {

    // Cannot invest anymore through crowdsale when moving has begun
    if(moving) throw;

    address investor = msg.sender;

    bool existing = balances[investor] > 0;

    balances[investor] = balances[investor].plus(msg.value);

    // Need to fulfill minimum limit
    if(balances[investor] < weiMinimumLimit) {
      throw;
    }

    // This is a new investor
    if(!existing) {

      // Limit number of investors to prevent too long loops
      if(investorCount >= MAX_INVESTORS) throw;

      investors.push(investor);
      investorCount++;
    }

    Invested(investor, msg.value);
  }

  /**
   * Load funds to the crowdsale for a single investor.
   */
  function parcipateCrowdsaleInvestor(address investor) public {

    // Crowdsale not yet set
    if(address(crowdsale) == 0) throw;

    moving = true;

    if(balances[investor] > 0) {
      uint amount = balances[investor];
      delete balances[investor];
      crowdsale.invest.value(amount)(investor);
    }
  }

  /**
   * Load funds to the crowdsale for all investor.
   *
   */
  function parcipateCrowdsaleAll() public {

    // We might hit a max gas limit in this loop,
    // and in this case you can simply call parcipateCrowdsaleInvestor() for all investors
    for(uint i=0; i<investors.length; i++) {
       parcipateCrowdsaleInvestor(investors[i]);
    }
  }

  /**
   * Set the target crowdsale where we will move presale funds when the crowdsale opens.
   */
  function setCrowdsale(Crowdsale _crowdsale) public onlyOwner {
     crowdsale = _crowdsale;
  }

  function balanceOf(address _owner) constant returns (uint balance) {
    return balances[_owner];
  }

  /** Explicitly call function from your wallet. */
  function() payable {
    throw;
  }
}