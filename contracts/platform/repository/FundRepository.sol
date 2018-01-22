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

    uint256 public totalFunded;

    uint256 public requestsFunded;

    uint256 public totalBalance;

    mapping (bytes32 => mapping (bytes32 => Funding)) funds;

    mapping (address => bool) callers;

    struct Funding {
    address[] funders;
    mapping (address => uint256) balances;
    uint256 totalBalance;
    bytes32 url;
    }

    //modifiers
    modifier onlyCaller {
        require(callers[msg.sender]);
        _;
    }

    function FundRepository() {
        //constructor
    }

    function updateFunders(address _from, bytes32 _platform, bytes32 _platformId, uint256 _value) public onlyCaller {
        bool existing = funds[_platform][_platformId].balances[_from] > 0;
        if (!existing) {
            funds[_platform][_platformId].funders.push(_from);
        }
        if (funders[_from] <= 0) {
            totalNumberOfFunders = totalNumberOfFunders.add(1);
            funders[_from].add(_value);
        }
    }

    function updateBalances(address _from, bytes32 _platform, bytes32 _platformId, bytes32 _url, uint256 _value) public onlyCaller {
        if (funds[_platform][_platformId].totalBalance <= 0) {
            requestsFunded = requestsFunded.add(1);
        }
        funds[_platform][_platformId].balances[_from] = funds[_platform][_platformId].balances[_from].add(_value);
        funds[_platform][_platformId].totalBalance = funds[_platform][_platformId].totalBalance.add(_value);
        funds[_platform][_platformId].url = _url;
        totalBalance = totalBalance.add(_value);
        totalFunded = totalFunded.add(_value);
    }

    function doClaim(bytes32 platform, bytes32 platformId) public onlyCaller returns (uint) {
        var funding = funds[platform][platformId];
        var requestBalance = funding.totalBalance;
        totalBalance = totalBalance.sub(requestBalance);
        for (uint i = 0; i < funding.funders.length; i++) {
            var funder = funding.funders[i];
            delete (funding.balances[funder]);
        }
        delete (funds[platform][platformId]);
        return requestBalance;
    }

    function getFunderCount(bytes32 _platform, bytes32 _platformId) public view returns (uint){
        return funds[_platform][_platformId].funders.length;
    }

    function getFundBalanceOfFunder(bytes32 _platform, bytes32 _platformId, address _funder) public view returns (uint256){
        return funds[_platform][_platformId].balances[_funder];
    }

    function getFundUrl(bytes32 _platform, bytes32 _platformId) public view returns (bytes32) {
        return funds[_platform][_platformId].url;
    }

    function balance(bytes32 _platform, bytes32 _platformId) view public returns (uint256) {
        return funds[_platform][_platformId].totalBalance;
    }

    //management of the repositories
    function updateCaller(address _caller, bool allowed) public onlyOwner {
        callers[_caller] = allowed;
    }
}