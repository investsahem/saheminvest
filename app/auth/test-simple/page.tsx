'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function TestSimpleAuth() {
  const [email, setEmail] = useState('admin@sahaminvest.com')
  const [password, setPassword] = useState('Azerty@123123')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult('')

    try {
      console.log('🧪 Testing simple auth...')
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      console.log('🔄 Simple auth result:', result)
      setResult(JSON.stringify(result, null, 2))
      
    } catch (error) {
      console.error('❌ Simple auth error:', error)
      setResult('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Simple Auth Test</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Auth'}
          </button>
        </form>
        
        {result && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Result:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
