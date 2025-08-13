# Harmonic Axiom Registry

Wallet-first provenance for CQE harmonic axioms using EIP-191 personal_sign.

## What it does

- Verifies EIP-191 signatures over the harmonic joint trits (primary identity)
- Registers an axiom keyed by (scheme, keccak256(joint_trits_bytes))
- Stores: owner (signer), scheme, jointHash, hdPath, optional sha256 hex

## Deploy (Foundry or Hardhat)

Foundry:

```bash
forge create --rpc-url $RPC_URL --private-key $PRIV_KEY contracts/HarmonicAxiomRegistry.sol:HarmonicAxiomRegistry
```

Hardhat:

```bash
# add to your hardhat.config and deploy via a simple script
```

## Register an axiom

Use the sign request emitted by scripts/validate-cqe-and-sign.js (message =
joint trits string):

1) Sign in your wallet (EIP-191 personal_sign) the exact joint trits string.
2) Call registerAxiom:
   - message: bytes of the trits string (UTF-8)
   - signature: 65-byte personal_sign signature
   - scheme: e.g. "3psk-merkaba125"
   - hdPath: the BIP32-style path from the axiom JSON
   - sha256hex: optional (if CXE_INCLUDE_SHA=1 was used)

The contract requires msg.sender to be the recovered signer (simple
provenance). A relayer flow can be added later if needed.
