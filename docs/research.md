# Research Notes

These notes summarize findings gathered through the local Brave Search MCP setup.

## MCP

Search results for MCP TypeScript SDK show that MCP servers expose tools, resources, and prompts over JSON-RPC. Tools are for executable actions, resources expose read-only data, and prompts provide reusable interaction templates. stdio is the right first transport for IDE integration, while Streamable HTTP can be added later for long-running services.

## Local Gemma Inference

Search results for Gemma local deployment consistently mention vLLM, Transformers, llama.cpp, Ollama, GGUF, and OpenAI-compatible local servers. The recommended project path is to keep inference pluggable: vLLM or Transformers for GPU-first deployment, llama.cpp/Ollama for GGUF and lower-resource paths.

## Document Parsing

Docling search results highlight broad document support including PDF, DOCX, PPTX, XLSX, HTML, EPUB, images, audio transcripts, OCR, layout understanding, reading order, table structure, and RAG-friendly exports. This makes Docling the best default ingestion layer.

## Web Crawling

Crawl4AI search results describe an async Python crawler that converts web pages into clean LLM-ready Markdown or JSON. It is suitable for RAG pipelines and agent workflows, including dynamic or structured extraction cases.

## Vector Storage

LanceDB and ChromaDB are both common local vector database options. LanceDB is better aligned with disk-backed, larger local collections; ChromaDB remains useful for lightweight prototypes.

## Brave Search MCP

The deprecated official Brave MCP package listed tools successfully in this environment, but Node `fetch` timed out when calling Brave Search. PowerShell `Invoke-RestMethod` succeeded against the same API, so this repository includes a local MCP-compatible shim that preserves the same tool names while using PowerShell for network requests.
