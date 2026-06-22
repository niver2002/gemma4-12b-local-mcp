# Architecture

## Target Flow

```text
IDE MCP Client
  -> TypeScript MCP Gateway
  -> Python AI Worker
  -> Local inference, document parsing, web crawling, and RAG services
```

## Components

### TypeScript MCP Gateway

The gateway will expose MCP tools, resources, and prompts to IDE clients. It will own MCP protocol concerns such as stdio transport, future Streamable HTTP support, tool schemas, progress notifications, and stream-friendly response handling.

### Python AI Worker

The worker will own AI and data processing concerns: local model inference, CUDA detection, document parsing, OCR, web crawling, chunking, embeddings, and vector search. It will be callable by the MCP gateway through a stable local API.

### Local Inference

The first implementation should support vLLM or Transformers for GPU-accelerated Gemma-class inference. llama.cpp or Ollama adapters can be added for GGUF or lower-resource deployment paths.

### Document Ingestion

Docling is the preferred parser for PDF, DOCX, PPTX, XLSX, HTML, images, OCR-heavy documents, layout extraction, tables, and RAG-friendly exports. Additional image/OCR utilities can be added only where Docling coverage is insufficient.

### Web Ingestion

Crawl4AI is the preferred crawler for generating clean Markdown or structured JSON from static and dynamic web pages. Brave Search remains available as a search/discovery tool.

### RAG Storage

LanceDB is the preferred default vector store because it is local, disk-backed, and suitable for larger document collections. ChromaDB can be supported as a lightweight adapter for prototypes.

## Security and Privacy

Local files, model weights, vector indexes, caches, and API keys stay outside git. The default architecture avoids uploading user documents to external services. Brave Search is the only current network integration and requires explicit API key configuration.
