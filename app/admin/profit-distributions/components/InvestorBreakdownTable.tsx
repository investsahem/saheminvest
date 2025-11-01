'use client'

import { useState, useEffect } from 'react'
import { Users, AlertCircle, Download, Edit2, Check, X } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import type { InvestorDistributionDetail } from '../../../types/profit-distribution'

interface InvestorBreakdownTableProps {
  investors: InvestorDistributionDetail[]
  expectedTotalProfit: number
  expectedTotalCapital: number
  onInvestorAmountsChange: (investors: InvestorDistributionDetail[]) => void
  readonly?: boolean
}

export default function InvestorBreakdownTable({
  investors,
  expectedTotalProfit,
  expectedTotalCapital,
  onInvestorAmountsChange,
  readonly = false
}: InvestorBreakdownTableProps) {
  const [editedInvestors, setEditedInvestors] = useState<InvestorDistributionDetail[]>(investors)
  const [editingRow, setEditingRow] = useState<string | null>(null)

  useEffect(() => {
    setEditedInvestors(investors)
  }, [investors])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const handleFieldChange = (investorId: string, field: 'finalCapital' | 'finalProfit', value: string) => {
    const numValue = parseFloat(value) || 0
    const updated = editedInvestors.map(inv =>
      inv.investorId === investorId
        ? { ...inv, [field]: numValue, finalTotal: field === 'finalCapital' ? numValue + inv.finalProfit : inv.finalCapital + numValue }
        : inv
    )
    setEditedInvestors(updated)
  }

  const handleSaveRow = (investorId: string) => {
    setEditingRow(null)
    onInvestorAmountsChange(editedInvestors)
  }

  const handleCancelRow = (investorId: string) => {
    setEditingRow(null)
    setEditedInvestors(investors)
  }

  const totalActualProfit = editedInvestors.reduce((sum, inv) => sum + inv.finalProfit, 0)
  const totalActualCapital = editedInvestors.reduce((sum, inv) => sum + inv.finalCapital, 0)
  const totalActualAmount = editedInvestors.reduce((sum, inv) => sum + inv.finalTotal, 0)

  const profitMismatch = Math.abs(totalActualProfit - expectedTotalProfit) > 0.01
  const capitalMismatch = Math.abs(totalActualCapital - expectedTotalCapital) > 0.01

  const exportToCSV = () => {
    const headers = [
      'Investor ID',
      'Investor Name',
      'Email',
      'Total Investment',
      'Partial Capital',
      'Partial Profit',
      'Final Capital',
      'Final Profit',
      'Final Total'
    ]
    
    const rows = editedInvestors.map(inv => [
      inv.investorId,
      inv.investorName,
      inv.investorEmail,
      inv.totalInvestment.toFixed(2),
      inv.partialCapitalReceived.toFixed(2),
      inv.partialProfitReceived.toFixed(2),
      inv.finalCapital.toFixed(2),
      inv.finalProfit.toFixed(2),
      inv.finalTotal.toFixed(2)
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `investor-breakdown-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            تفاصيل توزيع المستثمرين
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير CSV
          </Button>
        </div>

        {/* Validation Warnings */}
        {(profitMismatch || capitalMismatch) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">تحذير: عدم تطابق الإجماليات</span>
            </div>
            {profitMismatch && (
              <p className="text-xs text-red-700 mt-1">
                إجمالي الأرباح: {formatCurrency(totalActualProfit)} (المتوقع: {formatCurrency(expectedTotalProfit)})
              </p>
            )}
            {capitalMismatch && (
              <p className="text-xs text-red-700 mt-1">
                إجمالي رأس المال: {formatCurrency(totalActualCapital)} (المتوقع: {formatCurrency(expectedTotalCapital)})
              </p>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-100 border-b border-purple-200">
              <tr>
                <th className="text-right p-3 font-medium text-gray-700">المستثمر</th>
                <th className="text-right p-3 font-medium text-gray-700">إجمالي الاستثمار</th>
                <th className="text-right p-3 font-medium text-gray-700">رأس المال الجزئي</th>
                <th className="text-right p-3 font-medium text-gray-700">الأرباح الجزئية</th>
                <th className="text-right p-3 font-medium text-gray-700">رأس المال النهائي</th>
                <th className="text-right p-3 font-medium text-gray-700">الأرباح النهائية</th>
                <th className="text-right p-3 font-medium text-gray-700">صافي الدفعة النهائية</th>
                <th className="text-right p-3 font-medium text-gray-700">الإجمالي الكلي</th>
                {!readonly && <th className="text-center p-3 font-medium text-gray-700">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {editedInvestors.map((investor) => {
                const isEditing = editingRow === investor.investorId
                return (
                  <tr key={investor.investorId} className="hover:bg-purple-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-gray-900">{investor.investorName}</p>
                        <p className="text-xs text-gray-500">{investor.investorEmail}</p>
                        <p className="text-xs text-gray-400">{investor.investorId.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="p-3 text-gray-700">{formatCurrency(investor.totalInvestment)}</td>
                    <td className="p-3 text-blue-600">{formatCurrency(investor.partialCapitalReceived)}</td>
                    <td className="p-3 text-blue-600">
                      {formatCurrency(investor.partialProfitReceived)}
                      {investor.partialDistributionCount > 0 && (
                        <span className="text-xs text-gray-500 mr-1">
                          ({investor.partialDistributionCount})
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing && !readonly ? (
                        <input
                          type="number"
                          step="0.01"
                          value={investor.finalCapital}
                          onChange={(e) => handleFieldChange(investor.investorId, 'finalCapital', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <span className="text-green-600 font-medium">{formatCurrency(investor.finalCapital)}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing && !readonly ? (
                        <input
                          type="number"
                          step="0.01"
                          value={investor.finalProfit}
                          onChange={(e) => handleFieldChange(investor.investorId, 'finalProfit', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <span className="text-green-600 font-medium">{formatCurrency(investor.finalProfit)}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded">
                        {formatCurrency(investor.finalTotal)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">ما سيُدفع الآن</p>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-purple-900">
                        {formatCurrency(
                          investor.partialCapitalReceived + 
                          investor.partialProfitReceived + 
                          investor.finalTotal
                        )}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">جزئي + نهائي</p>
                    </td>
                    {!readonly && (
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSaveRow(investor.investorId)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="حفظ"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelRow(investor.investorId)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="إلغاء"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingRow(investor.investorId)}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-purple-100 border-t-2 border-purple-300">
              <tr className="font-bold">
                <td className="p-3 text-gray-900">الإجمالي</td>
                <td className="p-3 text-gray-900">{formatCurrency(editedInvestors.reduce((sum, inv) => sum + inv.totalInvestment, 0))}</td>
                <td className="p-3 text-blue-700">{formatCurrency(editedInvestors.reduce((sum, inv) => sum + inv.partialCapitalReceived, 0))}</td>
                <td className="p-3 text-blue-700">{formatCurrency(editedInvestors.reduce((sum, inv) => sum + inv.partialProfitReceived, 0))}</td>
                <td className={`p-3 ${capitalMismatch ? 'text-red-700' : 'text-green-700'}`}>
                  {formatCurrency(totalActualCapital)}
                </td>
                <td className={`p-3 ${profitMismatch ? 'text-red-700' : 'text-green-700'}`}>
                  {formatCurrency(totalActualProfit)}
                </td>
                <td className="p-3 text-teal-700 bg-teal-50">{formatCurrency(totalActualAmount)}</td>
                <td className="p-3 text-purple-900">
                  {formatCurrency(
                    editedInvestors.reduce((sum, inv) => 
                      sum + inv.partialCapitalReceived + inv.partialProfitReceived + inv.finalTotal, 0
                    )
                  )}
                </td>
                {!readonly && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary Info */}
        <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
          <p className="text-xs text-gray-600 mb-2">
            <strong>ملاحظة:</strong> يمكنك تعديل مبالغ رأس المال والأرباح النهائية لكل مستثمر بشكل فردي. 
            تأكد من أن الإجماليات تتطابق مع المبالغ المتوقعة قبل الموافقة على التوزيع.
          </p>
          <div className="mt-2 pt-2 border-t border-purple-100">
            <p className="text-xs font-medium text-purple-800">
              📊 فهم الأعمدة:
            </p>
            <ul className="text-xs text-gray-600 mt-1 space-y-1 mr-4">
              <li>• <strong>صافي الدفعة النهائية:</strong> المبلغ الذي سيُدفع للمستثمر في هذا التوزيع (بعد خصم الجزئيات)</li>
              <li>• <strong>الإجمالي الكلي:</strong> مجموع كل ما حصل عليه المستثمر من الصفقة (جزئي + نهائي)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

