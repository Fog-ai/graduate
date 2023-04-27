// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <=0.8.18;

contract Test {
    //using StringUtils for string;
    event ReturnValue(bool returnValue);
    string[] public myArray;
    string public delimiter = "|";
    struct Transaction {
        string Txhash;
        string filename;
        string timestamp;
        uint blocknumber;
    }
    uint public transactionCount;
    mapping(uint => Transaction) public transactions;

    function getLength() public view returns (uint) {
        return myArray.length;
    }

    function addTransaction(
        string memory _transactionHash,
        string memory _filename,
        string memory _timestamp,
        uint _blocknumber
    ) public {
        transactions[transactionCount] = Transaction(
            _transactionHash,
            _filename,
            _timestamp,
            _blocknumber
        );
        transactionCount++;
    }

    function printTx(
        uint _index
    ) public view returns (string memory, string memory, string memory, uint) {
        return (
            transactions[_index].Txhash,
            transactions[_index].filename,
            transactions[_index].timestamp,
            transactions[_index].blocknumber
        );
    }

    function equals(
        string memory a,
        string memory b
    ) public pure returns (bool) {
        return (keccak256(bytes(a)) == keccak256(bytes(b)));
    }

    function compare(string memory a) public view returns (bool) {
        uint len = myArray.length;
        for (uint i = 0; i < len; i++) {
            if (equals(a, myArray[i])) {
                return true;
            }
        }
        return false;
    }

    function addString(string memory newString) public returns (bool) {
        if (compare(newString)) {
            emit ReturnValue(false);
            return false;
        } else {
            myArray.push(newString);
            emit ReturnValue(true);
            return true;
        }
    }

    function getAllStrings() public view returns (string memory) {
        uint len = myArray.length;
        string memory result = "";
        for (uint i = 0; i < len; i++) {
            if (i > 0) {
                result = concat(result, delimiter);
            }
            result = concat(result, myArray[i]);
        }
        return result;
    }

    function concat(
        string memory _a,
        string memory _b
    ) internal pure returns (string memory) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        string memory ab = new string(_ba.length + _bb.length);
        bytes memory bab = bytes(ab);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) bab[k++] = _ba[i];
        for (uint j = 0; j < _bb.length; j++) bab[k++] = _bb[j];
        return string(bab);
    }
}
