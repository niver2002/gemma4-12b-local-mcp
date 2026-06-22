import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import assert from "node:assert/strict";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestJson(url, body) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (response) => {
    assert.equal(response.status, 200);
    return response.json();
  });
}

async function waitForWorker() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:8765/health");
      if (response.ok) return;
    } catch {
      await wait(250);
    }
  }
  throw new Error("AI worker did not become healthy");
}

const worker = spawn("python", ["-m", "apps.ai_worker.server"], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, AI_WORKER_BACKEND: "stub", AI_WORKER_PORT: "8765" },
});

try {
  await waitForWorker();
  const direct = await requestJson("http://127.0.0.1:8765/v1/chat", { prompt: "ping" });
  assert.equal(direct.backend, "stub");
  assert.match(direct.text, /ping/);

  const mcp = spawn("node", ["apps/mcp-server/src/server.mjs"], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, AI_WORKER_URL: "http://127.0.0.1:8765" },
  });

  const stdout = createInterface({ input: mcp.stdout });
  const messages = [];
  stdout.on("line", (line) => {
    if (line.trim()) messages.push(JSON.parse(line));
  });

  mcp.stdin.write(JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "e2e-test", version: "0.1.0" },
    },
  }) + "\n");
  mcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  mcp.stdin.write(JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "chat_with_gemma",
      arguments: { prompt: "hello from mcp" },
    },
  }) + "\n");

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const message = messages.find((item) => item.id === 2);
    if (message) {
      assert.equal(message.result.content[0].type, "text");
      assert.match(message.result.content[0].text, /hello from mcp/);
      mcp.kill();
      process.exit(0);
    }
    await wait(250);
  }

  mcp.kill();
  throw new Error("MCP chat response timed out");
} finally {
  worker.kill();
}
