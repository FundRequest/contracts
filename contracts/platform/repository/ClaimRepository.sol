pragma solidity 0.4.23;

import "../../ownership/Owned.sol";
import "../../math/SafeMath.sol";
import "../../control/Callable.sol";
import "../../storage/EternalStorage.sol";


contract ClaimRepository is Callable {
    using SafeMath for uint256;

    EternalStorage public db;

    constructor(address _eternalStorage) public {
        //constructor
        require(_eternalStorage != address(0), "Eternal storage cannot be 0x0");
        db = EternalStorage(_eternalStorage);
    }

    function addClaim(address _solverAddress, bytes32 _platform, string _platformId, string _solver, address _token, uint256 _requestBalance) public onlyCaller returns (bool) {
        if (db.getAddress(keccak256("claims.solver_address", _platform, _platformId)) != address(0)) {
            require(db.getAddress(keccak256("claims.solver_address", _platform, _platformId)) == _solverAddress, "Adding a claim needs to happen with the same claimer as before");
        } else {
            db.setString(keccak256("claims.solver", _platform, _platformId), _solver);
            db.setAddress(keccak256("claims.solver_address", _platform, _platformId), _solverAddress);
        }

        uint tokenCount = db.getUint(keccak256("claims.tokenCount", _platform, _platformId));
        db.setUint(keccak256("claims.tokenCount", _platform, _platformId), tokenCount.add(1));
        db.setUint(keccak256("claims.token.amount", _platform, _platformId, _token), _requestBalance);
        db.setAddress(keccak256("claims.token.address", _platform, _platformId, tokenCount), _token);
        return true;
    }

    function isClaimed(bytes32 _platform, string _platformId) view external returns (bool claimed) {
        return db.getAddress(keccak256("claims.solver_address", _platform, _platformId)) != address(0);
    }

    function getSolverAddress(bytes32 _platform, string _platformId) view external returns (address solverAddress) {
        return db.getAddress(keccak256("claims.solver_address", _platform, _platformId));
    }

    function getSolver(bytes32 _platform, string _platformId) view external returns (string){
        return db.getString(keccak256("claims.solver", _platform, _platformId));
    }

    function getTokenCount(bytes32 _platform, string _platformId) view external returns (uint count) {
        return db.getUint(keccak256("claims.tokenCount", _platform, _platformId));
    }

    function getTokenByIndex(bytes32 _platform, string _platformId, uint _index) view external returns (address token) {
        return db.getAddress(keccak256("claims.token.address", _platform, _platformId, _index));
    }

    function getAmountByToken(bytes32 _platform, string _platformId, address _token) view external returns (uint token) {
        return db.getUint(keccak256("claims.token.amount", _platform, _platformId, _token));
    }

    function() external {
        // dont receive ether via fallback
    }
}
