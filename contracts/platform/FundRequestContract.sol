pragma solidity ^0.4.13;


import "../math/SafeMath.sol";
import "../token/FundRequestToken.sol";
import '../ownership/Owned.sol';
import "../token/ApproveAndCallFallback.sol";
import "../utils/strings.sol";


/*
 * Main FundRequest Contract
 * Davy Van Roy
 * Quinten De Swaef
 */
contract FundRequestContract is Owned, ApproveAndCallFallBack {

  using SafeMath for uint256;
  using strings for *;

  event Funded(address indexed from, bytes32 platform, bytes32 platformId, string url, uint256 value);

  event LOG(string logdata);

  FundRequestToken public token;

  event Claimed(address indexed solver, bytes32 platform, bytes32 platformId, string url, uint256 value);

  struct Funding {
  address[] funders;
  mapping (address => uint256) balances;
  uint256 totalBalance;
  string url;
  }

  uint256 public totalBalance;

  uint256 public totalFunded;

  mapping (address => uint256) funders;

  uint256 public totalNumberOfFunders;

  uint256 public requestsFunded;


  mapping (bytes32 => mapping (bytes32 => Funding)) funds;

  function FundRequestContract(address _tokenAddress) public {
    setTokenAddress(_tokenAddress);
  }

  function setTokenAddress(address _tokenAddress) public onlyOwner {
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

  address public claimSignerAddress;

  function setClaimSignerAddress(address _claimSignerAddress) public {
    claimSignerAddress = _claimSignerAddress;
  }

  function claim(bytes32 platform, bytes32 platformId, string solver, address solverAddress, bytes32 r, bytes32 s, uint8 v) public returns (bool) {
    require(validClaim(platform, platformId, solver, solverAddress, r, s, v));
    var funding = funds[platform][platformId];
    var requestBalance = funding.totalBalance;
    var url = funding.url;
    totalBalance = totalBalance.sub(requestBalance);
    for (uint i = 0; i < funding.funders.length; i++) {
      var funder = funding.funders[i];
      delete (funding.balances[funder]);
    }
    delete (funds[platform][platformId]);

    require(token.transfer(solverAddress, requestBalance));
    Claimed(solverAddress, platform, platformId, url, requestBalance);
    return true;
  }

  function validClaim(bytes32 platform, bytes32 platformId, string solver, address solverAddress, bytes32 r, bytes32 s, uint8 v) internal view returns (bool) {
    var h = sha3(createClaimMsg(platform, platformId, solver, solverAddress));
    address signerAddress = ecrecover(h, v, r, s);
    return claimSignerAddress == signerAddress;
  }

  function createClaimMsg(bytes32 platform, bytes32 platformId, string solver, address solverAddress) internal pure returns (string) {
    return strings.bytes32ToString(platform)
    .strConcat(prependUnderscore(strings.bytes32ToString(platformId)))
    .strConcat(prependUnderscore(solver))
    .strConcat(prependUnderscore(strings.addressToString(solverAddress)));
  }

  function prependUnderscore(string str) internal pure returns (string) {
    return "_".strConcat(str);
  }

}