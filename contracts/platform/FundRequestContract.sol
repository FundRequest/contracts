pragma solidity ^0.4.13;


import "../math/SafeMath.sol";
import "../token/FundRequestToken.sol";
import '../ownership/Owned.sol';


contract FundRequestContract is Owned {

  using SafeMath for uint256;

  event Funded(address indexed from, bytes32 platform, bytes32 platformId, string url, uint256 value);

  event Claimed(address indexed solver, bytes32 platform, bytes32 platformId, string url, uint256 value);

  FundRequestToken public token;

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

  function fund(bytes32 _platform, bytes32 _platformId, string _url, uint256 _value) public returns (bool success) {
    require(_value > 0);
    require(token.transferFrom(msg.sender, address(this), _value));
    updateFunders(msg.sender, _platform, _platformId, _value);
    updateBalances(msg.sender, _platform, _platformId, _url, _value);
    Funded(msg.sender, _platform, _platformId, _url, _value);
    return true;
  }

  function balance(bytes32 _platform, bytes32 _platformId) view public returns (uint256) {
    return funds[_platform][_platformId].totalBalance;
  }

  function getFundInfo(bytes32 _platform, bytes32 _platformId) public constant returns (uint256, uint256, uint256, string) {
    Funding funding = funds[_platform][_platformId];
    return (funding.funders.length, funding.totalBalance, funding.balances[msg.sender], funding.url);
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
    var claimMsg = strConcat(
    strConcat(bytes32ToString(platform), "_"),
    strConcat(bytes32ToString(platformId), "_"),
    strConcat(solver, "_"),
    strConcat("0x", toAsciiString(solverAddress))
    );
    var h = sha3(claimMsg);
    address signerAddress = ecrecover(h, v, r, s);
    return claimSignerAddress == signerAddress;
  }


  function toAsciiString(address x) internal pure returns (string) {
    bytes memory s = new bytes(40);
    for (uint i = 0; i < 20; i++) {
      byte b = byte(uint8(uint(x) / (2 ** (8 * (19 - i)))));
      byte hi = byte(uint8(b) / 16);
      byte lo = byte(uint8(b) - 16 * uint8(hi));
      s[2 * i] = charToByte(hi);
      s[2 * i + 1] = charToByte(lo);
    }
    return string(s);
  }

  function charToByte(byte b) internal pure returns (byte c) {
    if (b < 10) return byte(uint8(b) + 0x30);
    else return byte(uint8(b) + 0x57);
  }

  function bytes32ToString(bytes32 x) internal pure returns (string) {
    bytes memory bytesString = new bytes(32);
    uint charCount = 0;
    for (uint j = 0; j < 32; j++) {
      byte ch = byte(bytes32(uint(x) * 2 ** (8 * j)));
      if (ch != 0) {
        bytesString[charCount] = ch;
        charCount++;
      }
    }
    bytes memory bytesStringTrimmed = new bytes(charCount);
    for (j = 0; j < charCount; j++) {
      bytesStringTrimmed[j] = bytesString[j];
    }
    return string(bytesStringTrimmed);
  }

  function strConcat(string _a, string _b, string _c, string _d, string _e) internal pure returns (string){
    bytes memory _ba = bytes(_a);
    bytes memory _bb = bytes(_b);
    bytes memory _bc = bytes(_c);
    bytes memory _bd = bytes(_d);
    bytes memory _be = bytes(_e);
    string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
    bytes memory babcde = bytes(abcde);
    uint k = 0;
    for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
    for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
    for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
    for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
    for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
    return string(babcde);
  }

  function strConcat(string _a, string _b, string _c, string _d) internal pure returns (string) {
    return strConcat(_a, _b, _c, _d, "");
  }

  function strConcat(string _a, string _b, string _c) internal pure returns (string) {
    return strConcat(_a, _b, _c, "", "");
  }

  function strConcat(string _a, string _b) internal pure returns (string) {
    return strConcat(_a, _b, "", "", "");
  }

}