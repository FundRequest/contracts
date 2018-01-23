pragma solidity ^0.4.13;


import "../math/SafeMath.sol";
import "../token/FundRequestToken.sol";
import "./repository/FundRepository.sol";
import "./repository/ClaimRepository.sol";
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

    event Funded(address indexed from, bytes32 platform, bytes32 platformId, uint256 value);

    event Claimed(address indexed solverAddress, bytes32 platform, bytes32 platformId, string solver, uint256 value);

    FundRequestToken public token;

    //repositories
    FundRepository public fundRepository;

    ClaimRepository public claimRepository;

    address public claimSignerAddress;

    modifier addressNotNull(address target) {
        require(target != address(0));
        _;
    }

    function FundRequestContract(
    address _tokenAddress,
    address _fundRepository,
    address _claimRepository
    ) public {
        setTokenAddress(_tokenAddress);
        setFundRepository(_fundRepository);
        setClaimRepository(_claimRepository);
    }

    //entrypoints
    function fund(bytes32 _platform, bytes32 _platformId, uint256 _value) public returns (bool success) {
        require(doFunding(_platform, _platformId, _value, msg.sender));
        return true;
    }

    function receiveApproval(address _from, uint _amount, address _token, bytes _data) public {
        //first iteration, we only allow fnd tokens to be sent here
        require(_token == address(token));
        var sliced = string(_data).toSlice();
        var platform = sliced.split("|AAC|".toSlice());
        var platformId = sliced.split("|AAC|".toSlice());
        require(doFunding(platform.toBytes32(), platformId.toBytes32(), _amount, _from));
    }

    function doFunding(bytes32 _platform, bytes32 _platformId, uint256 _value, address _funder) internal returns (bool success){
        require(_value > 0);
        require(token.transferFrom(_funder, address(this), _value));
        fundRepository.updateFunders(_funder, _platform, _platformId, _value);
        fundRepository.updateBalances(_funder, _platform, _platformId, _value);
        Funded(_funder, _platform, _platformId, _value);
        return true;
    }

    function claim(bytes32 platform, bytes32 platformId, string solver, address solverAddress, bytes32 r, bytes32 s, uint8 v) public returns (bool) {
        require(validClaim(platform, platformId, solver, solverAddress, r, s, v));
        uint requestBalance = fundRepository.resolveFund(platform, platformId);
        require(token.transfer(solverAddress, requestBalance));
        require(claimRepository.addClaim(solverAddress, platform, platformId, solver, requestBalance));
        Claimed(solverAddress, platform, platformId, solver, requestBalance);
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

    function setFundRepository(address _repositoryAddress) public onlyOwner {
        fundRepository = FundRepository(_repositoryAddress);
    }

    function setClaimRepository(address _claimRepository) public onlyOwner {
        claimRepository = ClaimRepository(_claimRepository);
    }

    function setTokenAddress(address _tokenAddress) addressNotNull(_tokenAddress) public onlyOwner {
        token = FundRequestToken(_tokenAddress);
        assert(token.isFundRequestToken());
    }

    function setClaimSignerAddress(address _claimSignerAddress) addressNotNull(_claimSignerAddress) public onlyOwner {
        claimSignerAddress = _claimSignerAddress;
    }
}