'use client'

import { useState, useEffect } from 'react'
import InvestorLayout from '../../components/layout/InvestorLayout'

interface Investment {
  id: string
  projectTitle: string
  amount: number
  investmentDate: string
  status: 'active' | 'completed' | 'pending'
  expectedReturn: number
  currentValue: number
  progress: number
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading investments data
    setTimeout(() => {
      setInvestments([
        {
          id: '1',
          projectTitle: 'Tech Startup Series A',
          amount: 10000,
          investmentDate: '2024-01-15',
          status: 'active',
          expectedReturn: 12000,
          currentValue: 11000,
          progress: 65
        },
        {
          id: '2',
          projectTitle: 'Real Estate Development',
          amount: 25000,
          investmentDate: '2024-02-20',
          status: 'active',
          expectedReturn: 30000,
          currentValue: 27000,
          progress: 80
        },
        {
          id: '3',
          projectTitle: 'Green Energy Project',
          amount: 15000,
          investmentDate: '2023-12-10',
          status: 'completed',
          expectedReturn: 18000,
          currentValue: 18500,
          progress: 100
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <InvestorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalReturn = totalCurrentValue - totalInvested

  return (
    <InvestorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Investments</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Invested</div>
            <div className="text-2xl font-bold text-gray-900">${totalInvested.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Current Value</div>
            <div className="text-2xl font-bold text-gray-900">${totalCurrentValue.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Return</div>
            <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalReturn.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Active Investments</div>
            <div className="text-2xl font-bold text-gray-900">
              {investments.filter(inv => inv.status === 'active').length}
            </div>
          </div>
        </div>

        {/* Investments List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Invested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
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
                {investments.map((investment) => {
                  const returnAmount = investment.currentValue - investment.amount
                  const returnPercentage = ((returnAmount / investment.amount) * 100).toFixed(1)
                  
                  return (
                    <tr key={investment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {investment.projectTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            Invested on {new Date(investment.investmentDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${investment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${investment.currentValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={returnAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${returnAmount.toLocaleString()} ({returnPercentage}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${investment.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{investment.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          investment.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : investment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {investment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          View Details
                        </button>
                        {investment.status === 'active' && (
                          <button className="text-green-600 hover:text-green-900">
                            Add More
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </InvestorLayout>
  )
}