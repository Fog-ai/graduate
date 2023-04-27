// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <=0.8.18;

library StringUtils {
    function equals(
        string memory a,
        string memory b
    ) public pure returns (bool) {
        return (keccak256(bytes(a)) == keccak256(bytes(b)));
    }
}
