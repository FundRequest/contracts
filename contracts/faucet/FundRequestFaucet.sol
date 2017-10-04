pragma solidity ^0.4.15;

import "../ownership/Ownable.sol";
import "../token/DefaultFundRequestToken.sol";

contract FundRequestFaucet is Ownable {

    using SafeMath for uint256;

    DefaultFundRequestToken public token;

    function FundRequestFaucet(address _tokenAddress) {
        token = DefaultFundRequestToken(_tokenAddress);
    }

    function init() onlyOwner public {
        token.mint(address(this), 10000000 * (10 ** token.decimals()));
    }


    /* default function, call this and get tokens */
    function() payable {
        token.transfer(msg.sender, (1 * (10**token.decimals())));
        //send everything back
        owner.transfer(msg.value);
    }

    function setTokenAddress(address _tokenAddress) onlyOwner public {
        token = DefaultFundRequestToken(_tokenAddress);
    }
}