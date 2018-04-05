pragma solidity 0.4.21;

import "./Precondition.sol";

contract TokenWhitelistPrecondition is Precondition {

    event Allowed(address indexed token, bool allowed);
    event Allowed(address indexed token, bool allowed, bytes32 platform, string platformId);

    //platform -> platformId -> token => _allowed
    mapping(bytes32 => mapping(string => mapping(address => bool))) tokenWhitelist;

    //token => _allowed
    mapping(address => bool) defaultWhitelist;

    function TokenWhitelistPrecondition(string _name, uint _version, bool _active) public
    Precondition(_name, _version, _active) {

    }

    function isValid(bytes32 _platform, string _platformId, address _token, uint256 _value, address _funder) public view returns (bool valid){
        return !active || (defaultWhitelist[_token] == true || tokenWhitelist[_platform][_platformId][_token] == true);
    }

    function allowDefaultToken(address _token, bool _allowed) public onlyOwner {
        defaultWhitelist[_token] = _allowed;
        Allowed(_token, _allowed);
    }

    function allow(bytes32 _platform, string _platformId, address _token, bool _allowed) public onlyOwner {
        tokenWhitelist[_platform][_platformId][_token] = _allowed;
        Allowed(_token, _allowed, _platform, _platformId);
    }
}