# Gemma 4 12B Local MCP

Local-first MCP project for running Gemma-class models with GPU acceleration, document ingestion, web crawling, and IDE-friendly tool calls.

## Current Status

Phase one provides a working Brave Search MCP foundation and repository scaffold. The Brave MCP server is implemented locally because the deprecated official Node package can list tools in this environment but its Node `fetch` calls time out against Brave Search. The local shim keeps MCP stdio compatibility and delegates Brave API requests to PowerShell `Invoke-RestMethod`, which has been verified to work here.

## What This Project Will Provide

- Local Gemma 4 12B deployment with automatic CUDA detection where available.
- MCP tools/resources/prompts for IDE clients.
- File ingestion for PDFs, office documents, images, OCR-heavy scans, diagrams, and PCB-style drawings.
- Web ingestion through intelligent crawling and clean Markdown extraction.
- Local RAG index for private document and web knowledge.
- Stream-friendly responses for IDE MCP workflows.

## Brave Search MCP Setup

1. Copy `.env.example` to `.env`.
2. Set `BRAVE_API_KEY` in `.env`.
3. Add this MCP server config to your IDE/client:

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "powershell.exe",
      "args": [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        "C:/project/Gemma-4-12B/scripts/start-brave-search-mcp.ps1"
      ]
    }
  }
}
```

Available tools:

- `brave_web_search`: general web search.
- `brave_local_search`: local/place search.

## Verification

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:/project/Gemma-4-12B/scripts/verify-brave-search.ps1
```

```bash
node C:/project/Gemma-4-12B/scripts/test-brave-search-mcp.mjs
node C:/project/Gemma-4-12B/scripts/mcp-brave-search.mjs "Model Context Protocol TypeScript SDK"
```

## Repository Layout

```text
apps/
  mcp-server/      Future TypeScript MCP gateway
  ai-worker/       Future Python AI worker
packages/
  shared/          Future shared schemas and contracts
scripts/           Local MCP and verification helpers
docs/              Architecture, research, and implementation plans
```

## Roadmap

1. TypeScript MCP gateway with tools/resources/prompts and streamable responses.
2. Python AI worker with FastAPI, CUDA detection, and pluggable inference backends.
3. Gemma local inference through vLLM/Transformers with llama.cpp or Ollama adapters.
4. Docling-based file ingestion for PDF, office, image, OCR, layout, and table extraction.
5. Crawl4AI-based web crawling and Markdown extraction.
6. LanceDB-backed local RAG index with optional ChromaDB adapter.
