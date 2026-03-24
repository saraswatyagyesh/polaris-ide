# Systems Architecture & Engineering Overview
**Project Polaris** — *A Collaborative Cloud IDE & AI Assistant*

## Executive Summary
Polaris is engineered as a zero-infrastructure, browser-native Integrated Development Environment (IDE) deeply integrated with generative AI. Instead of traditional monolithic web servers, Polaris leverages a heavily decoupled, serverless, and event-driven architecture to deliver millisecond latency for collaborative editing and robust asynchronous handling for long-running AI operations.

## High-Level Component Architecture

### 1. Presentation & Routing Layer (Frontend)
- **Framework:** Next.js 16 (App Router) with React 19.
- **Role:** Handles SSR, static routing, and rendering the highly interactive editor workspace.
- **Key Modules:** 
  - **CodeMirror 6:** The core text editor, highly extensible for ghost text, widgets, and multi-cursor sync.
  - **xterm.js & WebContainers (Planned):** For robust, entirely client-side Node.js execution without server cost overheads.

### 2. Real-Time Data & State Layer (Backend)
- **Framework:** Convex
- **Role:** Acts as both the database and the websocket-based real-time sync engine. 
- **Why Convex?** It replaces the traditional REST/GraphQL + Postgres + Redis pub/sub stack. All document edits, chat messages, and workspace states are synchronized instantly across clients via Convex subscriptions (`useQuery`). 

### 3. Asynchronous Task Engine (Workers)
- **Framework:** Inngest
- **Role:** Orchestrates long-running, fault-tolerant background processes.
- **Why Inngest?** AI generation and heavy tasks (like GitHub scraping via Firecrawl or processing massive AI contexts) often exceed serverless timeout limits (e.g., Vercel's 10s-60s limit). Inngest handles retries, delays, and step-by-step execution orchestrations cleanly natively within the repository structure.

### 4. Authentication & Identity
- **Framework:** Clerk
- **Role:** Manages user sessions, OAuth (GitHub integration), and JWT issuance. It feeds verified identity both to Next.js middleware (for route protection) and to Convex (for row-level data security).

---

## Core Data Flows

### A. Authentication Flow
1. **Client** requests access. Next.js `proxy.ts` middleware verifies the session via Clerk.
2. If authenticated, Clerk issues a JWT containing the user's ID.
3. This JWT is passed transparently to the **Convex React Client**.
4. **Convex Backend** decodes the JWT, verifies the issuer domain, and authorizes the user to read/write their specific `projects` and `conversations`.

### B. Standard Workspace Synchronization (CRUD)
1. User types in the **CodeMirror** editor or creates a file in the Explorer.
2. The UI triggers a **Convex Mutation** (e.g., `updateFileContent()`).
3. Convex processes the mutation optimistically on the client, then persists it to the Convex cloud database.
4. Any other connected clients subscribed to that project's Convex query instantly receive the patched state via Websockets.

### C. AI Generation & Agentic Flow
Given the latency and unreliability of LLM requests, AI operations avoid blocking the main UX thread.
1. **Trigger:** User asks the AI a question or requests a Quick Edit (Cmd+K).
2. **API Route Reception:** Next.js receives the request at `/api/messages` and immediately returns a `202 Accepted`.
3. **Event Dispatch:** The Next.js API route pushes an event payload to **Inngest** (e.g., `conversation.process`).
4. **Agentic Processing:** An Inngest background function spins up. It uses the `@inngest/agent-kit` alongside `@ai-sdk/anthropic` to stream thoughts, execute actions, or scrape documentation via **Firecrawl**.
5. **State Commitment:** Once the LLM yields a chunk or a finalized code snippet, Inngest triggers a Convex internal mutation.
6. **Reactive UI:** Convex receives the updated message/code via Inngest and pushes it to the user's browser via the active WebSocket subscription, completing the loop.

## Scalability & Security Considerations
- **Stateless Edge:** The Next.js frontend is entirely stateless. Sessions are managed by Clerk; data by Convex.
- **Internal Security:** Inngest background jobs communicate with Convex using a highly guarded `POLARIS_CONVEX_INTERNAL_KEY`, bypassing user-auth to inject system-level AI responses directly into user tables securely.
- **Resilience:** Errors bridging from AI SDKs or GitHub APIs are tracked globally by Sentry, while Inngest ensures that if a step fails halfway (e.g., Claude times out), only that specific step is retried without restarting the entire expensive workflow.
