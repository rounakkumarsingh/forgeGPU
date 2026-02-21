
export enum GPUState {
  STOPPED = "STOPPED",
  STARTING = "STARTING",
  READY = "READY",
  STOPPING = "STOPPING",
  ERROR = "ERROR",
}

export interface InstanceInfo {
  id: string;
  provider: string;
  ip?: string;
  port?: number;
  status: GPUState;
  metadata?: Record<string, any>;
}

export interface VendorConfig {
  apiKey: string;
  region?: string;
  image: string;
  gpuType?: string;
  [key: string]: any;
}

export interface GPUVendor {
  createInstance(config: VendorConfig): Promise<InstanceInfo>;
  destroyInstance(id: string): Promise<void>;
  getInstanceStatus(id: string): Promise<GPUState>;
  getEndpoint(instance: InstanceInfo): Promise<string>;
}
