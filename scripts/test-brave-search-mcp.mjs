import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import assert from "node:assert/strict";

const child = spawn("node", ["C:/project/Gemma-4-12B/scripts/brave-search-mcp.mjs"], {
  stdio: ["pipe", "pipe", "pipe"],
  env: { ...process.env, BRAVE_API_KEY: "test-key" },
});

const stdout = createInterface({ input: child.stdout });
const messages = [];

stdout.on("line", (line) => {
  if (!line.trim()) return;
  messages.push(JSON.parse(line));
});

child.stdin.write(JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test", version: "0.1.0" },
  },
}) + "\n");
child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }) + "\n");

setTimeout(() => {
  try {
    const init = messages.find((message) => message.id === 1);
    const tools = messages.find((message) => message.id === 2);
    assert.equal(init.result.serverInfo.name, "local-brave-search");
    assert.deepEqual(tools.result.tools.map((tool) => tool.name), ["brave_web_search", "brave_local_search"]);
    child.kill();
  } catch (error) {
    child.kill();
    throw error;
  }
}, 1000);
