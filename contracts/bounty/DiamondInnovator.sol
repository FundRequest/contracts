pragma solidity ^0.4.18;


import "../token/MiniMeToken.sol";


// FundRequest Diamond Innovator Token
//
// @authors:
// Davy Van Roy <davy.van.roy@gmail.com>
// Quinten De Swaef <quinten.de.swaef@gmail.com>
//
contract DiamondInnovator is MiniMeToken {

    function FundRequestToken()
    public
    MiniMeToken(
    0x0,
    0x0,
    0,
    'FundRequest Gold Innovator',
    1,
    'FDI',
    false)
    {
        //constructor
    }
}