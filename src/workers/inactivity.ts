
import { stateManager } from "../state/manager";
import { GPUState, type GPUVendor } from "../types";
import { config } from "../config";

export class InactivityWorker {
  private timer: Timer | null = null;

  constructor(private vendor: GPUVendor) {}

  start() {
    console.log(`Starting InactivityWorker (idleTimeout: ${config.idleTimeoutMinutes}m)...`);
    this.timer = setInterval(() => this.check(), 60000); // Check every minute
  }

  async check() {
    try {
      const state = await stateManager.getState();
      if (!state || state.status !== GPUState.READY) return;

      const lastRequest = await stateManager.getLastRequest();
      const idleMs = Date.now() - lastRequest;
      const timeoutMs = config.idleTimeoutMinutes * 60000;

      if (idleMs > timeoutMs) {
        console.log(`GPU has been idle for ${Math.round(idleMs / 1000)}s. Shutting down...`);
        
        await stateManager.updateStatus(GPUState.STOPPING);
        await this.vendor.destroyInstance(state.id);
        await stateManager.updateStatus(GPUState.STOPPED);
        
        console.log("GPU destroyed successfully due to inactivity.");
      }
    } catch (e) {
      console.error("InactivityWorker Error:", e);
    }
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}
