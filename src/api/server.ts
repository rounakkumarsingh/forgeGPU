
import { Hono } from "hono";
import { GPURouter } from "../router/gpu-router";
import { config } from "../config";
import { stateManager } from "../state/manager";

export function createApi(gpuRouter: GPURouter) {
  const app = new Hono();

  // Auth Middleware
  app.use("*", async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (authHeader !== `Bearer ${config.apiKey}`) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  });

  // OpenAI-compatible endpoint
  app.post("/v1/chat/completions", async (c) => {
    try {
      const endpoint = await gpuRouter.getEndpoint();
      const body = await c.req.json();
      
      const response = await fetch(`${endpoint}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      // Forward headers and stream response
      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    } catch (e: any) {
      console.error("API Error:", e);
      return c.json({ error: e.message }, 500);
    }
  });

  // Admin status
  app.get("/admin/status", async (c) => {
    const state = await stateManager.getState();
    const lastRequest = await stateManager.getLastRequest();
    return c.json({
      state,
      lastRequest: new Date(lastRequest).toISOString(),
      config: {
        vendor: config.vendor,
        idleTimeoutMinutes: config.idleTimeoutMinutes,
      }
    });
  });

  // Health
  app.get("/health", (c) => c.json({ status: "ok" }));

  return app;
}
