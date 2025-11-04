'use client'

import { Calendar, DollarSign, TrendingUp, Users, User } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'
import type { HistoricalPartialSummary, InvestorHistoricalData } from '../../../types/profit-distribution'

interface DistributionHistoryProps {
  summary: HistoricalPartialSummary
  investorData?: InvestorHistoricalData[]
}

export default function DistributionHistory({ summary, investorData = [] }: DistributionHistoryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (summary.distributionCount === 0) {
    return (
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-gray-600" />
            التوزيعات الجزئية السابقة
          </h3>
          <p className="text-sm text-gray-600 text-center py-4">
            لا توجد توزيعات جزئية سابقة لهذه الصفقة
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          التوزيعات الجزئية السابقة
        </h3>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الأرباح الموزعة</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(summary.totalPartialProfit)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">رأس المال المسترد</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(summary.totalPartialCapital)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">عدد التوزيعات</p>
                <p className="text-xl font-bold text-blue-900">{summary.distributionCount} {summary.distributionCount === 1 ? 'توزيع' : 'توزيعات'}</p>
                <p className="text-xs text-gray-500 mt-1">{investorData.length} {investorData.length === 1 ? 'مستثمر' : 'مستثمرين'}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Timeline */}
        {summary.distributionDates && summary.distributionDates.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">تواريخ التوزيعات</h4>
            <div className="flex flex-wrap gap-2">
              {summary.distributionDates.map((date, index) => (
                <div
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(date)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investor Details */}
        {investorData.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2 text-blue-600" />
              تفاصيل المستثمرين في التوزيعات الجزئية
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="text-right p-2 font-medium text-gray-700">المستثمر</th>
                    <th className="text-right p-2 font-medium text-gray-700">إجمالي الاستثمار</th>
                    <th className="text-right p-2 font-medium text-gray-700">عدد التوزيعات</th>
                    <th className="text-right p-2 font-medium text-gray-700">رأس المال المسترد</th>
                    <th className="text-right p-2 font-medium text-gray-700">الأرباح المستلمة</th>
                    <th className="text-right p-2 font-medium text-gray-700">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {investorData.map((investor) => (
                    <tr key={investor.investorId} className="hover:bg-blue-50">
                      <td className="p-2">
                        <p className="font-medium text-gray-900">{investor.investorName}</p>
                        <p className="text-xs text-gray-500">{investor.investorEmail}</p>
                      </td>
                      <td className="p-2 text-gray-700">{formatCurrency(investor.totalInvestment)}</td>
                      <td className="p-2 text-blue-600">{investor.partialDistributions.count}</td>
                      <td className="p-2 text-green-600">{formatCurrency(investor.partialDistributions.totalCapital)}</td>
                      <td className="p-2 text-green-600 font-medium">{formatCurrency(investor.partialDistributions.totalProfit)}</td>
                      <td className="p-2 text-blue-900 font-bold">
                        {formatCurrency(investor.partialDistributions.totalCapital + investor.partialDistributions.totalProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-blue-100 font-bold">
                  <tr>
                    <td className="p-2 text-gray-900">الإجمالي</td>
                    <td className="p-2 text-gray-900">{formatCurrency(investorData.reduce((sum, inv) => sum + inv.totalInvestment, 0))}</td>
                    <td className="p-2 text-blue-700">{investorData.reduce((sum, inv) => sum + inv.partialDistributions.count, 0)}</td>
                    <td className="p-2 text-green-700">{formatCurrency(investorData.reduce((sum, inv) => sum + inv.partialDistributions.totalCapital, 0))}</td>
                    <td className="p-2 text-green-700">{formatCurrency(investorData.reduce((sum, inv) => sum + inv.partialDistributions.totalProfit, 0))}</td>
                    <td className="p-2 text-blue-900">
                      {formatCurrency(investorData.reduce((sum, inv) => sum + inv.partialDistributions.totalCapital + inv.partialDistributions.totalProfit, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

