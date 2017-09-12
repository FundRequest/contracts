pragma solidity ^0.4.15;

import "./ERC20.sol";
import "../ownership/Ownable.sol";
import './StandardToken.sol';
import "../math/SafeMath.sol";


/**
 * A token that can increase its supply by another contract.
 *
 * This allows uncapped crowdsale by dynamically increasing the supply when money pours in.
 * Only mint agents, contracts whitelisted by owner, can mint new tokens.
 *
 */
contract MintableToken is StandardToken, Ownable {

  using SafeMath for uint256;

  bool public mintingFinished = false;

  /** List of agents that are allowed to create new tokens */
  mapping (address => bool) public mintAgents;

  event MintingAgentChanged(address addr, bool state);

  /**
   * Create new tokens and allocate them to an address..
   *
   * Only callably by a crowdsale contract (mint agent).
   */
  function mint(address receiver, uint256 amount) onlyMintAgent canMint public {
    totalSupply = totalSupply.add(amount);
    balances[receiver] = balances[receiver].add(amount);

    // This will make the mint transaction apper in EtherScan.io
    // We can remove this after there is a standardized minting event
    Transfer(0, receiver, amount);
  }

  /**
   * Owner can allow a crowdsale contract to mint new tokens.
   */
  function setMintAgent(address addr, bool state) onlyOwner canMint public {
    mintAgents[addr] = state;
    MintingAgentChanged(addr, state);
  }

  modifier onlyMintAgent() {
    // Only crowdsale contracts are allowed to mint new tokens
    if (!mintAgents[msg.sender]) {
        revert();
    }
    _;
  }

  /** Make sure we are not done yet. */
    modifier canMint() {
      if (mintingFinished) {
        revert();
      } 
      _;
    }
}