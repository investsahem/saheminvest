'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../components/layout/AdminLayout'

interface EmailType {
  type: string
  name: string
  description: string
  requiredFields: string[]
}

interface TestEmailData {
  [key: string]: any
}

const AdminEmailsPage = () => {
  const { data: session } = useSession()
  const [emailTypes, setEmailTypes] = useState<EmailType[]>([])
  const [selectedEmailType, setSelectedEmailType] = useState<string>('')
  const [testData, setTestData] = useState<TestEmailData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [maintenanceData, setMaintenanceData] = useState({
    startTime: '',
    endTime: '',
    description: '',
    affectedServices: ['Trading Platform', 'User Dashboard']
  })
  const [passwordResetEmail, setPasswordResetEmail] = useState('')
  const [passwordResetStats, setPasswordResetStats] = useState<any>(null)

  useEffect(() => {
    fetchEmailTypes()
    fetchPasswordResetStats()
  }, [])

  const fetchPasswordResetStats = async () => {
    try {
      const response = await fetch('/api/admin/auth/test-password-reset')
      const data = await response.json()
      setPasswordResetStats(data.stats)
    } catch (error) {
      console.error('Error fetching password reset stats:', error)
    }
  }

  const fetchEmailTypes = async () => {
    try {
      const response = await fetch('/api/admin/emails/test')
      const data = await response.json()
      setEmailTypes(data.emailTypes)
    } catch (error) {
      console.error('Error fetching email types:', error)
    }
  }

  const handleTestDataChange = (field: string, value: any) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const sendTestEmail = async () => {
    if (!selectedEmailType) {
      setMessage({ type: 'error', text: 'Please select an email type' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailType: selectedEmailType,
          testData
        })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: result.message })
        setTestData({}) // Reset form
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send test email' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const sendMonthlyReports = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/emails/monthly-reports', {
        method: 'POST'
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send monthly reports' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const sendMaintenanceNotification = async () => {
    if (!maintenanceData.startTime || !maintenanceData.endTime || !maintenanceData.description) {
      setMessage({ type: 'error', text: 'Please fill all maintenance notification fields' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/emails/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(maintenanceData)
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: result.message })
        setMaintenanceData({
          startTime: '',
          endTime: '',
          description: '',
          affectedServices: ['Trading Platform', 'User Dashboard']
        })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send maintenance notification' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestPasswordReset = async () => {
    if (!passwordResetEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/auth/test-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: passwordResetEmail })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: result.message })
        setPasswordResetEmail('')
        fetchPasswordResetStats() // Refresh stats
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send test password reset' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedEmail = emailTypes.find(email => email.type === selectedEmailType)

  if (session?.user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📧 Email Management</h1>
          <p className="text-gray-600">
            Test email templates, send monthly reports, and manage system notifications.
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`rounded-md p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Test Email Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🧪 Test Email Templates</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Email Type
              </label>
              <select
                value={selectedEmailType}
                onChange={(e) => setSelectedEmailType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose an email type...</option>
                {emailTypes.map((email) => (
                  <option key={email.type} value={email.type}>
                    {email.name}
                  </option>
                ))}
              </select>
              
              {selectedEmail && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">{selectedEmail.description}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Required fields: {selectedEmail.requiredFields.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Test Data Form */}
            {selectedEmail && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Data
                </label>
                <div className="space-y-3">
                  {selectedEmail.requiredFields.map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                      </label>
                      {field === 'userType' ? (
                        <select
                          value={testData[field] || ''}
                          onChange={(e) => handleTestDataChange(field, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          <option value="INVESTOR">Investor</option>
                          <option value="PARTNER">Partner</option>
                          <option value="PORTFOLIO_ADVISOR">Portfolio Advisor</option>
                        </select>
                      ) : field === 'status' && selectedEmailType === 'kyc_status' ? (
                        <select
                          value={testData[field] || ''}
                          onChange={(e) => handleTestDataChange(field, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="PENDING">Pending</option>
                        </select>
                      ) : field === 'status' && selectedEmailType === 'deal_status' ? (
                        <select
                          value={testData[field] || ''}
                          onChange={(e) => handleTestDataChange(field, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      ) : field === 'alertType' ? (
                        <select
                          value={testData[field] || ''}
                          onChange={(e) => handleTestDataChange(field, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          <option value="LOGIN">New Login</option>
                          <option value="PASSWORD_CHANGE">Password Change</option>
                          <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                        </select>
                      ) : (
                        <input
                          type={field.includes('amount') || field.includes('Balance') ? 'number' : 
                                field.includes('email') ? 'email' : 'text'}
                          value={testData[field] || ''}
                          onChange={(e) => handleTestDataChange(field, e.target.value)}
                          placeholder={`Enter ${field}`}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={sendTestEmail}
              disabled={isLoading || !selectedEmailType}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : '📤 Send Test Email'}
            </button>
          </div>
        </div>

        {/* Password Reset Testing */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔐 Password Reset Testing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Email Address</label>
              <input
                type="email"
                value={passwordResetEmail}
                onChange={(e) => setPasswordResetEmail(e.target.value)}
                placeholder="Enter user email to send test reset link"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={sendTestPasswordReset}
              disabled={isLoading || !passwordResetEmail}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : '🔑 Send Test Password Reset'}
            </button>
            
            {passwordResetStats && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">📊 Reset Statistics</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Users:</span>
                    <span className="ml-2 font-medium">{passwordResetStats.totalUsers}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Active Tokens:</span>
                    <span className="ml-2 font-medium text-green-600">{passwordResetStats.activeResetTokens}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Expired Tokens:</span>
                    <span className="ml-2 font-medium text-red-600">{passwordResetStats.expiredResetTokens}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Reports */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Monthly Reports</h2>
            <p className="text-gray-600 mb-4">
              Send monthly portfolio reports to all investors with their performance summary.
            </p>
            <button
              onClick={sendMonthlyReports}
              disabled={isLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : '📈 Send Monthly Reports'}
            </button>
          </div>

          {/* Maintenance Notifications */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 Maintenance Notifications</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={maintenanceData.startTime}
                  onChange={(e) => setMaintenanceData(prev => ({...prev, startTime: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  value={maintenanceData.endTime}
                  onChange={(e) => setMaintenanceData(prev => ({...prev, endTime: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={maintenanceData.description}
                  onChange={(e) => setMaintenanceData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe the maintenance work..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={sendMaintenanceNotification}
                disabled={isLoading}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : '🚨 Send Maintenance Alert'}
              </button>
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⚙️ Email Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Primary Email</h3>
              <p className="text-sm text-gray-600">noreply@sahaminvest.com</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Support Email</h3>
              <p className="text-sm text-gray-600">support@sahaminvest.com</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Billing Email</h3>
              <p className="text-sm text-gray-600">billing@sahaminvest.com</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Info Email</h3>
              <p className="text-sm text-gray-600">info@sahaminvest.com</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Provider:</strong> Brevo (SendinBlue) | 
              <strong> Domain:</strong> sahaminvest.com | 
              <strong> Status:</strong> ✅ Active
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminEmailsPage
