import React from 'react'
import ReactDOM from 'react-dom/client'
import { 
  RouterProvider, 
  createRouter, 
  createRoute, 
  createRootRoute,
  Outlet,
  Link
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from './pages/Dashboard.tsx'
import { History } from './pages/History.tsx'
import { Activity, History as HistoryIcon, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const queryClient = new QueryClient()

const rootRoute = createRootRoute({
  component: () => (
    <div className="flex min-h-screen">
      <nav className="w-64 border-r border-zinc-800 p-6 flex flex-col gap-8 bg-zinc-950">
        <div className="flex items-center gap-2 px-2">
          <Activity className="text-primary w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">ForgeGPU</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <Link 
            to="/" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-zinc-900",
              "[&.active]:bg-zinc-900 [&.active]:text-primary"
            )}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link 
            to="/history" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-zinc-900",
              "[&.active]:bg-zinc-900 [&.active]:text-primary"
            )}
          >
            <HistoryIcon size={20} />
            History
          </Link>
          <Link 
            to="/settings" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-zinc-900",
              "[&.active]:bg-zinc-900 [&.active]:text-primary"
            )}
          >
            <SettingsIcon size={20} />
            Settings
          </Link>
        </div>
      </nav>
      
      <main className="flex-1 p-8 bg-zinc-950 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
})

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: History,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <p className="text-zinc-400">Configuration management coming soon.</p>
    </div>
  ),
})

const routeTree = rootRoute.addChildren([indexRoute, historyRoute, settingsRoute])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  )
}
