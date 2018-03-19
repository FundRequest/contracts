pragma solidity ^0.4.18;

import '../../ownership/Owned.sol';
import "../../math/SafeMath.sol";

contract ClaimRepository is Owned {
    using SafeMath for uint256;

    mapping(bytes32 => mapping(string => Claim)) claims;

    mapping(address => bool) public callers;

    uint256 public totalClaims;


    //modifiers
    modifier onlyCaller {
        require(callers[msg.sender]);
        _;
    }

    struct Claim {
        address solverAddress;
        string solver;
        address[] tokens;
        mapping(address => uint256) amountPerTokens;
    }

    function ClaimRepository() {
        //constructor
    }

    function addClaim(address _solverAddress, bytes32 _platform, string _platformId, string _solver, address _token, uint256 _requestBalance) public onlyCaller returns (bool) {
        if (claims[_platform][_platformId].solverAddress != address(0)) {
            claims[_platform][_platformId].tokens.push(_token);
            claims[_platform][_platformId].amountPerTokens[_token] = _requestBalance;
        } else {
            claims[_platform][_platformId].solver = _solver;
            claims[_platform][_platformId].solverAddress = _solverAddress;
            claims[_platform][_platformId].tokens.push(_token);
            claims[_platform][_platformId].amountPerTokens[_token] = _requestBalance;
            totalClaims = totalClaims.add(1);
        }
        return true;
    }

    //management of the repositories
    function updateCaller(address _caller, bool allowed) public onlyOwner {
        callers[_caller] = allowed;
    }
}