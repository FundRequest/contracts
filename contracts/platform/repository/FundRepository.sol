pragma solidity 0.4.21;

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

    //token => _totalFunded
    mapping(address => uint256) public totalFunded;

    uint256 public requestsFunded;

    //funder => _hasFunded
    mapping(address => bool) funders;

    //platform -> platformId => _funding
    mapping(bytes32 => mapping(string => Funding)) funds;

    struct Funding {
        address[] funders; //funders that funded tokens
        address[] tokens; //tokens that were funded
        mapping(address => TokenFunding) tokenFunding;
        mapping(address => UserFunding) userFunding;
    }

    struct TokenFunding {
        mapping(address => uint256) balance;
        uint256 totalTokenBalance;
    }

    struct UserFunding {
        mapping(address => uint256) tokenBalances;
        bool funded;
    }

    function FundRepository(address _eternalStorage) public {
        db = EternalStorage(_eternalStorage);
    }

    function updateFunders(address _from, bytes32 _platform, string _platformId) public onlyCaller {
        bool existing = funds[_platform][_platformId].userFunding[_from].funded;
        if (!existing) {
            funds[_platform][_platformId].funders.push(_from);
        }
        if (funders[_from] == false) {
            totalNumberOfFunders = totalNumberOfFunders.add(1);
            funders[_from] = true;
        }
    }

    function updateBalances(address _from, bytes32 _platform, string _platformId, address _token, uint256 _value) public onlyCaller {
        if (funds[_platform][_platformId].tokens.length <= 0) {
            requestsFunded = requestsFunded.add(1);
        }

        if (funds[_platform][_platformId].tokenFunding[_token].totalTokenBalance <= 0) {
            funds[_platform][_platformId].tokens.push(_token);
        }

        //add to the current balance of the user for this token
        funds[_platform][_platformId].tokenFunding[_token].balance[_from] = funds[_platform][_platformId].tokenFunding[_token].balance[_from].add(_value);

        //add to the overall balance of this token
        funds[_platform][_platformId].tokenFunding[_token].totalTokenBalance = funds[_platform][_platformId].tokenFunding[_token].totalTokenBalance.add(_value);

        //add to the balance the user has funded for the request
        funds[_platform][_platformId].userFunding[_from].tokenBalances[_token] = funds[_platform][_platformId].userFunding[_from].tokenBalances[_token].add(_value);
        funds[_platform][_platformId].userFunding[_from].funded = true;

        db.setUint(keccak256("total_balance", _token), totalBalance(_token).add(_value));
        totalFunded[_token] = totalFunded[_token].add(_value);
    }

    function claimToken(bytes32 platform, string platformId, address _token) public onlyCaller returns (uint256) {
        uint256 totalTokenBalance = funds[platform][platformId].tokenFunding[_token].totalTokenBalance;
        delete funds[platform][platformId].tokenFunding[_token];

        db.setUint(keccak256("total_balance", _token), totalBalance(_token).sub(totalTokenBalance));
        return totalTokenBalance;
    }

    function finishResolveFund(bytes32 platform, string platformId) public onlyCaller returns (bool) {
        delete (funds[platform][platformId]);
        return true;
    }

    function totalBalance(address _token) public view returns (uint balance) {
        return db.getUint(keccak256("total_balance", _token));
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
        return funds[_platform][_platformId].userFunding[_funder].tokenBalances[_token];
    }

    function balance(bytes32 _platform, string _platformId, address _token) view public returns (uint256) {
        return funds[_platform][_platformId].tokenFunding[_token].totalTokenBalance;
    }

    function() public {
        // dont receive ether via fallback
    }
}