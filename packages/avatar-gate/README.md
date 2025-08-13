# @ulp/avatar-gate

A minimal bridge from bio-signal telemetry to the Tetrahedron hub.

Features:

- Input: UDP packets (raw bytes or JSON { data: base64, ts })
- Transform: derive a balanced-ternary harmonic signature (3-PSK),
  then preview the joint trits
- Output: WebSocket message into the TETRA hub protocol

Env:

- AVATAR_UDP_PORT (default 53100)
- AVATAR_UDP_ADDR (default 0.0.0.0)
- TETRA_HUB_URL (default ws://localhost:8081)
- AVATAR_NAME (default lynchpin_avatar)
- AVATAR_PLAN (default merkaba125)
- AVATAR_DIM (default 125 for merkaba125, else 49)

Run:

- pnpm -w @ulp/avatar-gate start

Mock a packet:

- echo -n "hello" | socat - UDP-DATAGRAM:127.0.0.1:53100
