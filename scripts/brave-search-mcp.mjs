import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const protocolVersion = "2024-11-05";

const tools = [
  {
    name: "brave_web_search",
    description: "Searches the web using Brave Search API.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        count: { type: "number", description: "Number of results, 1-20", default: 5 },
        offset: { type: "number", description: "Pagination offset", default: 0 },
      },
      required: ["query"],
    },
  },
  {
    name: "brave_local_search",
    description: "Searches local businesses and places using Brave Search API.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Local search query" },
        count: { type: "number", description: "Number of results, 1-20", default: 5 },
      },
      required: ["query"],
    },
  },
];

function respond(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

function respondError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n");
}

function runPowerShell(script, input) {
  return new Promise((resolve, reject) => {
    const child = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], {
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => stdout += chunk);
    child.stderr.on("data", (chunk) => stderr += chunk);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `PowerShell exited with code ${code}`));
        return;
      }
      resolve(stdout);
    });
    child.stdin.end(JSON.stringify(input));
  });
}

async function braveSearch(kind, args) {
  const query = String(args.query ?? "").trim();
  if (!query) throw new Error("query is required");

  const count = Math.min(Math.max(Number(args.count ?? 5), 1), 20);
  const offset = Math.min(Math.max(Number(args.offset ?? 0), 0), 9);
  const endpoint = kind === "local" ? "https://api.search.brave.com/res/v1/local/search" : "https://api.search.brave.com/res/v1/web/search";

  const script = `
$ErrorActionPreference = "Stop"
$inputJson = [Console]::In.ReadToEnd()
$request = $inputJson | ConvertFrom-Json
$headers = @{
  "X-Subscription-Token" = $env:BRAVE_API_KEY
  "Accept" = "application/json"
}
$query = [System.Uri]::EscapeDataString($request.query)
$uri = "${endpoint}?q=$query&count=$($request.count)&offset=$($request.offset)"
$response = Invoke-RestMethod -Uri $uri -Headers $headers
$response | ConvertTo-Json -Depth 20
`;

  const raw = await runPowerShell(script, { query, count, offset });
  const data = JSON.parse(raw);
  const results = data.web?.results ?? data.places?.results ?? data.local?.results ?? [];

  if (!results.length) {
    return "No results found.";
  }

  return results.slice(0, count).map((result, index) => {
    const title = result.title ?? result.name ?? "Untitled";
    const url = result.url ?? result.profile?.url ?? "";
    const description = result.description ?? result.address?.displayAddress ?? result.address ?? "";
    return `${index + 1}. ${title}\n${url}\n${description}`.trim();
  }).join("\n\n");
}

async function handle(message) {
  if (message.method === "initialize") {
    respond(message.id, {
      protocolVersion,
      capabilities: { tools: {} },
      serverInfo: { name: "local-brave-search", version: "0.1.0" },
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
      if (name === "brave_web_search") {
        const text = await braveSearch("web", args);
        respond(message.id, { content: [{ type: "text", text }] });
        return;
      }
      if (name === "brave_local_search") {
        const text = await braveSearch("local", args);
        respond(message.id, { content: [{ type: "text", text }] });
        return;
      }
      respondError(message.id, -32602, `Unknown tool: ${name}`);
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
