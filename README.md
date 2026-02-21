# ForgeGPU 🔥

ForgeGPU is an open-source GPU orchestration layer that lets developers run large language models (LLMs) on demand. 

It automatically provisions GPUs from providers like Vast.ai, RunPod, and Lambda Cloud, exposes a stable OpenAI-compatible API, and shuts down infrastructure when idle.

Build AI apps without paying for always-on GPUs.

## 🧱 Features

- **OpenAI-Compatible**: Drop-in replacement for OpenAI API endpoints.
- **Auto-Provisioning**: Automatically launches GPUs when requests arrive.
- **Smart Routing**: Handles cold starts by queuing or waiting for readiness.
- **Idle Shutdown**: Automatically destroys instances after a configurable timeout to save costs.
- **Vendor Agnostic**: Standardized interface for multiple GPU providers.
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

3. **Run the server**:
   ```bash
   bun run index.ts
   ```

---

## 📖 Usage Guide

### 1. Chat Completions (OpenAI Compatible)
You can use ForgeGPU as a transparent proxy for your LLM. When you send a request, ForgeGPU will check if a GPU is available. If not, it will provision one, wait for it to be healthy, and then forward your request.

**Using curl:**
```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-forge-api-key" \
  -d '{
    "model": "your-model-name",
    "messages": [{"role": "user", "content": "Hello, how are you?"}],
    "stream": true
  }'
```

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

### 2. Admin Monitoring
Monitor the current state of your GPU infrastructure.

**Check Status:**
```bash
curl http://localhost:3000/admin/status \
  -H "Authorization: Bearer your-forge-api-key"
```

**Response Example:**
```json
{
  "state": {
    "id": "vast-instance-x8k2p",
    "provider": "vast",
    "status": "READY",
    "ip": "123.45.67.89",
    "port": 8000
  },
  "lastRequest": "2024-05-20T10:00:00.000Z",
  "config": {
    "vendor": "vast",
    "idleTimeoutMinutes": 15
  }
}
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
- **Router Layer**: Decision engine that manages the lifecycle (Ready -> Start -> Wait).
- **State Manager**: Uses Redis for distributed state and locking to prevent race conditions.
- **Vendor Layer**: Generic interface (`GPUVendor`) to support any cloud provider.
- **Workers**: Background processes that monitor idle time and perform cleanup.

---

## 🛠️ Adding a New Vendor

To add a new GPU provider, implement the `GPUVendor` interface in `src/vendors/` and register it in `src/vendors/factory.ts`.

```typescript
export interface GPUVendor {
  createInstance(config: VendorConfig): Promise<InstanceInfo>;
  destroyInstance(id: string): Promise<void>;
  getInstanceStatus(id: string): Promise<GPUState>;
  getEndpoint(instance: InstanceInfo): Promise<string>;
}
```

---

## ⚖️ License

MIT
