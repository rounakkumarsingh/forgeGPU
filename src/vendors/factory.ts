
import { VastAIProvider } from "./vast";
import { type GPUVendor } from "../types";
import { config } from "../config";

export function getVendor(name: string): GPUVendor {
  switch (name.toLowerCase()) {
    case "vast":
      return new VastAIProvider();
    // Add more vendors here
    default:
      throw new Error(`Unsupported vendor: ${name}`);
  }
}
