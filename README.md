# ForgeGPU 🔥

ForgeGPU is an open-source GPU orchestration layer that lets developers run large language models (LLMs) on demand. 

It automatically provisions GPUs from providers like Vast.ai, RunPod, and Lambda Cloud, exposes a stable OpenAI-compatible API, and shuts down infrastructure when idle.

Build AI apps without paying for always-on GPUs.

## 🧱 Features

- **OpenAI-Compatible**: Drop-in replacement for OpenAI API endpoints.
- **Auto-Provisioning**: Automatically launches GPUs when requests arrive.
- **Smart Routing**: Handles cold starts by queuing or waiting for readiness.
- **Idle Shutdown**: Automatically destroys instances after a configurable timeout to save costs.
- **Built-in Dashboard**: Modern React UI to monitor status, history, and stats.
- **SQLite Logging**: Persistent request history and usage analytics.
- **Redis-Backed**: Atomic state management and distributed locking.

---

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Configure environment variables**:
   Create a `.env` file:
   ```ini
   PORT=3000
   API_KEY=your-forge-api-key
   VENDOR=vast
   VENDOR_API_KEY=your-vast-ai-key
   IDLE_TIMEOUT=15
   REDIS_URL=redis://localhost:6379
   MODEL_HEALTH_URL=/health
   ```

3. **Build the UI**:
   ```bash
   bun run build:ui
   ```

4. **Run the server**:
   ```bash
   bun run index.ts
   ```

---

## 🖥️ Web Dashboard

ForgeGPU comes with a built-in management dashboard. After starting the server, access it at:
`http://localhost:3000`

**Features:**
- **Live Status**: Real-time monitoring of your GPU instance.
- **Usage Stats**: View total requests and average latency.
- **History**: Full audit log of all proxied requests.
- **Dark Mode**: Modern, developer-focused interface.

---

## 📖 Usage Guide

### 1. Chat Completions (OpenAI Compatible)
ForgeGPU acts as a transparent proxy. If the GPU is off, it will provision one automatically before forwarding your request.

**Using OpenAI SDK (Python):**
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="your-forge-api-key"
)

response = client.chat.completions.create(
    model="your-model-name",
    messages=[{"role": "user", "content": "Tell me a joke"}]
)
print(response.choices[0].message.content)
```

### 2. Admin API
Programmatic access to the ForgeGPU state.

**Check Status:**
```bash
curl http://localhost:3000/admin/status \
  -H "Authorization: Bearer your-forge-api-key"
```

---

## ⚙️ Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port for the ForgeGPU server | `3000` |
| `API_KEY` | Authentication key for ForgeGPU | `forge-default-key` |
| `REDIS_URL` | URL for the Redis instance | `redis://localhost:6379` |
| `VENDOR` | GPU provider name (`vast`, `runpod`, `lambda`) | `vast` |
| `VENDOR_API_KEY` | API key for the chosen vendor | `""` |
| `IDLE_TIMEOUT` | Minutes of inactivity before shutdown | `15` |
| `STARTUP_TIMEOUT` | Max seconds to wait for GPU startup | `600` |
| `MODEL_HEALTH_URL` | Endpoint to poll for model readiness | `/health` |

---

## 🧩 Architecture

ForgeGPU is built with a decoupled architecture:
- **API Layer**: Hono server handling requests, auth, and proxying.
- **Router Layer**: Decision engine that manages the lifecycle.
- **State Manager**: Redis-based synchronization.
- **Persistence**: SQLite database for logging and analytics.
- **Frontend**: React SPA built with TanStack Router/Query.
- **Workers**: Background processes for monitoring and cleanup.

---

## 🛠️ Adding a New Vendor

Implement the `GPUVendor` interface in `src/vendors/` and register it in `src/vendors/factory.ts`.

---

## ⚖️ License

MIT
