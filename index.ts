
import { serve } from "bun";
import { config } from "./src/config";
import { getVendor } from "./src/vendors/factory";
import { GPURouter } from "./src/router/gpu-router";
import { createApi } from "./src/api/server";
import { InactivityWorker } from "./src/workers/inactivity";

async function main() {
  console.log("🔥 Starting ForgeGPU...");

  const vendor = getVendor(config.vendor);
  const vendorConfig = {
    apiKey: config.vendorApiKey,
    image: "vllm/vllm-openai:latest", // Default image, could be configurable
  };

  const gpuRouter = new GPURouter(vendor, vendorConfig);
  const worker = new InactivityWorker(vendor);
  const api = createApi(gpuRouter);

  // Start background worker
  worker.start();

  // Start API server
  console.log(`🚀 API Server running on port ${config.port}`);
  serve({
    fetch: api.fetch,
    port: config.port,
  });
}

main().catch(console.error);
