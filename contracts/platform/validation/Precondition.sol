pragma solidity 0.4.21;

import "../../ownership/Owned.sol";

contract Precondition is Owned {

    string public name;
    uint public version;
    bool public active = false;

    function Precondition(string _name, uint _version, bool _active) {
        active = _active;
        version = _version;
        active = _active;
    }

    function isValid(bytes32 _platform, string _platformId, address _token, uint256 _value, address _funder) public view returns (bool valid);

    function () {
        // dont receive ether via fallback
    }
}