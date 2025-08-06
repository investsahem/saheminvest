'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import FinancialOfficerLayout from '../../components/layout/FinancialOfficerLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Settings, Bell, Shield, DollarSign, AlertCircle, 
  CheckCircle, Save, RefreshCw, Download, Upload,
  User, Lock, Eye, EyeOff, Globe, Calendar
} from 'lucide-react'

const FinancialOfficerSettingsPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('general')
  const [showPassword, setShowPassword] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    autoApprovalLimit: 10000,
    requireDualApproval: true,
    notificationEmail: session?.user?.email || '',
    
    // Financial Thresholds
    highRiskThreshold: 50000,
    suspiciousActivityThreshold: 100000,
    dailyTransactionLimit: 500000,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security
    sessionTimeout: 30,
    requireMFA: true,
    passwordExpiry: 90,
    
    // Compliance
    auditLogRetention: 7,
    reportingFrequency: 'weekly',
    complianceAlerts: true
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings)
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'financial', name: 'Financial Thresholds', icon: DollarSign },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'compliance', name: 'Compliance', icon: CheckCircle }
  ]

  return (
    <FinancialOfficerLayout 
      title={t('financialOfficer.settings')}
      subtitle="Configure financial management preferences and security settings"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('financialOfficer.settings')}</h2>
          <p className="text-gray-600 mt-1">Manage your financial officer preferences and configurations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-Approval Limit
                      </label>
                      <Input
                        type="number"
                        value={settings.autoApprovalLimit}
                        onChange={(e) => handleSettingChange('autoApprovalLimit', Number(e.target.value))}
                        placeholder="Enter amount"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Transactions below this amount will be auto-approved
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Email
                      </label>
                      <Input
                        type="email"
                        value={settings.notificationEmail}
                        onChange={(e) => handleSettingChange('notificationEmail', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.requireDualApproval}
                        onChange={(e) => handleSettingChange('requireDualApproval', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Require dual approval for high-value transactions
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Thresholds */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Thresholds</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        High Risk Threshold
                      </label>
                      <Input
                        type="number"
                        value={settings.highRiskThreshold}
                        onChange={(e) => handleSettingChange('highRiskThreshold', Number(e.target.value))}
                        placeholder="Enter amount"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Transactions above this amount require additional review
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suspicious Activity Threshold
                      </label>
                      <Input
                        type="number"
                        value={settings.suspiciousActivityThreshold}
                        onChange={(e) => handleSettingChange('suspiciousActivityThreshold', Number(e.target.value))}
                        placeholder="Enter amount"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Triggers automatic compliance alerts
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Transaction Limit
                      </label>
                      <Input
                        type="number"
                        value={settings.dailyTransactionLimit}
                        onChange={(e) => handleSettingChange('dailyTransactionLimit', Number(e.target.value))}
                        placeholder="Enter amount"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Maximum daily transaction volume per user
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Email notifications for transactions
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        SMS notifications for high-value transactions
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Push notifications for urgent matters
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <Input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', Number(e.target.value))}
                        placeholder="Enter minutes"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Expiry (days)
                      </label>
                      <Input
                        type="number"
                        value={settings.passwordExpiry}
                        onChange={(e) => handleSettingChange('passwordExpiry', Number(e.target.value))}
                        placeholder="Enter days"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.requireMFA}
                        onChange={(e) => handleSettingChange('requireMFA', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Require Multi-Factor Authentication
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Compliance */}
            {activeTab === 'compliance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Audit Log Retention (years)
                      </label>
                      <Input
                        type="number"
                        value={settings.auditLogRetention}
                        onChange={(e) => handleSettingChange('auditLogRetention', Number(e.target.value))}
                        placeholder="Enter years"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reporting Frequency
                      </label>
                      <select
                        value={settings.reportingFrequency}
                        onChange={(e) => handleSettingChange('reportingFrequency', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.complianceAlerts}
                        onChange={(e) => handleSettingChange('complianceAlerts', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Enable automatic compliance alerts
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Settings
          </Button>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setSettings({
            autoApprovalLimit: 10000,
            requireDualApproval: true,
            notificationEmail: session?.user?.email || '',
            highRiskThreshold: 50000,
            suspiciousActivityThreshold: 100000,
            dailyTransactionLimit: 500000,
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            sessionTimeout: 30,
            requireMFA: true,
            passwordExpiry: 90,
            auditLogRetention: 7,
            reportingFrequency: 'weekly',
            complianceAlerts: true
          })}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>
    </FinancialOfficerLayout>
  )
}

export default FinancialOfficerSettingsPage