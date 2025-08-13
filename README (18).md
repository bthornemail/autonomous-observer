Remote deployment guide for the Agent Hub, UBHP bridge, and Copilot agents.

## Prereqs

- Ubuntu/Debian server with sudo
- Node.js 18+ (or 20+ recommended) and npm installed
- A domain (optional but recommended) pointing to the server

## Layout assumption

- Repo path: /opt/copilot/CoPilot (adjust paths below if different)

## Steps

1. Create deployment directory and copy repo

- Place the repository at /opt/copilot/CoPilot (or symlink to your actual path)

1. Install Node and dependencies

- On the server run from /opt/copilot/CoPilot/mcp-integration:
  - npm ci

1. Systemd services

- Install service units:
  - /etc/systemd/system/agent-hub.service
  - /etc/systemd/system/ubhp-bridge.service
  - /etc/systemd/system/copilot-presence@.service (templated)
  - /etc/systemd/system/copilot-universe.service
- Put the env file at /etc/copilot.env (see copilot.env.example)

1. Start services

- sudo systemctl daemon-reload
- sudo systemctl enable --now agent-hub.service ubhp-bridge.service
- sudo systemctl enable --now copilot-universe.service
- Optionally start multiple presence instances:

```bash
sudo systemctl enable --now copilot-presence@copilot_presence.service
sudo systemctl enable --now copilot-presence@presence2.service
```

1. Reverse proxy (Nginx) + TLS (optional)

- Copy nginx.conf to /etc/nginx/sites-available/copilot.conf
- sudo ln -s /etc/nginx/sites-available/copilot.conf /etc/nginx/sites-enabled/
- sudo nginx -t && sudo systemctl reload nginx
- Use certbot for TLS: sudo certbot --nginx -d your.domain

1. Firewall

- If using Nginx only expose 80/443
- If exposing raw ports, open 8081 (hub) and 4080 (bridge) as needed

## Health checks

- Hub status: <http://YOUR_DOMAIN/status>
- Bridge status (proxied): <http://YOUR_DOMAIN/bridge/status>
- Bridge status (direct): <http://YOUR_SERVER:4080/status>

## Notes

- Adjust paths in unit files if your repo lives elsewhere.
- Scale agents by adding more `copilot-presence@ID.service` instances.
