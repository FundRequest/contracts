pragma solidity 0.4.23;

import "../../math/SafeMath.sol";
import "../../control/Callable.sol";
import "../../storage/EternalStorage.sol";


/*
 * Database Contract
 * Davy Van Roy
 * Quinten De Swaef
 */
contract FundRepository is Callable {

    using SafeMath for uint256;

    EternalStorage public db;


    //platform -> platformId => _funding
    mapping(bytes32 => mapping(string => Funding)) funds;

    struct Funding {
        address[] funders; //funders that funded tokens
        address[] tokens; //tokens that were funded
        mapping(address => TokenFunding) tokenFunding;
    }

    struct TokenFunding {
        mapping(address => uint256) balance;
        uint256 totalTokenBalance;
    }

    constructor(address _eternalStorage) public {
        db = EternalStorage(_eternalStorage);
    }

    function updateFunders(address _from, bytes32 _platform, string _platformId) public onlyCaller {
        bool existing = db.getBool(keccak256(abi.encodePacked("funds.userHasFunded", _platform, _platformId, _from)));
        if (!existing) {
            uint funderCount = getFunderCount(_platform, _platformId);
            db.setAddress(keccak256(abi.encodePacked("funds.funders.address", _platform, _platformId, funderCount)), _from);
            db.setUint(keccak256(abi.encodePacked("funds.funderCount", _platform, _platformId)), funderCount.add(1));
        }
    }

    function updateBalances(address _from, bytes32 _platform, string _platformId, address _token, uint256 _value) public onlyCaller {
        if (balance(_platform, _platformId, _token) <= 0) {
            //add to the list of tokens for this platformId
            uint tokenCount = getFundedTokenCount(_platform, _platformId);
            db.setAddress(keccak256(abi.encodePacked("funds.token.address", _platform, _platformId, tokenCount)), _token);
            db.setUint(keccak256(abi.encodePacked("funds.tokenCount", _platform, _platformId)), tokenCount.add(1));
        }

        //add to the balance of this platformId for this token
        db.setUint(keccak256(abi.encodePacked("funds.tokenBalance", _platform, _platformId, _token)), balance(_platform, _platformId, _token).add(_value));

        //add to the balance the user has funded for the request
        db.setUint(keccak256(abi.encodePacked("funds.amountFundedByUser", _platform, _platformId, _from, _token)), amountFunded(_platform, _platformId, _from, _token).add(_value));

        //add the fact that the user has now funded this platformId
        db.setBool(keccak256(abi.encodePacked("funds.userHasFunded", _platform, _platformId, _from)), true);
    }

    function claimToken(bytes32 platform, string platformId, address _token) public onlyCaller returns (uint256) {
        require(!issueResolved(platform, platformId), "Can't claim token, issue is already resolved.");
        uint256 totalTokenBalance = balance(platform, platformId, _token);
        db.deleteUint(keccak256(abi.encodePacked("funds.tokenBalance", platform, platformId, _token)));
        return totalTokenBalance;
    }

    function finishResolveFund(bytes32 platform, string platformId) public onlyCaller returns (bool) {
        db.setBool(keccak256(abi.encodePacked("funds.issueResolved", platform, platformId)), true);
        return true;
    }

    //constants
    function getFundInfo(bytes32 _platform, string _platformId, address _funder, address _token) public view returns (uint256, uint256, uint256) {
        return (
        getFunderCount(_platform, _platformId),
        balance(_platform, _platformId, _token),
        amountFunded(_platform, _platformId, _funder, _token)
        );
    }

    function issueResolved(bytes32 _platform, string _platformId) public view returns (bool) {
        return db.getBool(keccak256(abi.encodePacked("funds.issueResolved", _platform, _platformId)));
    }

    function getFundedTokenCount(bytes32 _platform, string _platformId) public view returns (uint256) {
        return db.getUint(keccak256(abi.encodePacked("funds.tokenCount", _platform, _platformId)));
    }

    function getFundedTokensByIndex(bytes32 _platform, string _platformId, uint _index) public view returns (address) {
        return db.getAddress(keccak256(abi.encodePacked("funds.token.address", _platform, _platformId, _index)));
    }

    function getFunderCount(bytes32 _platform, string _platformId) public view returns (uint) {
        return db.getUint(keccak256(abi.encodePacked("funds.funderCount", _platform, _platformId)));
    }

    function getFunderByIndex(bytes32 _platform, string _platformId, uint index) external view returns (address) {
        return db.getAddress(keccak256(abi.encodePacked("funds.funders.address", _platform, _platformId, index)));
    }

    function amountFunded(bytes32 _platform, string _platformId, address _funder, address _token) public view returns (uint256) {
        return db.getUint(keccak256(abi.encodePacked("funds.amountFundedByUser", _platform, _platformId, _funder, _token)));
    }

    function balance(bytes32 _platform, string _platformId, address _token) view public returns (uint256) {
        return db.getUint(keccak256(abi.encodePacked("funds.tokenBalance", _platform, _platformId, _token)));
    }

    function() public {
        // dont receive ether via fallback
    }
}