pragma solidity 0.4.24;

import "../../ownership/Owned.sol";


contract Precondition is Owned {

    string public name;
    uint public version;
    bool public active = false;

    constructor(string _name, uint _version, bool _active) public {
        name = _name;
        version = _version;
        active = _active;
    }

    function setActive(bool _active) external onlyOwner {
        active = _active;
    }

    function isValid(bytes32 _platform, string _platformId, address _token, uint256 _value, address _funder) external view returns (bool valid);

    function () external {
        // dont receive ether via fallback
    }
}