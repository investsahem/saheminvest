'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import FinancialOfficerLayout from '../../components/layout/FinancialOfficerLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { 
  DollarSign, TrendingUp, TrendingDown, Target, AlertTriangle,
  Calendar, Filter, Download, Plus, Edit, Trash2, 
  CheckCircle, XCircle, Clock, Building2, Users
} from 'lucide-react'

const BudgetPlanningPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [selectedBudget, setSelectedBudget] = useState('operational')

  // Budget categories data
  const budgetCategories = [
    {
      id: 'operational',
      name: 'Operational Expenses',
      allocated: 250000,
      spent: 185000,
      remaining: 65000,
      percentage: 74,
      status: 'on_track',
      color: '#10B981'
    },
    {
      id: 'marketing',
      name: 'Marketing & Acquisition',
      allocated: 150000,
      spent: 142000,
      remaining: 8000,
      percentage: 95,
      status: 'warning',
      color: '#F59E0B'
    },
    {
      id: 'technology',
      name: 'Technology & Infrastructure',
      allocated: 200000,
      spent: 120000,
      remaining: 80000,
      percentage: 60,
      status: 'under_budget',
      color: '#3B82F6'
    },
    {
      id: 'compliance',
      name: 'Compliance & Legal',
      allocated: 80000,
      spent: 85000,
      remaining: -5000,
      percentage: 106,
      status: 'over_budget',
      color: '#EF4444'
    },
    {
      id: 'reserves',
      name: 'Emergency Reserves',
      allocated: 100000,
      spent: 0,
      remaining: 100000,
      percentage: 0,
      status: 'reserved',
      color: '#8B5CF6'
    }
  ]

  // Monthly budget tracking
  const monthlyBudgetData = [
    { month: 'Jan', allocated: 130000, actual: 125000, variance: -5000 },
    { month: 'Feb', allocated: 135000, actual: 142000, variance: 7000 },
    { month: 'Mar', allocated: 140000, actual: 138000, variance: -2000 },
    { month: 'Apr', allocated: 145000, actual: 148000, variance: 3000 },
    { month: 'May', allocated: 150000, actual: 155000, variance: 5000 },
    { month: 'Jun', allocated: 155000, actual: 152000, variance: -3000 }
  ]

  // Budget requests/approvals
  const budgetRequests = [
    {
      id: 1,
      department: 'Technology',
      requestor: 'Ahmed Al-Rashid',
      amount: 25000,
      purpose: 'Cloud infrastructure upgrade',
      status: 'pending',
      priority: 'high',
      date: '2024-01-15'
    },
    {
      id: 2,
      department: 'Marketing',
      requestor: 'Sara Mohammed',
      amount: 15000,
      purpose: 'Q2 digital marketing campaign',
      status: 'approved',
      priority: 'medium',
      date: '2024-01-14'
    },
    {
      id: 3,
      department: 'Operations',
      requestor: 'Mohammed Al-Otaibi',
      amount: 8000,
      purpose: 'Office equipment replacement',
      status: 'rejected',
      priority: 'low',
      date: '2024-01-13'
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'over_budget': return 'bg-red-100 text-red-800'
      case 'under_budget': return 'bg-blue-100 text-blue-800'
      case 'reserved': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0)
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0)
  const totalRemaining = budgetCategories.reduce((sum, cat) => sum + cat.remaining, 0)

  return (
    <FinancialOfficerLayout 
      title={t('financialOfficer.budget_planning')}
      subtitle="Plan, track, and optimize budget allocation across departments"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('financialOfficer.budget_planning')}</h2>
          <p className="text-gray-600 mt-1">Comprehensive budget management and planning</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Allocated</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalAllocated)}</p>
                <p className="text-sm text-blue-600 mt-1">Annual budget</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {((totalSpent / totalAllocated) * 100).toFixed(1)}% utilized
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRemaining)}</p>
                <div className="flex items-center mt-1">
                  {totalRemaining > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${totalRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Available
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {budgetRequests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-sm text-yellow-600 mt-1">Need approval</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories and Monthly Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Budget Categories */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Budget Categories</h3>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
            <div className="space-y-4">
              {budgetCategories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                      {category.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Allocated</span>
                      <div className="font-medium">{formatCurrency(category.allocated)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Spent</span>
                      <div className="font-medium">{formatCurrency(category.spent)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Remaining</span>
                      <div className={`font-medium ${category.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(category.remaining)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Usage</span>
                      <span>{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(category.percentage, 100)}%`,
                          backgroundColor: category.color
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Budget Tracking */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Budget vs Actual</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyBudgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="allocated" fill="#3B82F6" name="Allocated" />
                <Bar dataKey="actual" fill="#10B981" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Requests */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Budget Requests</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgetRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.purpose}</div>
                        <div className="text-sm text-gray-500">by {request.requestor}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{request.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(request.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRequestStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <button className="text-green-600 hover:text-green-900" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="text-blue-600 hover:text-blue-900" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </FinancialOfficerLayout>
  )
}

export default BudgetPlanningPage