# Phase One Repository Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a public GitHub repository scaffold for a local Gemma 4 12B MCP project with a working Brave Search MCP foundation.

**Architecture:** Phase one establishes a monorepo shell and verified MCP search utility before adding model inference and document pipelines. The root keeps user-facing setup files, `scripts/` contains local MCP/verification helpers, and future `apps/` packages will hold the TypeScript MCP gateway and Python AI worker.

**Tech Stack:** GitHub CLI, Git, Node.js ESM scripts, PowerShell, Brave Search API, MCP JSON-RPC over stdio.

---

## File Structure

- `README.md`: project overview, architecture summary, setup instructions, current Brave MCP status, future roadmap.
- `.gitignore`: ignores secrets, caches, Node/Python build outputs, local storage, model files.
- `.env.example`: documents required local environment variables without secrets.
- `mcp.json`: MCP client configuration pointing at the local Brave Search MCP script.
- `scripts/start-brave-search-mcp.ps1`: loads `.env` and starts local MCP server.
- `scripts/brave-search-mcp.mjs`: local MCP server shim exposing `brave_web_search` and `brave_local_search`.
- `scripts/mcp-brave-search.mjs`: CLI helper to invoke the local Brave MCP tool for research.
- `scripts/test-brave-search-mcp.mjs`: lightweight MCP protocol test for initialization and tool listing.
- `scripts/verify-brave-search.ps1`: direct Brave API verification through PowerShell.
- `docs/architecture.md`: phased target architecture for MCP gateway, Python AI worker, document parsing, crawling, RAG, and local inference.
- `docs/research.md`: notes from Brave MCP searches that justify selected technologies.
- `apps/mcp-server/README.md`: placeholder README describing the future TypeScript MCP gateway boundary.
- `apps/ai-worker/README.md`: placeholder README describing the future Python AI worker boundary.
- `packages/shared/README.md`: placeholder README for shared schemas and protocol contracts.

---

### Task 1: Repository Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/architecture.md`
- Create: `docs/research.md`
- Create: `apps/mcp-server/README.md`
- Create: `apps/ai-worker/README.md`
- Create: `packages/shared/README.md`

- [ ] **Step 1: Write README content**

Replace `README.md` with a concise project overview that names the project, explains the current Brave MCP foundation, gives setup steps, and lists the roadmap.

- [ ] **Step 2: Write architecture notes**

Create `docs/architecture.md` describing the target flow: IDE MCP client → TypeScript MCP gateway → Python AI worker → local Gemma/CUDA + document/web/RAG services.

- [ ] **Step 3: Write research notes**

Create `docs/research.md` with the MCP search findings: TypeScript SDK for MCP, vLLM/Transformers/llama.cpp options, Docling for documents, Crawl4AI for crawling, LanceDB/ChromaDB for local vectors.

- [ ] **Step 4: Create app/package boundary READMEs**

Create placeholder READMEs in `apps/mcp-server`, `apps/ai-worker`, and `packages/shared` so the monorepo structure exists without premature implementation.

- [ ] **Step 5: Verify files exist**

Run: `powershell.exe -NoProfile -Command "Test-Path C:/project/Gemma-4-12B/docs/architecture.md; Test-Path C:/project/Gemma-4-12B/apps/mcp-server/README.md"`
Expected: two `True` lines.

---

### Task 2: Safe Local Configuration

**Files:**
- Modify: `.gitignore`
- Modify: `.env.example`
- Modify: `mcp.json`

- [ ] **Step 1: Expand `.gitignore`**

Ensure `.gitignore` ignores `.env`, `.env.*`, local model directories, vector storage, Python caches, Node modules, build outputs, and keeps `.env.example` trackable.

- [ ] **Step 2: Expand `.env.example`**

Document `BRAVE_API_KEY`, future model settings, storage paths, and optional inference backend settings without real secrets.

- [ ] **Step 3: Keep `mcp.json` secret-free**

Ensure `mcp.json` starts `powershell.exe` with `scripts/start-brave-search-mcp.ps1` and does not contain API keys.

- [ ] **Step 4: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('C:/project/Gemma-4-12B/mcp.json','utf8')); console.log('mcp.json valid')"`
Expected: `mcp.json valid`.

---

### Task 3: Brave MCP Foundation Verification

**Files:**
- Modify: `scripts/brave-search-mcp.mjs`
- Modify: `scripts/start-brave-search-mcp.ps1`
- Modify: `scripts/mcp-brave-search.mjs`
- Modify: `scripts/test-brave-search-mcp.mjs`
- Modify: `scripts/verify-brave-search.ps1`

- [ ] **Step 1: Run MCP protocol test**

Run: `node C:/project/Gemma-4-12B/scripts/test-brave-search-mcp.mjs`
Expected: exit code `0`.

- [ ] **Step 2: Run direct Brave API verification**

Run: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:/project/Gemma-4-12B/scripts/verify-brave-search.ps1`
Expected: output includes `web_results=` with a number greater than zero.

- [ ] **Step 3: Run MCP search verification**

Run: `node C:/project/Gemma-4-12B/scripts/mcp-brave-search.mjs "Model Context Protocol TypeScript SDK"`
Expected: output contains at least one numbered search result.

---

### Task 4: Local Git Repository

**Files:**
- Create: `.git/` via `git init`

- [ ] **Step 1: Initialize git repository**

Run: `git init` from `C:/project/Gemma-4-12B`.
Expected: repository initialized.

- [ ] **Step 2: Check ignored secrets**

Run: `git status --short --ignored`
Expected: `.env` appears ignored and not staged.

- [ ] **Step 3: Add safe files**

Run: `git add .`
Expected: safe files staged; `.env` remains untracked/ignored.

- [ ] **Step 4: Commit scaffold**

Run: `git commit -m "chore: scaffold local Gemma MCP project"`
Expected: commit succeeds.

---

### Task 5: Public GitHub Repository

**Files:**
- Modify: Git remote configuration

- [ ] **Step 1: Create GitHub repository**

Run: `gh repo create gemma4-12b-local-mcp --public --source C:/project/Gemma-4-12B --remote origin --push`.
Expected: GitHub repository is created under the authenticated account and local branch is pushed.

- [ ] **Step 2: Verify remote access**

Run: `gh repo view niver2002/gemma4-12b-local-mcp --json name,visibility,url`
Expected: JSON includes `"visibility":"PUBLIC"` and the repository URL.

- [ ] **Step 3: Verify working tree**

Run: `git status --short`
Expected: no tracked changes.

---

## Self-Review

- Spec coverage: Phase one covers public repository creation, safe MCP configuration, working Brave Search MCP, and project documentation. Local Gemma inference, document parsing, crawling, and RAG are documented as future phases rather than implemented in this first scaffold.
- Placeholder scan: Placeholder READMEs are intentional boundary markers and contain concrete responsibilities, not implementation gaps.
- Type consistency: MCP tool names remain `brave_web_search` and `brave_local_search` across scripts, docs, and tests.
