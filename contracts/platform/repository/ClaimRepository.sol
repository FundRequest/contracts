import '../../ownership/Owned.sol';
import "../../math/SafeMath.sol";

contract ClaimRepository is Owned {
    using SafeMath for uint256;

    mapping (bytes32 => mapping (string => Claim)) claims;

    mapping public (address => bool) callers;

    uint256 public totalBalanceClaimed;
    uint256 public totalClaims;


    //modifiers
    modifier onlyCaller {
        require(callers[msg.sender]);
        _;
    }

    struct Claim {
        address solverAddress;
        string solver;
        uint256 requestBalance;
    }

    function ClaimRepository() {
        //constructor
    }

    function addClaim(address _solverAddress, bytes32 _platform, string _platformId, string _solver, uint256 _requestBalance) public onlyCaller returns (bool) {
        claims[_platform][_platformId].solver = _solver;
        claims[_platform][_platformId].solverAddress = _solverAddress;
        claims[_platform][_platformId].requestBalance = _requestBalance;
        totalBalanceClaimed = totalBalanceClaimed.add(_requestBalance);
        totalClaims = totalClaims.add(1);
        return true;
    }

    //management of the repositories
    function updateCaller(address _caller, bool allowed) public onlyOwner {
        callers[_caller] = allowed;
    }
}