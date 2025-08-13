// Auto-generated port configuration
package config

services: {
	agent_hub: {
		http: 8081,
		ws: 8081,
		available: true,
		status: "200"
	}
	phai_claude: {
		http: 3004,
		ws: 3004,
		available: false,
		status: "unknown"
	}
	webui: {
		http: 4077,
		ws: 4077,
		available: false,
		status: "unknown"
	}
	mcp_server: { type: "stdio", available: true }
}

discovery: {
	available_ports: [8082, 8083, 3005, 3006, 4078, 4079]
	last_scan: "2025-08-11T16:03:46.619Z"
}
