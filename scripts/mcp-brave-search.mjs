import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error("Usage: node scripts/mcp-brave-search.mjs <query>");
  process.exit(1);
}

const child = spawn("powershell.exe", [
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-File",
  "C:/project/Gemma-4-12B/scripts/start-brave-search-mcp.ps1",
], {
  stdio: ["pipe", "pipe", "pipe"],
});

const stdout = createInterface({ input: child.stdout });
const stderr = createInterface({ input: child.stderr });
const errors = [];

const timeout = setTimeout(() => {
  console.error("MCP search timed out.");
  for (const error of errors) console.error(error);
  child.kill();
  process.exit(1);
}, 20000);

stderr.on("line", (line) => errors.push(line));

stdout.on("line", (line) => {
  if (!line.trim()) return;

  const message = JSON.parse(line);
  if (message.id === 1) {
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
    child.stdin.write(JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "brave_web_search",
        arguments: {
          query,
          count: 5,
        },
      },
    }) + "\n");
  }

  if (message.id === 2) {
    const content = message.result?.content ?? [];
    for (const item of content) {
      if (item.type === "text") console.log(item.text);
    }
    clearTimeout(timeout);
    child.kill();
    process.exit(0);
  }
});

child.stdin.write(JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "local-mcp-search",
      version: "0.1.0",
    },
  },
}) + "\n");
