import { Database } from "bun:sqlite";

export class DB {
  private db: Database;

  constructor() {
    this.db = new Database("forge.sqlite", { create: true });
    this.init();
  }

  private init() {
    this.db.query(`
      CREATE TABLE IF NOT EXISTS request_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        model TEXT,
        tokens INTEGER,
        status INTEGER,
        duration INTEGER
      )
    `).run();
  }

  addLog(entry: { model: string; tokens: number; status: number; duration: number }) {
    this.db.query(`
      INSERT INTO request_logs (timestamp, model, tokens, status, duration)
      VALUES ($timestamp, $model, $tokens, $status, $duration)
    `).run({
      $timestamp: new Date().toISOString(),
      $model: entry.model,
      $tokens: entry.tokens,
      $status: entry.status,
      $duration: entry.duration
    });
  }

  getLogs(limit = 100) {
    return this.db.query(`SELECT * FROM request_logs ORDER BY id DESC LIMIT $limit`).all({ $limit: limit });
  }

  getStats() {
    return this.db.query(`
      SELECT 
        COUNT(*) as total_requests,
        AVG(duration) as avg_latency,
        SUM(tokens) as total_tokens
      FROM request_logs
    `).get() as { total_requests: number; avg_latency: number; total_tokens: number };
  }
}

export const db = new DB();
