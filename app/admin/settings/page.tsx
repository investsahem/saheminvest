'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import {
  Settings, Shield, Bell, Mail, Globe, Database, Key,
  Users, DollarSign, FileText, Save, RefreshCw, Eye,
  EyeOff, AlertCircle, CheckCircle, Lock, Unlock,
  Server, Cloud, Smartphone, Monitor, Palette, Languages, Edit
} from 'lucide-react'

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    supportEmail: string
    timezone: string
    currency: string
    language: string
  }
  security: {
    twoFactorEnabled: boolean
    passwordMinLength: number
    sessionTimeout: number
    maxLoginAttempts: number
    emailVerificationRequired: boolean
    adminApprovalRequired: boolean
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    marketingEmails: boolean
    transactionAlerts: boolean
    securityAlerts: boolean
  }
  financial: {
    platformFeePercentage: number
    minimumInvestment: number
    maximumInvestment: number
    withdrawalFee: number
    processingFeePercentage: number
    partnerCommissionRate: number
  }
  features: {
    userRegistration: boolean
    dealCreation: boolean
    autoApproval: boolean
    maintenanceMode: boolean
    analyticsEnabled: boolean
    backupEnabled: boolean
  }
  integrations: {
    cloudinaryEnabled: boolean
    emailServiceEnabled: boolean
    smsServiceEnabled: boolean
    paymentGatewayEnabled: boolean
    analyticsEnabled: boolean
    backupServiceEnabled: boolean
    brevoApiKey: string
    vapidPublicKey: string
    vapidPrivateKey: string
  }
}

// Admin notification settings interface
interface AdminNotificationSettings {
  adminNotificationEmail: string
  notifyOnInvestment: boolean
  notifyOnDeposit: boolean
  notifyOnWithdrawal: boolean
  notifyOnProfitDistribution: boolean
}

const SettingsPage = () => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('general')
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [adminNotificationSettings, setAdminNotificationSettings] = useState<AdminNotificationSettings>({
    adminNotificationEmail: '',
    notifyOnInvestment: true,
    notifyOnDeposit: true,
    notifyOnWithdrawal: true,
    notifyOnProfitDistribution: true
  })
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'Sahem Invest',
      siteDescription: 'Professional investment platform connecting investors with opportunities',
      contactEmail: 'contact@sahaminvest.com',
      supportEmail: 'support@sahaminvest.com',
      timezone: 'Asia/Dubai',
      currency: 'USD',
      language: 'en'
    },
    security: {
      twoFactorEnabled: true,
      passwordMinLength: 8,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      emailVerificationRequired: true,
      adminApprovalRequired: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: false,
      transactionAlerts: true,
      securityAlerts: true
    },
    financial: {
      platformFeePercentage: 2.5,
      minimumInvestment: 1000,
      maximumInvestment: 100000,
      withdrawalFee: 25,
      processingFeePercentage: 1.5,
      partnerCommissionRate: 5.0
    },
    features: {
      userRegistration: true,
      dealCreation: true,
      autoApproval: false,
      maintenanceMode: false,
      analyticsEnabled: true,
      backupEnabled: true
    },
    integrations: {
      cloudinaryEnabled: true,
      emailServiceEnabled: true,
      smsServiceEnabled: false,
      paymentGatewayEnabled: true,
      analyticsEnabled: true,
      backupServiceEnabled: true,
      brevoApiKey: process.env.BREVO_API_KEY || '',
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || ''
    }
  })

  // Fetch admin notification settings
  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            setAdminNotificationSettings(data.settings)
          }
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAdminSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save admin notification settings
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminNotificationSettings)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(error instanceof Error ? error.message : 'Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'features', name: 'Features', icon: FileText },
    { id: 'integrations', name: 'Integrations', icon: Cloud },
  ]

  if (loading) {
    return (
      <AdminLayout
        title="System Settings"
        subtitle="Configure platform settings and preferences"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="System Settings"
      subtitle="Configure platform settings and preferences"
    >
      <div className="space-y-6">
        {/* Save Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Platform Configuration</h3>
                <p className="text-sm text-gray-600">Manage your platform settings and preferences</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium text-left transition-colors ${activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {tab.name}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Site Name
                          </label>
                          <Input
                            type="text"
                            value={settings.general.siteName}
                            onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Email
                          </label>
                          <Input
                            type="email"
                            value={settings.general.contactEmail}
                            onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Support Email
                          </label>
                          <Input
                            type="email"
                            value={settings.general.supportEmail}
                            onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timezone
                          </label>
                          <select
                            value={settings.general.timezone}
                            onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                            <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                            <option value="UTC">UTC (GMT+0)</option>
                            <option value="America/New_York">America/New_York (GMT-5)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                          </label>
                          <select
                            value={settings.general.currency}
                            onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="USD">USD - US Dollar</option>
                            <option value="AED">AED - UAE Dirham</option>
                            <option value="SAR">SAR - Saudi Riyal</option>
                            <option value="EUR">EUR - Euro</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default Language
                          </label>
                          <select
                            value={settings.general.language}
                            onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="en">English</option>
                            <option value="ar">Arabic</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Site Description
                        </label>
                        <textarea
                          value={settings.general.siteDescription}
                          onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.security.twoFactorEnabled}
                              onChange={(e) => handleInputChange('security', 'twoFactorEnabled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Minimum Password Length
                            </label>
                            <Input
                              type="number"
                              min="6"
                              max="20"
                              value={settings.security.passwordMinLength}
                              onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Session Timeout (hours)
                            </label>
                            <Input
                              type="number"
                              min="1"
                              max="168"
                              value={settings.security.sessionTimeout}
                              onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Max Login Attempts
                            </label>
                            <Input
                              type="number"
                              min="3"
                              max="10"
                              value={settings.security.maxLoginAttempts}
                              onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Email Verification Required</h4>
                              <p className="text-sm text-gray-600">Require email verification for new accounts</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.security.emailVerificationRequired}
                                onChange={(e) => handleInputChange('security', 'emailVerificationRequired', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Admin Approval Required</h4>
                              <p className="text-sm text-gray-600">Require admin approval for new partner accounts</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.security.adminApprovalRequired}
                                onChange={(e) => handleInputChange('security', 'adminApprovalRequired', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                              <p className="text-sm text-gray-600">Send notifications via email</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications.emailNotifications}
                              onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Smartphone className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                              <p className="text-sm text-gray-600">Send notifications via SMS</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications.smsNotifications}
                              onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Bell className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                              <p className="text-sm text-gray-600">Send browser push notifications</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications.pushNotifications}
                              onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Transaction Alerts</h4>
                              <p className="text-sm text-gray-600">Notify on financial transactions</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications.transactionAlerts}
                              onChange={(e) => handleInputChange('notifications', 'transactionAlerts', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Shield className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Security Alerts</h4>
                              <p className="text-sm text-gray-600">Notify on security events</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications.securityAlerts}
                              onChange={(e) => handleInputChange('notifications', 'securityAlerts', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Admin Email Notifications Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Email Notifications</h3>
                      <p className="text-sm text-gray-600 mb-4">Configure an email address to receive notifications for important platform operations.</p>

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Notification Email
                        </label>
                        <Input
                          type="email"
                          placeholder="admin@example.com"
                          value={adminNotificationSettings.adminNotificationEmail}
                          onChange={(e) => setAdminNotificationSettings(prev => ({
                            ...prev,
                            adminNotificationEmail: e.target.value
                          }))}
                        />
                        <p className="text-xs text-gray-500 mt-1">This email will receive notifications for the enabled events below.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 text-purple-500 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Investment Notifications</h4>
                              <p className="text-sm text-gray-600">Notify when a new investment is made</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={adminNotificationSettings.notifyOnInvestment}
                              onChange={(e) => setAdminNotificationSettings(prev => ({
                                ...prev,
                                notifyOnInvestment: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 text-green-500 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Deposit Notifications</h4>
                              <p className="text-sm text-gray-600">Notify when a new deposit is submitted</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={adminNotificationSettings.notifyOnDeposit}
                              onChange={(e) => setAdminNotificationSettings(prev => ({
                                ...prev,
                                notifyOnDeposit: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 text-amber-500 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Withdrawal Notifications</h4>
                              <p className="text-sm text-gray-600">Notify when a withdrawal is requested</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={adminNotificationSettings.notifyOnWithdrawal}
                              onChange={(e) => setAdminNotificationSettings(prev => ({
                                ...prev,
                                notifyOnWithdrawal: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 text-blue-500 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Profit Distribution Notifications</h4>
                              <p className="text-sm text-gray-600">Notify when a profit distribution is approved</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={adminNotificationSettings.notifyOnProfitDistribution}
                              onChange={(e) => setAdminNotificationSettings(prev => ({
                                ...prev,
                                notifyOnProfitDistribution: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financial Settings */}
                {activeTab === 'financial' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Platform Fee (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={settings.financial.platformFeePercentage}
                            onChange={(e) => handleInputChange('financial', 'platformFeePercentage', parseFloat(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Partner Commission Rate (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            value={settings.financial.partnerCommissionRate}
                            onChange={(e) => handleInputChange('financial', 'partnerCommissionRate', parseFloat(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Investment ($)
                          </label>
                          <Input
                            type="number"
                            min="100"
                            value={settings.financial.minimumInvestment}
                            onChange={(e) => handleInputChange('financial', 'minimumInvestment', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Investment ($)
                          </label>
                          <Input
                            type="number"
                            min="1000"
                            value={settings.financial.maximumInvestment}
                            onChange={(e) => handleInputChange('financial', 'maximumInvestment', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Withdrawal Fee ($)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={settings.financial.withdrawalFee}
                            onChange={(e) => handleInputChange('financial', 'withdrawalFee', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Processing Fee (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={settings.financial.processingFeePercentage}
                            onChange={(e) => handleInputChange('financial', 'processingFeePercentage', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Features Settings */}
                {activeTab === 'features' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Users className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">User Registration</h4>
                              <p className="text-sm text-gray-600">Allow new user registrations</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.features.userRegistration}
                              onChange={(e) => handleInputChange('features', 'userRegistration', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Deal Creation</h4>
                              <p className="text-sm text-gray-600">Allow partners to create deals</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.features.dealCreation}
                              onChange={(e) => handleInputChange('features', 'dealCreation', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Auto Approval</h4>
                              <p className="text-sm text-gray-600">Automatically approve new deals</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.features.autoApproval}
                              onChange={(e) => handleInputChange('features', 'autoApproval', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-red-900">Maintenance Mode</h4>
                              <p className="text-sm text-red-600">Put the platform in maintenance mode</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.features.maintenanceMode}
                              onChange={(e) => handleInputChange('features', 'maintenanceMode', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Integrations Settings */}
                {activeTab === 'integrations' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Cloud className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Cloudinary</h4>
                              <p className="text-sm text-gray-600">Image and video management service</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${settings.integrations.cloudinaryEnabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {settings.integrations.cloudinaryEnabled ? 'Connected' : 'Disconnected'}
                            </span>
                            <Button variant="outline" size="sm">
                              Configure
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Email Service</h4>
                              <p className="text-sm text-gray-600">SMTP email delivery service</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${settings.integrations.emailServiceEnabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {settings.integrations.emailServiceEnabled ? 'Connected' : 'Disconnected'}
                            </span>
                            <Button variant="outline" size="sm">
                              Configure
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Payment Gateway</h4>
                              <p className="text-sm text-gray-600">Payment processing service</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${settings.integrations.paymentGatewayEnabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {settings.integrations.paymentGatewayEnabled ? 'Connected' : 'Disconnected'}
                            </span>
                            <Button variant="outline" size="sm">
                              Configure
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Database className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Backup Service</h4>
                              <p className="text-sm text-gray-600">Automated database backups</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${settings.integrations.backupServiceEnabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {settings.integrations.backupServiceEnabled ? 'Connected' : 'Disconnected'}
                            </span>
                            <Button variant="outline" size="sm">
                              Configure
                            </Button>
                          </div>
                        </div>

                        {/* Email Templates Section */}
                        <div className="mt-8 p-4 border border-gray-200 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Email Templates</h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">Forgot Password</h5>
                                <p className="text-xs text-gray-500">Password reset email template</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">Deposit Confirmation</h5>
                                <p className="text-xs text-gray-500">Deposit received email template</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">Investment Confirmation</h5>
                                <p className="text-xs text-gray-500">Investment success email template</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">Return Payment</h5>
                                <p className="text-xs text-gray-500">Investment return email template</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* API Keys Section */}
                        <div className="mt-8 p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-900">API Keys & Configuration</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowApiKeys(!showApiKeys)}
                            >
                              {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Brevo API Key
                              </label>
                              <Input
                                type={showApiKeys ? 'text' : 'password'}
                                value={showApiKeys ? settings.integrations.brevoApiKey : '••••••••••••••••••••••••••••••••'}
                                onChange={(e) => handleInputChange('integrations', 'brevoApiKey', e.target.value)}
                                className="bg-gray-50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Cloudinary API Key
                              </label>
                              <Input
                                type={showApiKeys ? 'text' : 'password'}
                                value="••••••••••••••••••••••••••••••••"
                                readOnly
                                className="bg-gray-50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                VAPID Public Key (Push Notifications)
                              </label>
                              <Input
                                type={showApiKeys ? 'text' : 'password'}
                                value={showApiKeys ? settings.integrations.vapidPublicKey : '••••••••••••••••••••••••••••••••'}
                                onChange={(e) => handleInputChange('integrations', 'vapidPublicKey', e.target.value)}
                                className="bg-gray-50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                VAPID Private Key (Push Notifications)
                              </label>
                              <Input
                                type={showApiKeys ? 'text' : 'password'}
                                value={showApiKeys ? settings.integrations.vapidPrivateKey : '••••••••••••••••••••••••••••••••'}
                                onChange={(e) => handleInputChange('integrations', 'vapidPrivateKey', e.target.value)}
                                className="bg-gray-50"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default SettingsPage