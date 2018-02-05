pragma solidity ^0.4.18;


import "../math/SafeMath.sol";
import "../pause/Pausable.sol";
import "../token/MiniMeToken.sol";


contract FundRequestTokenGeneration is Pausable {
    using SafeMath for uint256;

    MiniMeToken public tokenContract;

    address public tokensaleWallet;

    address public founderWallet;

    uint public rate;

    mapping (address => uint) public deposits;

    mapping (address => Countries) public allowed;

    uint public maxCap;         // In wei
    uint256 public totalCollected;         // In wei

    // personal caps and activations
    bool public personalCapActive = true;

    uint256 public personalCap;

    //country whitelisting
    enum Countries {NOT_WHITELISTED, CHINA, KOREA, USA, OTHER}
    mapping (uint => bool) public allowedCountries;

    //events
    event Paid(address indexed _beneficiary, uint256 _weiAmount, uint256 _tokenAmount, bool _personalCapActive);

    function FundRequestTokenGeneration(
    address _tokenAddress,
    address _founderWallet,
    address _tokensaleWallet,
    uint _rate,
    uint _maxCap,
    uint256 _personalCap) public
    {
        tokenContract = MiniMeToken(_tokenAddress);
        tokensaleWallet = _tokensaleWallet;
        founderWallet = _founderWallet;

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
        uint256 weiAmount = msg.value;
        uint256 updatedWeiRaised = totalCollected.add(weiAmount);
        uint256 tokensInWei = weiAmount.mul(rate);
        totalCollected = updatedWeiRaised;
        deposits[beneficiary] = deposits[beneficiary].add(msg.value);
        distributeTokens(beneficiary, tokensInWei);
        Paid(beneficiary, weiAmount, tokensInWei, personalCapActive);
        forwardFunds();
        return;
    }

    function allocateTokens(address beneficiary, uint256 tokensSold) public whenNotPaused onlyOwner {
        distributeTokens(beneficiary, tokensSold);
    }

    function finalizeTokenSale() public onlyOwner {
        pause();
        tokenContract.changeController(owner);
    }

    function distributeTokens(address beneficiary, uint256 tokensSold) internal {
        uint256 totalTokensInWei = tokensSold.mul(100).div(40);
        require(tokenContract.generateTokens(beneficiary, tokensSold));
        require(generateExtraTokens(totalTokensInWei, tokensaleWallet, 60));
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

    function generateExtraTokens(uint256 _total, address _owner, uint _pct) internal returns (bool) {
        uint256 tokensInWei = _total.div(100).mul(_pct);
        require(tokenContract.generateTokens(_owner, tokensInWei));
        return true;
    }

    function allow(address beneficiary, Countries _country) public onlyOwner {
        allowed[beneficiary] = _country;
    }

    function allowMultiple(address[] _beneficiaries, Countries _country) public onlyOwner {
        for (uint b = 0; b < _beneficiaries.length; b++) {
            allow(_beneficiaries[b], _country);
        }
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
    function setTokensaleWallet(address _tokensaleWallet) public onlyOwner {
        tokensaleWallet = _tokensaleWallet;
    }

    function setFounderWallet(address _founderWallet) public onlyOwner {
        founderWallet = _founderWallet;
    }


    function setPersonalCap(uint256 _capInWei) public onlyOwner {
        personalCap = _capInWei;
    }

    function setPersonalCapActive(bool _active) public onlyOwner {
        personalCapActive = _active;
    }

    function forwardFunds() internal {
        founderWallet.transfer(msg.value);
    }

    /* fix for accidental token sending */
    function withdrawToken(address _token, uint256 _amount) public onlyOwner {
        require(MiniMeToken(_token).transfer(owner, _amount));
    }

    //incase something does a suicide and funds end up here, we need to be able to withdraw them
    function withdraw(address _to) public onlyOwner {
        _to.transfer(this.balance);
    }
}