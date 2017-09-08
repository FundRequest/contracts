pragma solidity ^0.4.8;

import "./CrowdsaleToken.sol";

contract FundRequestToken is CrowdsaleToken {

    function FundRequestToken(string _name, string _symbol, uint256 _initialSupply, uint _decimals, bool _mintable) CrowdsaleToken(_name, _symbol, _initialSupply, _decimals, _mintable) {
        //constructor
    }
}