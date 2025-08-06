'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const DebugPage = () => {
  const { data: session, status } = useSession()

  const testEditAPI = async () => {
    try {
      console.log('Testing edit API with current session...')
      const response = await fetch('/api/deals', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const firstDeal = data.deals[0]
        
        if (firstDeal) {
          console.log('Testing PUT request for deal:', firstDeal.id)
          
          const formData = new FormData()
          formData.append('title', firstDeal.title + ' (Test)')
          formData.append('description', firstDeal.description)
          formData.append('category', firstDeal.category)
          formData.append('fundingGoal', firstDeal.fundingGoal.toString())
          formData.append('minInvestment', firstDeal.minInvestment.toString())
          formData.append('expectedReturn', firstDeal.expectedReturn.toString())
          formData.append('duration', firstDeal.duration.toString())
          formData.append('riskLevel', firstDeal.riskLevel || 'MEDIUM')
          formData.append('status', firstDeal.status)
          formData.append('highlights', JSON.stringify(firstDeal.highlights))
          formData.append('tags', JSON.stringify(firstDeal.tags))
          formData.append('featured', firstDeal.featured.toString())
          
          const putResponse = await fetch(`/api/deals/${firstDeal.id}`, {
            method: 'PUT',
            body: formData,
            credentials: 'include'
          })
          
          console.log('PUT Response status:', putResponse.status)
          const result = await putResponse.json()
          console.log('PUT Response:', result)
        }
      }
    } catch (error) {
      console.error('Test error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Debug Session</h1>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Session Status</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Authenticated:</strong> {session ? 'Yes' : 'No'}</p>
              {session && (
                <>
                  <p><strong>User:</strong> {session.user?.name} ({session.user?.email})</p>
                  <p><strong>Role:</strong> {session.user?.role}</p>
                  <p><strong>User ID:</strong> {session.user?.id}</p>
                  <p><strong>Expires:</strong> {session.expires}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Test Actions</h2>
            <div className="space-y-4">
              <Button onClick={testEditAPI}>
                Test Edit API Call
              </Button>
              <p className="text-sm text-gray-600">
                Check browser console for results
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Login Links</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Use these credentials to test:</p>
              <div className="space-y-1 text-sm">
                <p><strong>Admin:</strong> admin@sahaminvest.com / password</p>
                <p><strong>Deal Manager:</strong> dealmanager@sahaminvest.com / password</p>
                <p><strong>Investor:</strong> investor@sahaminvest.com / password</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/auth/signin'}
                variant="outline"
                className="mt-4"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DebugPage
