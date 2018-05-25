pragma solidity 0.4.24;

import "./Precondition.sol";
import "../../utils/strings.sol";


contract TokenWhitelistPrecondition is Precondition {

    using strings for *;

    event Allowed(address indexed token, bool allowed);
    event Allowed(address indexed token, bool allowed, bytes32 platform, string platformId);

    //platform -> platformId -> token => _allowed
    mapping(bytes32 => mapping(string => mapping(address => bool))) tokenWhitelist;

    //token => _allowed
    mapping(address => bool) defaultWhitelist;

    //all tokens that either got allowed or disallowed
    address[] public tokens;
    mapping(address => bool) existingToken;

    constructor(string _name, uint _version, bool _active) public Precondition(_name, _version, _active) {
        //constructor
    }

    function isValid(bytes32 _platform, string _platformId, address _token, uint256 /*_value */, address /* _funder */) external view returns (bool valid) {
        return !active || (defaultWhitelist[_token] == true || tokenWhitelist[_platform][extractRepository(_platformId)][_token] == true);
    }

    function allowDefaultToken(address _token, bool _allowed) public onlyOwner {
        defaultWhitelist[_token] = _allowed;
        if (!existingToken[_token]) {
            existingToken[_token] = true;
            tokens.push(_token);
        }
        emit Allowed(_token, _allowed);
    }

    function allow(bytes32 _platform, string _platformId, address _token, bool _allowed) external onlyOwner {
        tokenWhitelist[_platform][_platformId][_token] = _allowed;
        if (!existingToken[_token]) {
            existingToken[_token] = true;
            tokens.push(_token);
        }
        emit Allowed(_token, _allowed, _platform, _platformId);
    }

    function extractRepository(string _platformId) pure internal returns (string repository) {
        var sliced = string(_platformId).toSlice();
        var platform = sliced.split("|FR|".toSlice());
        return platform.toString();
    }

    function amountOfTokens() external view returns (uint) {
        return tokens.length;
    }
}