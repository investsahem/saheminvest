'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function DebugAuthPage() {
  const { data: session, status } = useSession()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  useEffect(() => {
    addLog(`Session status: ${status}`)
    if (session) {
      addLog(`Session data: ${JSON.stringify(session, null, 2)}`)
      addLog(`User role: ${session.user?.role}`)
      addLog(`User email: ${session.user?.email}`)
    }
  }, [session, status])

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Current Status</h2>
            <p className="text-sm text-gray-600">Status: <span className="font-mono">{status}</span></p>
            {session && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Email: <span className="font-mono">{session.user?.email}</span></p>
                <p className="text-sm text-gray-600">Role: <span className="font-mono">{session.user?.role}</span></p>
                <p className="text-sm text-gray-600">ID: <span className="font-mono">{session.user?.id}</span></p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Session Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Debug Logs</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs max-h-96 overflow-auto">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Environment Info</h2>
            <p className="text-sm text-gray-600">
              URL: <span className="font-mono">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</span>
            </p>
            <p className="text-sm text-gray-600">
              User Agent: <span className="font-mono text-xs">{typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</span>
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Go to Sign In
            </button>
            <button
              onClick={() => window.location.href = '/portfolio'}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
              Go to Portfolio
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
