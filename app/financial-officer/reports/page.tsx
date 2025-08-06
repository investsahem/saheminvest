'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import FinancialOfficerLayout from '../../components/layout/FinancialOfficerLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  FileText, Download, Calendar, Filter, Search, Plus, 
  Eye, Edit, Trash2, Clock, CheckCircle, AlertCircle,
  BarChart3, PieChart, TrendingUp, DollarSign,
  Users, Building2, CreditCard, Wallet, Target,
  RefreshCw, Send, Share2
} from 'lucide-react'

const FinancialReportsPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [selectedTab, setSelectedTab] = useState('reports')
  const [selectedReportType, setSelectedReportType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock financial reports data
  const reports = [
    {
      id: 1,
      title: 'Monthly Financial Summary - June 2024',
      type: 'monthly',
      status: 'completed',
      generatedDate: '2024-06-30T23:59:00Z',
      generatedBy: 'Ahmed Al-Rashid',
      fileSize: '2.4 MB',
      downloads: 15,
      description: 'Comprehensive monthly financial performance report including revenue, expenses, and cash flow analysis.'
    },
    {
      id: 2,
      title: 'Q2 2024 Revenue Analysis',
      type: 'quarterly',
      status: 'completed',
      generatedDate: '2024-06-30T18:30:00Z',
      generatedBy: 'Sara Mohammed',
      fileSize: '3.1 MB',
      downloads: 8,
      description: 'Detailed quarterly revenue breakdown by streams, user segments, and growth metrics.'
    },
    {
      id: 3,
      title: 'Transaction Compliance Report',
      type: 'compliance',
      status: 'completed',
      generatedDate: '2024-06-29T14:15:00Z',
      generatedBy: 'Mohammed Al-Otaibi',
      fileSize: '1.8 MB',
      downloads: 12,
      description: 'Regulatory compliance report covering all high-value transactions and risk assessments.'
    },
    {
      id: 4,
      title: 'Budget vs Actual - June 2024',
      type: 'budget',
      status: 'generating',
      generatedDate: '2024-07-01T09:00:00Z',
      generatedBy: 'Fatima Al-Ali',
      fileSize: null,
      downloads: 0,
      description: 'Monthly budget performance analysis comparing allocated vs actual expenses.'
    },
    {
      id: 5,
      title: 'Annual Financial Audit 2024',
      type: 'annual',
      status: 'draft',
      generatedDate: null,
      generatedBy: session?.user?.name || 'Current User',
      fileSize: null,
      downloads: 0,
      description: 'Comprehensive annual financial audit report for regulatory submission.'
    }
  ]

  // Report templates
  const reportTemplates = [
    {
      id: 'monthly_summary',
      name: 'Monthly Financial Summary',
      description: 'Complete monthly financial performance overview',
      frequency: 'Monthly',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'revenue_analysis',
      name: 'Revenue Analysis Report',
      description: 'Detailed revenue breakdown and growth analysis',
      frequency: 'Monthly/Quarterly',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'expense_report',
      name: 'Expense Management Report',
      description: 'Comprehensive expense tracking and budget analysis',
      frequency: 'Monthly',
      icon: DollarSign,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'compliance_report',
      name: 'Compliance & Risk Report',
      description: 'Regulatory compliance and risk assessment report',
      frequency: 'Weekly/Monthly',
      icon: AlertCircle,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'cash_flow',
      name: 'Cash Flow Statement',
      description: 'Detailed cash flow analysis and projections',
      frequency: 'Monthly',
      icon: Wallet,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'user_segment',
      name: 'User Segment Analysis',
      description: 'Financial performance by user segments',
      frequency: 'Quarterly',
      icon: Users,
      color: 'bg-indigo-100 text-indigo-600'
    }
  ]

  // Quick stats
  const reportStats = {
    totalReports: reports.length,
    completedReports: reports.filter(r => r.status === 'completed').length,
    generatingReports: reports.filter(r => r.status === 'generating').length,
    draftReports: reports.filter(r => r.status === 'draft').length,
    totalDownloads: reports.reduce((sum, r) => sum + r.downloads, 0)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not generated'
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'generating': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'generating': return <Clock className="w-4 h-4" />
      case 'draft': return <Edit className="w-4 h-4" />
      case 'failed': return <AlertCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return 'bg-blue-100 text-blue-800'
      case 'quarterly': return 'bg-green-100 text-green-800'
      case 'annual': return 'bg-purple-100 text-purple-800'
      case 'compliance': return 'bg-yellow-100 text-yellow-800'
      case 'budget': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredReports = reports.filter(report => {
    if (selectedReportType !== 'all' && report.type !== selectedReportType) return false
    if (searchTerm && !report.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !report.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <FinancialOfficerLayout 
      title={t('financialOfficer.financial_reports')}
      subtitle="Generate, manage, and analyze financial reports"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('financialOfficer.financial_reports')}</h2>
          <p className="text-gray-600 mt-1">Generate and manage comprehensive financial reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reportStats.totalReports}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{reportStats.completedReports}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generating</p>
                <p className="text-2xl font-bold text-yellow-600">{reportStats.generatingReports}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-600">{reportStats.draftReports}</p>
              </div>
              <Edit className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-blue-600">{reportStats.totalDownloads}</p>
              </div>
              <Download className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'reports', name: 'Reports', count: reportStats.totalReports },
            { id: 'templates', name: 'Templates', count: reportTemplates.length },
            { id: 'scheduled', name: 'Scheduled', count: 3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Reports Tab */}
      {selectedTab === 'reports' && (
        <>
          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'All Reports' },
                    { key: 'monthly', label: 'Monthly' },
                    { key: 'quarterly', label: 'Quarterly' },
                    { key: 'compliance', label: 'Compliance' },
                    { key: 'budget', label: 'Budget' }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setSelectedReportType(filter.key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedReportType === filter.key
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportTypeColor(report.type)}`}>
                          {report.type.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          <span className="mr-1">{getStatusIcon(report.status)}</span>
                          {report.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{report.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>Generated: {formatDate(report.generatedDate)}</span>
                        <span>By: {report.generatedBy}</span>
                        {report.fileSize && <span>Size: {report.fileSize}</span>}
                        <span>Downloads: {report.downloads}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {report.status === 'completed' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </>
                      )}
                      {report.status === 'draft' && (
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      {report.status === 'generating' && (
                        <Button variant="outline" size="sm" disabled>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTemplates.map((template) => {
            const Icon = template.icon
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${template.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Button variant="outline" size="sm">
                      Generate
                    </Button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Frequency: {template.frequency}</span>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Scheduled Tab */}
      {selectedTab === 'scheduled' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Scheduled Reports</h3>
              <p className="text-gray-500 mb-4">Set up automated report generation schedules</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule New Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </FinancialOfficerLayout>
  )
}

export default FinancialReportsPage