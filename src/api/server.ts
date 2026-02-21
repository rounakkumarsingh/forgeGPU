import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { GPURouter } from "../router/gpu-router";
import { config } from "../config";
import { stateManager } from "../state/manager";
import { db } from "../db";

export function createApi(gpuRouter: GPURouter) {
  const app = new Hono();

  // OpenAI-compatible endpoint
  app.post("/v1/chat/completions", async (c) => {
    const startTime = Date.now();
    let status = 200;
    let model = "unknown";
    
    try {
      const authHeader = c.req.header("Authorization");
      if (authHeader !== `Bearer ${config.apiKey}`) {
        status = 401;
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      model = body.model || "unknown";
      
      const endpoint = await gpuRouter.getEndpoint();
      
      const response = await fetch(`${endpoint}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      status = response.status;

      const duration = Date.now() - startTime;
      db.addLog({
        model,
        tokens: 0,
        status,
        duration
      });

      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    } catch (e: any) {
      console.error("API Error:", e);
      status = 500;
      const duration = Date.now() - startTime;
      db.addLog({
        model,
        tokens: 0,
        status,
        duration
      });
      return c.json({ error: e.message }, 500);
    }
  });

  // Admin routes (with Auth)
  const admin = new Hono();
  admin.use("*", async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (authHeader !== `Bearer ${config.apiKey}`) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  });

  admin.get("/status", async (c) => {
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

  admin.get("/history", async (c) => {
    const logs = db.getLogs(100);
    return c.json({ logs });
  });

  admin.get("/stats", async (c) => {
    const stats = db.getStats();
    return c.json(stats);
  });

  app.route("/admin", admin);

  // Serve Static Assets & SPA fallback
  app.get("*", serveStatic({ root: "./dist" }));
  app.get("*", serveStatic({ path: "./dist/index.html" }));

  return app;
}
