// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Harmonic Axiom Registry
/// @notice Wallet-first provenance for CQE harmonic axioms using EIP-191 personal_sign verification.
/// Identifies axioms by (scheme, keccak256(joint_trits_bytes)). Optionally stores a SHA-256 hex for DHT interop.
contract HarmonicAxiomRegistry {
    struct Axiom {
        address owner;          // recovered signer from EIP-191 personal_sign
        string scheme;          // e.g., "3psk-merkaba125"
        bytes32 jointHash;      // keccak256(joint_trits_bytes)
        string hdPath;          // BIP32-style path derived from harmonic joint
        string sha256hex;       // optional SHA-256 hex (off-chain integrity / DHT)
        uint64 timestamp;       // registration time
    }

    /// @dev id = keccak256(abi.encodePacked(scheme, jointHash))
    mapping(bytes32 => Axiom) public axioms;

    event AxiomRegistered(bytes32 indexed id, address indexed owner, string scheme, bytes32 jointHash, string hdPath, string sha256hex);

    function registerAxiom(
        bytes calldata message,          // raw joint trits bytes (utf-8 of '-', '0', '+')
        bytes calldata signature,        // personal_sign signature over message
        string calldata scheme,
        string calldata hdPath,
        string calldata sha256hex        // optional; pass empty string if unused
    ) external returns (bytes32 id) {
        address signer = recoverPersonalSign(message, signature);
        require(signer != address(0), "invalid signature");
        // Allow either direct signer call or a relayer where signer authorizes msg.sender off-chain
        require(msg.sender == signer, "caller != signer");

        bytes32 jh = keccak256(message);
        id = keccak256(abi.encodePacked(scheme, jh));
        require(axioms[id].owner == address(0), "axiom exists");

        axioms[id] = Axiom({
            owner: signer,
            scheme: scheme,
            jointHash: jh,
            hdPath: hdPath,
            sha256hex: sha256hex,
            timestamp: uint64(block.timestamp)
        });

        emit AxiomRegistered(id, signer, scheme, jh, hdPath, sha256hex);
    }

    function getAxiom(bytes32 id) external view returns (Axiom memory) {
        return axioms[id];
    }

    // --- EIP-191 personal_sign recovery ---
    function recoverPersonalSign(bytes memory message, bytes memory sig) public pure returns (address) {
        require(sig.length == 65, "bad sig len");
        bytes32 r; bytes32 s; uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        if (v < 27) v += 27;
        require(v == 27 || v == 28, "bad v");
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", _uintToDec(message.length), message));
        return ecrecover(ethHash, v, r, s);
    }

    function _uintToDec(uint256 x) internal pure returns (bytes memory) {
        if (x == 0) return "0";
        uint256 len; uint256 y = x;
        while (y != 0) { len++; y /= 10; }
        bytes memory s = new bytes(len);
        while (x != 0) { len -= 1; s[len] = bytes1(uint8(48 + x % 10)); x /= 10; }
        return s;
    }
}
