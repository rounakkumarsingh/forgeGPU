
export async function waitForHealthy(url: string, timeoutMs: number, intervalMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch (e) {
      // Ignore errors (connection refused, etc.)
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
}
