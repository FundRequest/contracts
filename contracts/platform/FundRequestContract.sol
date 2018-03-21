pragma solidity ^0.4.13;


import "../math/SafeMath.sol";
import "../token/FundRequestToken.sol";
import "../token/ERC20.sol";
import "./repository/FundRepository.sol";
import "./repository/ClaimRepository.sol";
import '../ownership/Owned.sol';
import "../token/ApproveAndCallFallback.sol";
import "../utils/strings.sol";
import "./validation/Precondition.sol";


/*
 * Main FundRequest Contract
 * Davy Van Roy
 * Quinten De Swaef
 */
contract FundRequestContract is Owned, ApproveAndCallFallBack {

    using SafeMath for uint256;
    using strings for *;

    event Funded(address indexed from, bytes32 platform, string platformId, address token, uint256 value);

    event Claimed(address indexed solverAddress, bytes32 platform, string platformId, string solver, address token, uint256 value);

    event LOG(uint);


    FundRequestToken public fndToken;

    //repositories
    FundRepository public fundRepository;

    ClaimRepository public claimRepository;

    address public claimSignerAddress;

    Precondition[] preconditions;

    modifier addressNotNull(address target) {
        require(target != address(0));
        _;
    }

    function FundRequestContract(
        address _tokenAddress,
        address _fundRepository,
        address _claimRepository
    ) public {
        setFndToken(_tokenAddress);
        setFundRepository(_fundRepository);
        setClaimRepository(_claimRepository);
    }

    //entrypoints
    function fund(bytes32 _platform, string _platformId, address _token, uint256 _value) public returns (bool success) {
        require(doFunding(_platform, _platformId, _token, _value, msg.sender));
        return true;
    }

    function receiveApproval(address _from, uint _amount, address _token, bytes _data) public {
        var sliced = string(_data).toSlice();
        var platform = sliced.split("|AAC|".toSlice());
        var platformId = sliced.split("|AAC|".toSlice());
        require(doFunding(platform.toBytes32(), platformId.toString(), _token, _amount, _from));
    }

    function doFunding(bytes32 _platform, string _platformId, address _token, uint256 _value, address _funder) internal returns (bool success){
        for (uint idx = 0; idx < preconditions.length; idx++) {
            if (address(preconditions[idx]) != address(0)) {
                require(preconditions[idx].isValid(_platform, _platformId, _token, _value, _funder));
            }
        }
        require(_value > 0);
        require(ERC20(_token).transferFrom(_funder, address(this), _value));
        fundRepository.updateFunders(_funder, _platform, _platformId, _value);
        fundRepository.updateBalances(_funder, _platform, _platformId, _token, _value);
        Funded(_funder, _platform, _platformId, _token, _value);
        return true;
    }

    function claim(bytes32 platform, string platformId, string solver, address solverAddress, bytes32 r, bytes32 s, uint8 v) public returns (bool) {
        require(validClaim(platform, platformId, solver, solverAddress, r, s, v));
        uint256 tokenCount = fundRepository.getFundedTokenCount(platform, platformId);
        for (uint i = 0; i < tokenCount; i++) {
            address token = fundRepository.getFundedTokensByIndex(platform, platformId, i);
            uint256 tokenAmount = fundRepository.claimToken(platform, platformId, token);
            require(ERC20(token).transfer(solverAddress, tokenAmount));
            require(claimRepository.addClaim(solverAddress, platform, platformId, solver, token, tokenAmount));
            Claimed(solverAddress, platform, platformId, solver, token, tokenAmount);
        }
        require(fundRepository.finishResolveFund(platform, platformId));
        return true;
    }

    function validClaim(bytes32 platform, string platformId, string solver, address solverAddress, bytes32 r, bytes32 s, uint8 v) internal view returns (bool) {
        var h = sha3(createClaimMsg(platform, platformId, solver, solverAddress));
        address signerAddress = ecrecover(h, v, r, s);
        return claimSignerAddress == signerAddress;
    }

    function createClaimMsg(bytes32 platform, string platformId, string solver, address solverAddress) internal pure returns (string) {
        return strings.bytes32ToString(platform)
        .strConcat(prependUnderscore(platformId))
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

    function setFndToken(address _tokenAddress) addressNotNull(_tokenAddress) public onlyOwner {
        fndToken = FundRequestToken(_tokenAddress);
        assert(fndToken.isFundRequestToken());
    }

    function setClaimSignerAddress(address _claimSignerAddress) addressNotNull(_claimSignerAddress) public onlyOwner {
        claimSignerAddress = _claimSignerAddress;
    }
}