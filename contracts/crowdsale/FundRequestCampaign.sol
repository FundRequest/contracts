pragma solidity ^0.4.13;
/// @dev This is designed to control the issuance of a MiniMe Token for a
///  non-profit Campaign. This contract effectively dictates the terms of the
///  funding round.

import "../control/TokenController.sol";
import "../ownership/Owned.sol";
import "../token/MiniMeToken.sol";

contract FundRequestCampaign is TokenController, Owned {

  uint public startFundingTime;       // In UNIX Time Format
  uint public endFundingTime;         // In UNIX Time Format
  uint public maximumFunding;         // In wei
  uint public totalCollected;         // In wei
  MiniMeToken public tokenContract;   // The new token for this Campaign
  address public vaultAddress;        // The address to hold the funds donated

  //KYC 
  mapping(address => bool) public allowed;

  /// @notice 'Campaign()' initiates the Campaign by setting its funding
  /// parameters
  /// @dev There are several checks to make sure the parameters are acceptable
  /// @param _startFundingTime The UNIX time that the Campaign will be able to
  /// start receiving funds
  /// @param _endFundingTime The UNIX time that the Campaign will stop being able
  /// to receive funds
  /// @param _maximumFunding In wei, the Maximum amount that the Campaign can
  /// receive (currently the max is set at 10,000 ETH for the beta)
  /// @param _vaultAddress The address that will store the donated funds
  /// @param _tokenAddress Address of the token contract this contract controls

  function FundRequestCampaign(
  uint _startFundingTime,
  uint _endFundingTime,
  uint _maximumFunding,
  address _vaultAddress,
  address _tokenAddress

  ) {
    require(_endFundingTime >= now);          // Cannot end in the past
    require(_endFundingTime > _startFundingTime);
    require(_vaultAddress != 0);  // To prevent burning ETH

    startFundingTime = _startFundingTime;
    endFundingTime = _endFundingTime;
    maximumFunding = _maximumFunding;
    tokenContract = MiniMeToken(_tokenAddress);// The Deployed Token Contract
    vaultAddress = _vaultAddress;
  }

  /// @dev The fallback function is called when ether is sent to the contract, it
  /// simply calls `doPayment()` with the address that sent the ether as the
  /// `_owner`. Payable is a required solidity modifier for functions to receive
  /// ether, without this modifier functions will throw if ether is sent to them

  function ()  payable {
    doPayment(msg.sender);
  }

  /////////////////
  // TokenController interface
  /////////////////

  /// @notice `proxyPayment()` allows the caller to send ether to the Campaign and
  /// have the tokens created in an address of their choosing
  /// @param _owner The address that will hold the newly created tokens

  function proxyPayment(address _owner) payable returns(bool) {
    doPayment(_owner);
    return true;
  }

  /// @notice Notifies the controller about a transfer, for this Campaign all
  ///  transfers are allowed by default and no extra notifications are needed
  /// @param _from The origin of the transfer
  /// @param _to The destination of the transfer
  /// @param _amount The amount of the transfer
  /// @return False if the controller does not authorize the transfer
  function onTransfer(address _from, address _to, uint _amount) returns(bool) {
    return true;
  }

  /// @notice Notifies the controller about an approval, for this Campaign all
  ///  approvals are allowed by default and no extra notifications are needed
  /// @param _owner The address that calls `approve()`
  /// @param _spender The spender in the `approve()` call
  /// @param _amount The amount in the `approve()` call
  /// @return False if the controller does not authorize the approval
  function onApprove(address _owner, address _spender, uint _amount)
  returns(bool)
  {
    return true;
  }


  /// @dev `doPayment()` is an internal function that sends the ether that this
  ///  contract receives to the `vault` and creates tokens in the address of the
  ///  `_owner` assuming the Campaign is still accepting funds
  /// @param _owner The address that will hold the newly created tokens

  function doPayment(address _owner) internal {

    // First check that the Campaign is allowed to receive this donation
    require(now >= startFundingTime);
    require(now <= endFundingTime);
    require(validBeneficiary(_owner));
    require(tokenContract.controller() != 0);
    require(msg.value != 0);
    require(totalCollected + msg.value <= maximumFunding);

    //Track how much the Campaign has collected
    totalCollected += msg.value;

    //Send the ether to the vault
    require (vaultAddress.send(msg.value));

    // Creates an equal amount of tokens as ether sent. The new tokens are created
    //  in the `_owner` address

    uint tokens_to_be_generated = calculateTokensForTGE(msg.value);
    require (tokenContract.generateTokens(_owner, tokens_to_be_generated));

    return;
  }

  function calculateTokensForTGE(uint _wei) internal constant returns (uint) {
      return _wei; //TODO: calculate tokens
  }

  /// @notice `finalizeFunding()` ends the Campaign by calling setting the
  ///  controller to 0, thereby ending the issuance of new tokens and stopping the
  ///  Campaign from receiving more ether
  /// @dev `finalizeFunding()` can only be called after the end of the funding period.

  function finalizeFunding() {
    require(now >= endFundingTime);
    tokenContract.changeController(0);
  }

  /// @notice `onlyOwner` changes the location that ether is sent
  /// @param _newVaultAddress The address that will receive the ether sent to this
  ///  Campaign
  function setVault(address _newVaultAddress) onlyOwner {
    vaultAddress = _newVaultAddress;
  }

  function validBeneficiary(address beneficiary) internal constant returns (bool) {
      return allowed[beneficiary] == true;
  }

  function allow(address beneficiary) onlyOwner {
    allowed[beneficiary] = true;
  }


  function privatePresale() internal returns (bool) {
    return true;
  }

  function publicPresale() internal returns (bool) {
    return true;
  }
}