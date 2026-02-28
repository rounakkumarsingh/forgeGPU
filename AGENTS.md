# ForgeGPU Developer & Agent Guide

This document provides essential information for developers and AI agents working on the ForgeGPU codebase. Adhere to these guidelines to maintain consistency and quality across the project.

## 🛠 Project Infrastructure

### Environment & Runtime
- **Primary Runtime:** [Bun](https://bun.sh/) (latest version).
- **Package Manager:** Bun (`bun install`, `bun add`, `bun remove`).
- **Language:** TypeScript (Strict mode enabled in `tsconfig.json`).

### Key Commands
- **Development:** `bun run dev`
  - Starts the backend using `index.ts` with `--hot` reloading.
- **Build UI:** `bun run build:ui`
  - Bundles the React frontend using `scripts/build-ui.ts`. This must be run before `bun run start` if changes are made to the UI.
- **Start Production:** `bun run start`
  - Runs the production server (ensure UI is built).
- **Test All:** `bun test`
  - Runs all files matching `*.test.ts` or `*.spec.ts`.
- **Test Single File:** `bun test path/to/file.test.ts`
- **Linting:** No dedicated script; adhere to existing patterns. Bun's native transpiler handles most type-related errors during development.

---

## 🎨 Coding Standards & Conventions

### Style & Formatting
- **Indentation:** 2 spaces.
- **Semicolons:** Always required.
- **Quotes:** 
  - Use **double quotes (`"`)** for most strings, especially in backend code, Hono routes, and SQL queries.
  - Single quotes (`'`) are acceptable in React components, imports, and JSX props if consistent with the file's existing style.
- **Line Length:** Aim for readability; no strict limit but avoid excessively long lines (80-100 characters is a good target).

### Naming Conventions
- **Files/Directories:** 
  - Use **kebab-case** for most files (`gpu-router.ts`, `state-manager.ts`).
  - Use **PascalCase** for React components and pages (`Dashboard.tsx`, `History.tsx`).
- **Functions & Variables:** Use **camelCase** (`createApi`, `lastRequest`, `gpuState`).
- **Classes:** Use **PascalCase** (`GPURouter`, `StateManager`, `DB`).
- **Interfaces, Types, & Enums:** Use **PascalCase** (`GPUState`, `InstanceInfo`, `VendorConfig`).
- **Constants:** Use **UPPER_SNAKE_CASE** for global constants or enum members (`STOPPED`, `READY`).

### Imports
- Use **relative paths** (`../utils/health`). Path aliases (like `@/`) are NOT configured.
- Group imports logically:
  1. Built-in modules (`bun:sqlite`, `bun:test`).
  2. External libraries (`hono`, `react`, `ioredis`).
  3. Internal modules (`../config`, `../types`, `../state`).

---

## 🏗 Architectural Patterns

### Backend (Hono + Bun)
- **API Definition:** Located in `src/api/server.ts`. Use Hono's `app.post`, `app.get`, and sub-routers via `app.route`.
- **Async Logic:** Prefer `async/await` over Promise chaining.
- **Error Handling:** Use `try...catch` blocks. Return structured JSON errors with appropriate HTTP status codes:
  ```typescript
  return c.json({ error: e.message }, 500);
  ```
- **State Management:** Managed via Redis in `src/state/manager.ts`. Always use the `stateManager` singleton for orchestration to ensure atomic state updates.
- **Database:** SQLite (via `bun:sqlite`) is used for persistent logging and analytics. Defined in `src/db/index.ts`. Use `$parameter` syntax for queries to prevent injection.

### Frontend (React + TanStack)
- **Components:** Functional components using arrow functions or `function` declarations.
- **Routing:** Handled by [TanStack Router](https://tanstack.com/router). Define routes in `src/ui/main.tsx` and place page components in `src/ui/pages/`.
- **State & Data Fetching:** Use [TanStack Query](https://tanstack.com/query) for all server-side data fetching and mutations.
- **Styling:** Tailwind CSS. Use the `cn` utility (defined in `src/ui/main.tsx`) for combining classes:
  ```tsx
  <div className={cn("base-class", isActive && "active-style")}>...</div>
  ```
- **Icons:** Use `lucide-react`.

### Vendor Integration
- New GPU providers (e.g., RunPod, Lambda) must implement the `GPUVendor` interface defined in `src/types/index.ts`.
- The interface requires:
  - `createInstance(config: VendorConfig): Promise<InstanceInfo>`
  - `destroyInstance(id: string): Promise<void>`
  - `getInstanceStatus(id: string): Promise<GPUState>`
  - `getEndpoint(instance: InstanceInfo): Promise<string>`
- Implementation files reside in `src/vendors/`.
- Register new vendors in the `VendorFactory` within `src/vendors/factory.ts`.

---

## ⚙️ Configuration & Environment
- **Location:** Managed in `src/config/index.ts`.
- **Key Variables:**
  - `PORT`: Server port (default: 3000).
  - `API_KEY`: Auth key for ForgeGPU and Admin API.
  - `REDIS_URL`: Connection string for Redis.
  - `VENDOR`: Active GPU provider (`vast`, `runpod`, etc.).
  - `IDLE_TIMEOUT`: Minutes before automatic shutdown.
  - `STARTUP_TIMEOUT`: Max seconds to wait for GPU readiness.
  - `MODEL_HEALTH_URL`: Endpoint to poll for model readiness (e.g., `/health`).

---

## 🧪 Testing Guidelines
- **Location:** Place test files in the same directory as the source file being tested.
- **Naming:** Use the `.test.ts` or `.test.tsx` suffix.
- **Framework:** Use `bun:test` for expectations, mocks, and snapshots.
- **Mocks:** Ensure vendor API integrations are well-mocked using `mock` from `bun:test`.

---

## 🔒 Security & Safety
- **Secrets:** NEVER hardcode API keys or sensitive strings. Always use `src/config/index.ts`, which reads from environment variables (`process.env`).
- **Concurrency:** Use Redis locks (`stateManager.acquireLock()`) when performing destructive infrastructure operations like provisioning or destroying instances to prevent race conditions.
- **Auth:** All `/admin/*` routes must be protected by the `API_KEY` middleware.

---

## 📂 Directory Structure
- `src/api/`: Hono server and route definitions.
- `src/router/`: Core logic for GPU lifecycle management (`GPURouter`).
- `src/state/`: Redis-backed state management.
- `src/vendors/`: Implementations for different GPU providers.
- `src/workers/`: Background processes (e.g., inactivity monitor).
- `src/ui/`: React frontend source code.
- `scripts/`: Build and maintenance scripts.
