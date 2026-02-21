# ForgeGPU 🔥

ForgeGPU is an open-source GPU orchestration layer that lets developers run large language models on demand.

It automatically provisions GPUs from providers like Vast.ai, RunPod, and Lambda Cloud, exposes a stable OpenAI-compatible API, and shuts down infrastructure when idle.

Build AI apps without paying for always-on GPUs.

## 🧱 Features

- **OpenAI-Compatible**: Drop-in replacement for OpenAI API endpoints.
- **Auto-Provisioning**: Automatically launches GPUs when requests arrive.
- **Smart Routing**: Handles cold starts by queuing or waiting for readiness.
- **Idle Shutdown**: Automatically destroys instances after a configurable timeout to save costs.
- **Vendor Agnostic**: Standardized interface for multiple GPU providers.
- **Redis-Backed**: Atomic state management and distributed locking.

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Configure environment variables**:
   Create a `.env` file:
   ```ini
   API_KEY=your-forge-api-key
   VENDOR=vast
   VENDOR_API_KEY=your-vast-ai-key
   IDLE_TIMEOUT=15
   REDIS_URL=redis://localhost:6379
   ```

3. **Run the server**:
   ```bash
   bun run index.ts
   ```

## 🧩 Architecture

- **API Layer**: Hono server handling requests and authentication.
- **Router Layer**: Decision engine for lifecycle management.
- **State Manager**: Redis-based synchronization.
- **Vendor Layer**: Abstraction for external providers.
- **Workers**: Background tasks for monitoring and shutdown.

## 🛠️ Tech Stack

- **Runtime**: Bun.js
- **HTTP**: Hono
- **State**: Redis
- **Language**: TypeScript

## ⚖️ License

MIT
