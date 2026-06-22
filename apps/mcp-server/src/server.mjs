import { createInterface } from "node:readline";

const protocolVersion = "2024-11-05";
const aiWorkerUrl = process.env.AI_WORKER_URL ?? "http://127.0.0.1:8765";

const tools = [
  {
    name: "chat_with_gemma",
    description: "Send a prompt to the configured local Gemma-compatible AI worker.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Prompt to send to the local model backend." },
      },
      required: ["prompt"],
    },
  },
];

function respond(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

function respondError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n");
}

async function chatWithGemma(args) {
  const prompt = String(args.prompt ?? "").trim();
  if (!prompt) throw new Error("prompt is required");

  const response = await fetch(`${aiWorkerUrl}/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`AI worker returned HTTP ${response.status}`);
  }

  const payload = await response.json();
  return payload.text;
}

async function handle(message) {
  if (message.method === "initialize") {
    respond(message.id, {
      protocolVersion,
      capabilities: { tools: {} },
      serverInfo: { name: "gemma-local-mcp", version: "0.1.0" },
    });
    return;
  }

  if (message.method === "tools/list") {
    respond(message.id, { tools });
    return;
  }

  if (message.method === "tools/call") {
    try {
      const name = message.params?.name;
      const args = message.params?.arguments ?? {};
      if (name !== "chat_with_gemma") {
        respondError(message.id, -32602, `Unknown tool: ${name}`);
        return;
      }

      const text = await chatWithGemma(args);
      respond(message.id, { content: [{ type: "text", text }] });
    } catch (error) {
      respondError(message.id, -32000, error.message);
    }
  }
}

const rl = createInterface({ input: process.stdin });
rl.on("line", (line) => {
  if (!line.trim()) return;
  const message = JSON.parse(line);
  if (message.id === undefined) return;
  handle(message);
});
