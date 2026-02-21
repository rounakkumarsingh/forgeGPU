import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock, Box, HardDrive, AlertCircle } from 'lucide-react'

export function History() {
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await fetch('/admin/history', {
        headers: { 'Authorization': `Bearer forge-default-key` }
      })
      return res.json()
    },
    refetchInterval: 15000,
  })

  const logs = (data as any)?.logs || []

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Request History</h1>

      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900/80 border-b border-zinc-800">
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Model</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {logs.length > 0 ? logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4 text-sm text-zinc-300">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-primary">
                  {log.model}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-300 flex items-center gap-2">
                   <Clock size={14} className="text-purple-400" />
                   {log.duration}ms
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    log.status < 400 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle size={24} />
                    <span>No requests logged yet.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
