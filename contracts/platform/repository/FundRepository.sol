pragma solidity ^0.4.18;


import '../../ownership/Owned.sol';
import "../../math/SafeMath.sol";


/*
 * Database Contract
 * Davy Van Roy
 * Quinten De Swaef
 */
contract FundRepository is Owned {

    using SafeMath for uint256;

    uint256 public totalNumberOfFunders;

    mapping (address => uint256) funders;

    mapping(address => uint256) public totalFunded;

    uint256 public requestsFunded;

    mapping (address => uint256) public totalBalance;

    mapping (bytes32 => mapping (string => Funding)) funds;

    mapping(address => bool) public callers;

    struct Funding {
        address[] funders; //funders that funded tokens
        address[] tokens; //tokens that were funded
        mapping (address => TokenFunding) tokenFunding;
        mapping(address => mapping (address => uint256)) userFunding;
    }

    struct TokenFunding {
        mapping (address => uint256) balance;
        uint256 totalTokenBalance;
    }

    //modifiers
    modifier onlyCaller {
        require(callers[msg.sender]);
        _;
    }

    function FundRepository() {
        //constructor
    }

    function updateFunders(address _from, bytes32 _platform, string _platformId, uint256 _value) public onlyCaller {
        bool existing = funds[_platform][_platformId].funders[_from] > 0;
        if (!existing) {
            funds[_platform][_platformId].funders.push(_from);
        }
        if (funders[_from] <= 0) {
            totalNumberOfFunders = totalNumberOfFunders.add(1);
            funders[_from].add(_value);
        }
    }

    function updateBalances(address _from, bytes32 _platform, string _platformId, address _token, uint256 _value) public onlyCaller {
        if (funds[_platform][_platformId].tokens.length <= 0) {
            requestsFunded = requestsFunded.add(1);
        }

        if(funds[_platform][_platformId].token[_token] <= 0) {
            funds[_platform][_platformId].token[_token].push(_token);
        }

        funds[_platform][_platformId].tokenFunding[_token].balance[_from] = funds[_platform][_platformId].tokenFunding[_token].balance[_from].add(_value); //add to the current balance of the user for this token
        funds[_platform][_platformId].tokenFunding[_token].totalTokenBalance = funds[_platform][_platformId].tokenFunding[_token].totalTokenBalance.add(_value); //add to the overal balance of this token

        funds[_platform][_platformId].userFunding[_from].balance[_token] = funds[_platform][_platformId].userFunding[_from].balance[_token].add(_value);

        totalBalance[_token] = totalBalance.add(_value);
        totalFunded[_token] = totalFunded.add(_value);
    }

    function claimToken(bytes32 platform, string platformId, address _token) public onlyCaller returns (uint256) {
        var totalTokenBalance = funds[platform][platformId].tokenFunding[_token].totalBalance;
        delete funds[platform][platformId].tokens[_token];
        delete funds[platform][platformId].tokenFunding[_token];
        totalBalance[_token] = totalBalance[_token].sub(totalTokenBalance);
        return totalTokenBalance;
    }

    function finishResolveFund(bytes32 platform, string platformId) public onlyCaller returns (bool) {
        require(funds[platform][platformId].tokens.length <= 0);
        delete (funds[platform][platformId]);
        return true;
    }

    //constants
    function getFundInfo(bytes32 _platform, string _platformId, address _funder) public view returns (uint256, uint256, uint256) {
        return (
        getFunderCount(_platform, _platformId),
        balance(_platform, _platformId),
        amountFunded(_platform, _platformId, _funder)
        );
    }

    function getFundedTokens(bytes32 _platform, string _platformId) public view returns (uint256[]){
        return funds[_platform][_platformId].tokens;
    }

    function getFunderCount(bytes32 _platform, string _platformId) public view returns (uint){
        return funds[_platform][_platformId].funders.length;
    }

    function amountFunded(bytes32 _platform, string _platformId, address _funder) public view returns (uint256){
        return funds[_platform][_platformId].balances[_funder];
    }

    function balance(bytes32 _platform, string _platformId) view public returns (uint256) {
        return funds[_platform][_platformId].totalBalance;
    }

    //management of the repositories
    function updateCaller(address _caller, bool allowed) public onlyOwner {
        callers[_caller] = allowed;
    }
}