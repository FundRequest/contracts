pragma solidity 0.4.23;

import "../control/Callable.sol";


contract EternalStorage is Callable {

    mapping(bytes32 => uint) uIntStorage;
    mapping(bytes32 => string) stringStorage;
    mapping(bytes32 => address) addressStorage;
    mapping(bytes32 => bytes) bytesStorage;
    mapping(bytes32 => bool) boolStorage;
    mapping(bytes32 => int) intStorage;

    // *** Getter Methods ***
    function getUint(bytes32 _key) external view returns (uint) {
        return uIntStorage[_key];
    }

    function getString(bytes32 _key) external view returns (string) {
        return stringStorage[_key];
    }

    function getAddress(bytes32 _key) external view returns (address) {
        return addressStorage[_key];
    }

    function getBytes(bytes32 _key) external view returns (bytes) {
        return bytesStorage[_key];
    }

    function getBool(bytes32 _key) external view returns (bool) {
        return boolStorage[_key];
    }

    function getInt(bytes32 _key) external view returns (int) {
        return intStorage[_key];
    }

    // *** Setter Methods ***
    function setUint(bytes32 _key, uint _value) onlyCaller external {
        uIntStorage[_key] = _value;
    }

    function setString(bytes32 _key, string _value) onlyCaller external {
        stringStorage[_key] = _value;
    }

    function setAddress(bytes32 _key, address _value) onlyCaller external {
        addressStorage[_key] = _value;
    }

    function setBytes(bytes32 _key, bytes _value) onlyCaller external {
        bytesStorage[_key] = _value;
    }

    function setBool(bytes32 _key, bool _value) onlyCaller external {
        boolStorage[_key] = _value;
    }

    function setInt(bytes32 _key, int _value) onlyCaller external {
        intStorage[_key] = _value;
    }

    // *** Delete Methods ***
    function deleteUint(bytes32 _key) onlyCaller external {
        delete uIntStorage[_key];
    }

    function deleteString(bytes32 _key) onlyCaller external {
        delete stringStorage[_key];
    }

    function deleteAddress(bytes32 _key) onlyCaller external {
        delete addressStorage[_key];
    }

    function deleteBytes(bytes32 _key) onlyCaller external {
        delete bytesStorage[_key];
    }

    function deleteBool(bytes32 _key) onlyCaller external {
        delete boolStorage[_key];
    }

    function deleteInt(bytes32 _key) onlyCaller external {
        delete intStorage[_key];
    }
}