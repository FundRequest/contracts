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

    uint256 public totalNumberOfFunders;

    uint256 public requestsFunded;

    //funder => _hasFunded
    mapping(address => bool) funders;

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
            funds[_platform][_platformId].funders.push(_from);
        }
        if (funders[_from] == false) {
            totalNumberOfFunders = totalNumberOfFunders.add(1);
            funders[_from] = true;
        }
    }

    function updateBalances(address _from, bytes32 _platform, string _platformId, address _token, uint256 _value) public onlyCaller {

        //if there are no tokens available for this platformId
        if (funds[_platform][_platformId].tokens.length <= 0) {
            //add to the amount of requests that are funded
            requestsFunded = requestsFunded.add(1);
        }

        if (balance(_platform, _platformId, _token) <= 0) {
            //add to the list of tokens for this platformId
            funds[_platform][_platformId].tokens.push(_token);
        }

        //add to the current balance of the user for this token
        funds[_platform][_platformId].tokenFunding[_token].balance[_from] = funds[_platform][_platformId].tokenFunding[_token].balance[_from].add(_value);

        //add to the balance of this platformId for this token
        db.setUint(keccak256("funds.tokenBalance", _platform, _platformId, _token), balance(_platform, _platformId, _token).add(_value));

        //add to the balance the user has funded for the request
        db.setUint(keccak256("funds.amountFundedByUser", _platform, _platformId, _from, _token), amountFunded(_platform, _platformId, _from, _token).add(_value));

        //add the fact that the user has now funded this platformId
        db.setBool(keccak256(abi.encodePacked("funds.userHasFunded", _platform, _platformId, _from)), true);
    }

    function claimToken(bytes32 platform, string platformId, address _token) public onlyCaller returns (uint256) {
        uint256 totalTokenBalance = balance(platform, platformId, _token);
        delete funds[platform][platformId].tokenFunding[_token];
        return totalTokenBalance;
    }

    function finishResolveFund(bytes32 platform, string platformId) public onlyCaller returns (bool) {
        delete (funds[platform][platformId]);
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

    function getFundedTokenCount(bytes32 _platform, string _platformId) public view returns (uint256) {
        return funds[_platform][_platformId].tokens.length;
    }

    function getFundedTokensByIndex(bytes32 _platform, string _platformId, uint _index) public view returns (address) {
        return funds[_platform][_platformId].tokens[_index];
    }

    function getFunderCount(bytes32 _platform, string _platformId) public view returns (uint) {
        return funds[_platform][_platformId].funders.length;
    }

    function amountFunded(bytes32 _platform, string _platformId, address _funder, address _token) public view returns (uint256) {
        return db.getUint(keccak256("funds.amountFundedByUser", _platform, _platformId, _funder, _token));
    }

    function balance(bytes32 _platform, string _platformId, address _token) view public returns (uint256) {
        return db.getUint(keccak256("funds.tokenBalance", _platform, _platformId, _token));
    }

    function() public {
        // dont receive ether via fallback
    }
}