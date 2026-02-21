import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Cpu, Zap, Timer, BarChart3, AlertCircle } from 'lucide-react'

interface GPUStatus {
  state?: {
    id: string;
    provider: string;
    status: string;
    ip?: string;
    port?: number;
  };
  lastRequest?: string;
  config?: {
    vendor: string;
    idleTimeoutMinutes: number;
  };
}

interface GPUStats {
  total_requests: number;
  avg_latency: number;
  total_tokens: number;
}

export function Dashboard() {
  const { data: status } = useQuery<GPUStatus>({
    queryKey: ['status'],
    queryFn: async () => {
      const res = await fetch('/admin/status', {
        headers: { 'Authorization': `Bearer forge-default-key` }
      })
      return res.json()
    },
    refetchInterval: 5000,
  })

  const { data: stats } = useQuery<GPUStats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/admin/stats', {
        headers: { 'Authorization': `Bearer forge-default-key` }
      })
      return res.json()
    },
    refetchInterval: 10000,
  })

  const gpuStatus = status?.state?.status || 'STOPPED'

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
           <span className={`w-3 h-3 rounded-full ${
             gpuStatus === 'READY' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 
             gpuStatus === 'STARTING' ? 'bg-yellow-500 animate-pulse' : 
             'bg-zinc-600'
           }`} />
           <span className="text-sm font-medium uppercase tracking-wider">{gpuStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Cpu className="text-blue-400" />} 
          label="Instance ID" 
          value={status?.state?.id || 'None'} 
          subValue={status?.state?.provider || 'Disconnected'}
        />
        <StatCard 
          icon={<Zap className="text-yellow-400" />} 
          label="Total Requests" 
          value={stats?.total_requests || 0} 
        />
        <StatCard 
          icon={<Timer className="text-purple-400" />} 
          label="Avg Latency" 
          value={stats?.avg_latency ? `${Math.round(stats.avg_latency)}ms` : '0ms'} 
        />
        <StatCard 
          icon={<BarChart3 className="text-green-400" />} 
          label="Last Request" 
          value={status?.lastRequest ? new Date(status.lastRequest).toLocaleTimeString() : 'N/A'} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 space-y-4">
          <h2 className="text-xl font-semibold">GPU Instance Details</h2>
          {status?.state ? (
            <div className="space-y-3">
              <DetailRow label="Provider" value={status.state.provider} />
              <DetailRow label="IP Address" value={status.state.ip || 'Pending'} />
              <DetailRow label="Port" value={status.state.port?.toString() || 'Pending'} />
              <DetailRow label="Status" value={status.state.status} />
            </div>
          ) : (
             <div className="flex items-center gap-3 text-zinc-500 py-4">
               <AlertCircle size={20} />
               <span>No GPU instance is currently active.</span>
             </div>
          )}
        </div>

        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Active Configuration</h2>
          <div className="space-y-3">
            <DetailRow label="Vendor" value={status?.config?.vendor} />
            <DetailRow label="Idle Timeout" value={`${status?.config?.idleTimeoutMinutes} minutes`} />
            <DetailRow label="Auth" value="Bearer API Key" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string | number, subValue?: string }) {
  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 space-y-2">
      <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && <div className="text-xs text-zinc-500">{subValue}</div>}
    </div>
  )
}

function DetailRow({ label, value }: { label: string, value?: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-zinc-400">{label}</span>
      <span className="font-mono text-primary">{value || 'N/A'}</span>
    </div>
  )
}
