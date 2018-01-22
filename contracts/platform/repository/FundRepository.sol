/*
 * Database Contract
 * Davy Van Roy
 * Quinten De Swaef
 */

contract FundRepository is Owned {

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
    string url;
    }

    //modifiers
    modifier onlyCaller {
        require(callers[msg.sender]);
        _;
    }

    function updateFunders(address _from, bytes32 _platform, bytes32 _platformId, uint256 _value) onlyCaller {
        bool existing = funds[_platform][_platformId].balances[_from] > 0;
        if (!existing) {
            funds[_platform][_platformId].funders.push(_from);
        }
        if (funders[_from] <= 0) {
            totalNumberOfFunders = totalNumberOfFunders.add(1);
            funders[_from].add(_value);
        }
    }

    function updateBalances(address _from, bytes32 _platform, bytes32 _platformId, string _url, uint256 _value) onlyCaller {
        if (funds[_platform][_platformId].totalBalance <= 0) {
            requestsFunded = requestsFunded.add(1);
        }
        funds[_platform][_platformId].balances[_from] = funds[_platform][_platformId].balances[_from].add(_value);
        funds[_platform][_platformId].totalBalance = funds[_platform][_platformId].totalBalance.add(_value);
        funds[_platform][_platformId].url = _url;
        totalBalance = totalBalance.add(_value);
        totalFunded = totalFunded.add(_value);
    }

    function doClaim(bytes32 platform, bytes32 platformId) onlyCaller {
        var funding = funds[platform][platformId];
        var requestBalance = funding.totalBalance;
        totalBalance = totalBalance.sub(requestBalance);
        for (uint i = 0; i < funding.funders.length; i++) {
            var funder = funding.funders[i];
            delete (funding.balances[funder]);
        }
        delete (funds[platform][platformId]);
        return true;
    }

    //constants
    function getFundInfo(bytes32 _platform, bytes32 _platformId, address _funder) public view returns (uint256, uint256, uint256, string) {
        Funding storage funding = funds[_platform][_platformId];
        return (funding.funders.length, funding.totalBalance, funding.balances[_funder], funding.url);
    }

    function balance(bytes32 _platform, bytes32 _platformId) view public returns (uint256) {
        return funds[_platform][_platformId].totalBalance;
    }

    //management of the repositories
    function updateCaller(address _caller, bool allowed) onlyOwner {
        callers[_caller] = allowed;
    }
}