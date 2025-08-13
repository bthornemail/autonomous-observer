Run presence agent on Android (Termux)

## Prereqs

- Termux app installed
- Node.js in Termux: pkg install nodejs

## Steps

1. Clone or sync this repo into Termux storage (or copy just
   mcp-integration/ directory)
1. Install deps:
   - cd mcp-integration && npm ci
1. Create a launch script (see launch-presence.sh) and make it executable
1. Start the agent and keep it alive via Termux:Boot, termux-wake-lock,
   or a simple restarter loop

## Helpful

- Use lower HEARTBEAT_MS on mobile networks, e.g. 15000–30000
- Set COPILOT_ID per device, e.g. phone-alfa, phone-bravo
- If the process exits with code 1/2, your wrapper should restart it after a
  short backoff
