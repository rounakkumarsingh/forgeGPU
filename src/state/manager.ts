
import Redis from "ioredis";
import { config } from "../config";
import { GPUState } from "../types";
import type { InstanceInfo } from "../types";

export class StateManager {
  private redis: Redis;
  private stateKey = "forge:gpu:state";
  private lockKey = "forge:gpu:lock";

  constructor() {
    this.redis = new Redis(config.redisUrl);
  }

  async getState(): Promise<InstanceInfo | null> {
    const data = await this.redis.get(this.stateKey);
    return data ? JSON.parse(data) : null;
  }

  async setState(state: InstanceInfo): Promise<void> {
    await this.redis.set(this.stateKey, JSON.stringify(state));
  }

  async updateStatus(status: GPUState): Promise<void> {
    const state = await this.getState();
    if (state) {
      state.status = status;
      await this.setState(state);
    }
  }

  async acquireLock(timeoutMs = 30000): Promise<boolean> {
    const result = await this.redis.set(this.lockKey, "locked", "PX", timeoutMs, "NX");
    return result === "OK";
  }

  async releaseLock(): Promise<void> {
    await this.redis.del(this.lockKey);
  }

  async updateLastRequest(): Promise<void> {
    await this.redis.set("forge:gpu:last_request", Date.now().toString());
  }

  async getLastRequest(): Promise<number> {
    const val = await this.redis.get("forge:gpu:last_request");
    return val ? parseInt(val) : 0;
  }
}

export const stateManager = new StateManager();
