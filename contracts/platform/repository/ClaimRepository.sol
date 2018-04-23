pragma solidity 0.4.23;

import "../../ownership/Owned.sol";
import "../../math/SafeMath.sol";
import "../../control/Callable.sol";


contract ClaimRepository is Callable {
    using SafeMath for uint256;

    //platform -> platformId => _claim
    mapping(bytes32 => mapping(string => Claim)) claims;

    uint256 public totalClaims;

    struct Claim {
        address solverAddress;
        string solver;
        address[] tokens;
        mapping(address => uint256) amountPerTokens;
    }

    function ClaimRepository() public {
        //constructor
    }

    function addClaim(address _solverAddress, bytes32 _platform, string _platformId, string _solver, address _token, uint256 _requestBalance) public onlyCaller returns (bool) {
        if (claims[_platform][_platformId].solverAddress != address(0)) {
            require(claims[_platform][_platformId].solverAddress == _solverAddress);
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

    function() public {
        // dont receive ether via fallback
    }
}