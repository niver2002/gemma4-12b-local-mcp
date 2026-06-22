import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const child = spawn("powershell.exe", [
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-File",
  "C:/project/Gemma-4-12B/scripts/start-brave-search-mcp.ps1",
], { stdio: ["pipe", "pipe", "pipe"] });

const stdout = createInterface({ input: child.stdout });
const stderr = createInterface({ input: child.stderr });
stderr.on("line", (line) => console.error(line));

stdout.on("line", (line) => {
  if (!line.trim()) return;
  const message = JSON.parse(line);
  if (message.id === 1) {
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }) + "\n");
  }
  if (message.id === 2) {
    console.log(JSON.stringify(message.result.tools, null, 2));
    child.kill();
  }
});

child.stdin.write(JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "tool-schema-inspector", version: "0.1.0" }
  }
}) + "\n");

setTimeout(() => {
  child.kill();
  process.exit(1);
}, 10000);
