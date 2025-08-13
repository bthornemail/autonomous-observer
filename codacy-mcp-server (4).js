#!/usr/bin/env node
/**
 * Codacy MCP Server (local, stdio)
 *
 * Minimal bridge to run Codacy Analysis CLI via Docker if available.
 * Requires CODACY_API_TOKEN in the environment.
 *
 * Tools exposed:
 * - health: report token presence and docker availability
 * - analyze: attempt to run Codacy Analysis CLI in Docker against the repo
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile as _execFile } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(_execFile);

async function dockerVersion() {
  try {
    const { stdout } = await execFile("docker", ["--version"]);
    return { available: true, version: stdout.trim() };
  } catch {
    return { available: false };
  }
}

async function runCodacyDocker({ path, tool, additionalArgs }) {
  const token = process.env.CODACY_API_TOKEN;
  if (!token) {
    return {
      ok: false,
      message: "CODACY_API_TOKEN is not set. Export it before running analyze.",
    };
  }
  const docker = await dockerVersion();
  if (!docker.available) {
    return {
      ok: false,
      message: "Docker is not available. Install Docker or run Codacy CLI another way.",
    };
  }

  const cwd = process.cwd();
  const args = [
    "run",
    "--rm",
    "-v",
    `${cwd}:/src`,
    "-e",
    `CODACY_API_TOKEN=${token}`,
    "codacy/codacy-analysis-cli",
  ];

  if (tool) {
    args.push("--tool", tool);
  }
  if (path && path !== ".") {
    args.push("--path", path);
  }
  if (Array.isArray(additionalArgs)) {
    args.push(...additionalArgs);
  }

  try {
    const { stdout, stderr } = await execFile("docker", args, { maxBuffer: 10 * 1024 * 1024 });
    const output = [stdout, stderr].filter(Boolean).join("\n").trim();
    return { ok: true, output };
  } catch (err) {
    const e = err;
    const out = [e.stdout, e.stderr].filter(Boolean).join("\n").trim();
    return { ok: false, message: out || String(e) };
  }
}

const server = new McpServer({ name: "codacy", version: "0.1.0" });

server.registerTool(
  "health",
  {
    title: "Health Check",
    description: "Check CODACY_API_TOKEN presence and Docker availability",
    inputSchema: {},
  },
  async () => {
    const tokenPresent = Boolean(process.env.CODACY_API_TOKEN);
    const docker = await dockerVersion();
    const info = {
      tokenPresent,
      docker,
      workingDir: process.cwd(),
    };
    return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
  }
);

server.registerTool(
  "analyze",
  {
    title: "Run Codacy Analysis",
    description: "Runs Codacy Analysis CLI via Docker in the current repository",
    inputSchema: {
      path: z.string().default("."),
      tool: z
        .enum(["eslint", "pmd", "trivy", "pylint", "dartanalyzer"]) // common tools; adjust as needed
        .optional(),
      additionalArgs: z.array(z.string()).optional(),
    },
  },
  async ({ path, tool, additionalArgs }) => {
    const res = await runCodacyDocker({ path, tool, additionalArgs });
    if (!res.ok) {
      return { content: [{ type: "text", text: `Error: ${res.message}` }], isError: true };
    }
    return { content: [{ type: "text", text: res.output || "Codacy analysis completed." }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Codacy MCP server error:", err);
  process.exit(1);
});
