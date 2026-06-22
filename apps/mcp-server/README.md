# MCP Server

Future TypeScript MCP gateway.

Responsibilities:

- Expose IDE-facing MCP tools, resources, and prompts.
- Forward inference, document, web, and RAG requests to the Python AI worker.
- Support stdio first and Streamable HTTP later.
- Keep API keys and local file contents out of logs by default.
