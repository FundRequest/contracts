pragma solidity ^0.4.13;


import "../math/SafeMath.sol";
import "../token/FundRequestToken.sol";
import "../token/ApproveAndCallFallback.sol";
import "../utils/strings.sol";


/*
 * Main FundRequest Contract
 * Davy Van Roy
 * Quinten De Swaef
 */
contract FundRequestContract is ApproveAndCallFallBack {

    using SafeMath for uint256;
    using strings for *;

    event Funded(address indexed from, bytes32 platform, bytes32 platformId, string url, uint256 value);
    event LOG(string logdata);

    FundRequestToken public token;

    uint256 public totalBalance;

    uint256 public totalFunded;

    mapping (address => uint256) funders;

    uint256 public totalNumberOfFunders;

    uint256 public requestsFunded;

    mapping (bytes32 => mapping (bytes32 => Funding)) funds;


    struct Funding {
        address[] funders;
        mapping (address => uint256) balances;
        uint256 totalBalance;
        string url;
    }

    //constructor

    function FundRequestContract(address _tokenAddress) public {
        token = FundRequestToken(_tokenAddress);
        assert(token.isFundRequestToken());
    }

    //entrypoints

    function fund(bytes32 _platform, bytes32 _platformId, string _url, uint256 _value) public returns (bool success) {
        require(doFunding(_platform, _platformId, _url, _value, msg.sender));
        return true;
    }

    function receiveApproval(address _from, uint _amount, address _token, bytes _data) public {
        //first iteration, we only allow fnd tokens to be sent here
        require(_token == address(token));
        var sliced = string(_data).toSlice();
        var platform = sliced.split("|".toSlice());
        var platformId = sliced.split("|".toSlice());
        var url = sliced.split("|".toSlice());
        require(doFunding(platform.toBytes32(), platformId.toBytes32(), url.toString(), _amount, _from));
    }

    function doFunding(bytes32 _platform, bytes32 _platformId, string _url, uint256 _value, address _funder) internal returns (bool success){
        require(_value > 0);
        require(token.transferFrom(_funder, address(this), _value));
        updateFunders(_funder, _platform, _platformId, _value);
        updateBalances(_funder, _platform, _platformId, _url, _value);
        Funded(_funder, _platform, _platformId, _url, _value);
        return true;
    }

    // internal methods

    function updateFunders(address _from, bytes32 _platform, bytes32 _platformId, uint256 _value) internal {
        bool existing = funds[_platform][_platformId].balances[_from] > 0;
        if (!existing) {
            funds[_platform][_platformId].funders.push(_from);
        }
        if (funders[_from] <= 0) {
            totalNumberOfFunders = totalNumberOfFunders.add(1);
            funders[_from].add(_value);
        }
    }

    function updateBalances(address _from, bytes32 _platform, bytes32 _platformId, string _url, uint256 _value) internal {
        if (funds[_platform][_platformId].totalBalance <= 0) {
            requestsFunded = requestsFunded.add(1);
        }
        funds[_platform][_platformId].balances[_from] = funds[_platform][_platformId].balances[_from].add(_value);
        funds[_platform][_platformId].totalBalance = funds[_platform][_platformId].totalBalance.add(_value);
        funds[_platform][_platformId].url = _url;
        totalBalance = totalBalance.add(_value);
        totalFunded = totalFunded.add(_value);
    }

    // constant methods

    function balance(bytes32 _platform, bytes32 _platformId) view public returns (uint256) {
        return funds[_platform][_platformId].totalBalance;
    }

    function getFundInfo(bytes32 _platform, bytes32 _platformId, address _funder) public view returns (uint256, uint256, uint256, string) {
        Funding storage funding = funds[_platform][_platformId];
        return (funding.funders.length, funding.totalBalance, funding.balances[_funder], funding.url);
    }
}