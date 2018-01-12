pragma solidity ^0.4.18;


import "../math/SafeMath.sol";
import "../pause/Pausable.sol";
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

    mapping (address => Countries) public allowed;

    MiniMeToken public tokenContract;

    uint public maxCap;         // In wei
    uint256 public totalCollected;         // In wei

    bool public personalCapActive = true;

    uint256 public personalCap;

    enum Countries {NOT_WHITELISTED, CHINA, KOREA, USA, OTHER}

    mapping (uint => bool) public allowedCountries;

    function FundRequestTokenGeneration(
    address _tokenAddress,
    address _founderWallet,
    address _advisorWallet,
    address _ecoSystemWallet,
    address _coldStorageWallet,
    uint _rate,
    uint _maxCap,
    uint256 _personalCap) public
    {
        tokenContract = MiniMeToken(_tokenAddress);
        founderWallet = _founderWallet;
        advisorWallet = _advisorWallet;
        ecoSystemWallet = _ecoSystemWallet;
        coldStorageWallet = _coldStorageWallet;
        rate = _rate;
        maxCap = _maxCap;
        personalCap = _personalCap;

        allowedCountries[uint(Countries.CHINA)] = true;
        allowedCountries[uint(Countries.KOREA)] = true;
        allowedCountries[uint(Countries.USA)] = true;
        allowedCountries[uint(Countries.OTHER)] = true;
    }

    function() public payable whenNotPaused {
        doPayment(msg.sender);
    }

    /// @notice `proxyPayment()` allows the caller to send ether to the Campaign and
    /// have the tokens created in an address of their choosing
    /// @param _owner The address that will hold the newly created tokens

    function proxyPayment(address _owner) public payable whenNotPaused returns (bool) {
        doPayment(_owner);
        return true;
    }

    function doPayment(address beneficiary) whenNotPaused internal {
        require(validPurchase(beneficiary));
        require(maxCapNotReached());
        require(personalCapNotReached(beneficiary));
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

    function allocateTokens(address beneficiary, uint256 tokensSold) public whenNotPaused onlyOwner {
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

    function validPurchase(address beneficiary) internal view returns (bool) {
        require(tokenContract.controller() != 0);
        require(msg.value >= 0.01 ether);

        Countries beneficiaryCountry = allowed[beneficiary];

        /* the country needs to > 0 (whitelisted) */
        require(uint(beneficiaryCountry) > uint(Countries.NOT_WHITELISTED));

        /* country needs to be allowed */
        require(allowedCountries[uint(beneficiaryCountry)] == true);
        return true;
    }

    function generateTokens(uint256 _total, address _owner, uint _pct) internal returns (bool) {
        uint256 tokensInWei = _total.div(100).mul(_pct);
        require(tokenContract.generateTokens(_owner, tokensInWei));
        return true;
    }

    function allow(address beneficiary, Countries _country) public onlyOwner {
        allowed[beneficiary] = _country;
    }

    function allowCountry(Countries _country, bool _allowed) public onlyOwner {
        require(uint(_country) > 0);
        allowedCountries[uint(_country)] = _allowed;
    }

    function maxCapNotReached() internal view returns (bool) {
        return totalCollected.add(msg.value) <= maxCap;
    }

    function personalCapNotReached(address _beneficiary) internal view returns (bool) {
        if (personalCapActive) {
            return deposits[_beneficiary].add(msg.value) <= personalCap;
        }
        else {
            return true;
        }
    }

    function setMaxCap(uint _maxCap) public onlyOwner {
        maxCap = _maxCap;
    }

    /* setters for wallets */
    function setFounderWallet(address _founderWallet) public onlyOwner {
        founderWallet = _founderWallet;
    }

    function setAdvisorWallet(address _advisorWallet) public onlyOwner {
        advisorWallet = _advisorWallet;
    }

    function setEcoSystemWallet(address _ecoSystemWallet) public onlyOwner {
        ecoSystemWallet = _ecoSystemWallet;
    }

    function setColdStorageWallet(address _coldStorageWallet) public onlyOwner {
        coldStorageWallet = _coldStorageWallet;
    }

    function setPersonalCap(uint256 _capInWei) public onlyOwner {
        personalCap = _capInWei;
    }

    function setPersonalCapActive(bool _active) public onlyOwner {
        personalCapActive = _active;
    }

    /* fix for accidental token sending */
    function withdrawToken(address _token, uint256 _amount) public onlyOwner {
        require(MiniMeToken(_token).transfer(owner, _amount));
    }

}