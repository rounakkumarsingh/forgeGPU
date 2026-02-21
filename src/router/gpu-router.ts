
import { stateManager } from "../state/manager";
import { GPUState, type GPUVendor, type VendorConfig } from "../types";
import { waitForHealthy } from "../utils/health";
import { config as appConfig } from "../config";

export class GPURouter {
  constructor(private vendor: GPUVendor, private vendorConfig: VendorConfig) {}

  async getEndpoint(): Promise<string> {
    const state = await stateManager.getState();

    if (state?.status === GPUState.READY) {
      await stateManager.updateLastRequest();
      return this.vendor.getEndpoint(state);
    }

    if (state?.status === GPUState.STARTING) {
      // Wait for it to become ready
      const ready = await this.waitForReady(state.id);
      if (ready) {
        const updatedState = await stateManager.getState();
        return this.vendor.getEndpoint(updatedState!);
      }
      throw new Error("GPU failed to start in time");
    }

    // No GPU running, need to provision
    return this.provision();
  }

  private async provision(): Promise<string> {
    const locked = await stateManager.acquireLock();
    if (!locked) {
      // Someone else is provisioning, wait a bit and retry getting endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      return this.getEndpoint();
    }

    try {
      // Double check state after acquiring lock
      const state = await stateManager.getState();
      if (state && state.status !== GPUState.STOPPED) {
          return this.getEndpoint();
      }

      await stateManager.updateStatus(GPUState.STARTING);
      const instance = await this.vendor.createInstance(this.vendorConfig);
      await stateManager.setState(instance);

      const ready = await this.waitForReady(instance.id);
      if (ready) {
        await stateManager.updateLastRequest();
        return this.vendor.getEndpoint(instance);
      }
      throw new Error("GPU failed to start after provisioning");
    } finally {
      await stateManager.releaseLock();
    }
  }

  private async waitForReady(instanceId: string): Promise<boolean> {
    const endpoint = await this.vendor.getEndpoint({ id: instanceId } as any);
    const healthUrl = `${endpoint}${appConfig.modelHealthUrl}`;
    
    const isHealthy = await waitForHealthy(
      healthUrl, 
      appConfig.startupTimeoutSeconds * 1000, 
      appConfig.healthCheckIntervalMs
    );

    if (isHealthy) {
      await stateManager.updateStatus(GPUState.READY);
      return true;
    }

    await stateManager.updateStatus(GPUState.ERROR);
    return false;
  }
}
