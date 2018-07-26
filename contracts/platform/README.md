Platform Contracts
===


insert image

![](https://raw.githubusercontent.com/FundRequest/contracts/develop/.github/images/layout.png)

# FundRequestContract

```
fund(bytes32 _platform, string _platformId, address _token, uint256 _value) external returns (bool success)
etherFund(bytes32 _platform, string _platformId) payable external returns (bool success) 
claim(bytes32 platform, string platformId, string solver, address solverAddress, bytes32 r, bytes32 s, uint8 v) public returns (bool) 
refund(bytes32 _platform, string _platformId, address _funder) external onlyCaller returns (bool) 
```

# FundRepository

```
getFundInfo(bytes32 _platform, string _platformId, address _funder, address _token) public view returns (uint256 /* founderCount */, uint256 /* balance */, uint256 /* amount funded by */)
issueResolved(bytes32 _platform, string _platformId) public view returns (bool)
getFundedTokenCount(bytes32 _platform, string _platformId) public view returns (uint256) 
getFundedTokensByIndex(bytes32 _platform, string _platformId, uint _index) public view returns (address)
getFunderCount(bytes32 _platform, string _platformId) public view returns (uint)
getFunderByIndex(bytes32 _platform, string _platformId, uint index) external view returns (address)
amountFunded(bytes32 _platform, string _platformId, address _funder, address _token) public view returns (uint256)
balance(bytes32 _platform, string _platformId, address _token) view public returns (uint256)  
```

# ClaimRepository

```
isClaimed(bytes32 _platform, string _platformId) view external returns (bool claimed)
getSolverAddress(bytes32 _platform, string _platformId) view external returns (address solverAddress)
getSolver(bytes32 _platform, string _platformId) view external returns (string)
getTokenCount(bytes32 _platform, string _platformId) view external returns (uint count) 
getTokenByIndex(bytes32 _platform, string _platformId, uint _index) view external returns (address token)
getAmountByToken(bytes32 _platform, string _platformId, address _token) view external returns (uint token)
```
