# Harmonic Edge Oracle (gate prototype)

A tiny edge utility that turns 6-DoF-like low-voltage signals into harmonic
trits, computes the on-chain registry ID, and can optionally sign the message
(EIP-191) to act as a gate.

Modes:

- sim: generate synthetic motion/EMG-like signals
- stdin: read NDJSON lines: { t, axes: [x,y,z,rx,ry,rz] }

Outputs:

- joint_trits (preview), jointHash, id, optional signature

Example:

```bash
edge-gate --mode sim --dim 125 --scheme 3psk-merkaba125
```
