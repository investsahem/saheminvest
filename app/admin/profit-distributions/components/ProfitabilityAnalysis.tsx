'use client'

import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Info } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'
import type { ProfitabilityAnalysis as ProfitabilityAnalysisType } from '../../../types/profit-distribution'

interface ProfitabilityAnalysisProps {
  analysis: ProfitabilityAnalysisType
}

export default function ProfitabilityAnalysis({ analysis }: ProfitabilityAnalysisProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  if (analysis.isProfitable) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-900">الصفقة حققت أرباحاً</h3>
              <p className="text-sm text-green-700">{analysis.reason}</p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.message}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">رأس المال الأصلي</p>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(analysis.details.originalInvestment)}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">إجمالي الربح</p>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(analysis.profitOrLossAmount)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                +{formatPercentage(analysis.profitOrLossPercentage)}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">العمولات المدفوعة</p>
                <Info className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-lg font-bold text-orange-700">
                {formatCurrency(analysis.details.commissionsPaid)}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">ما يحصل عليه المستثمرون</p>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-900">
                {formatCurrency(analysis.details.investorRecovery)}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">حالة جيدة - كل شيء على ما يرام</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>سيتم إرجاع رأس المال بالكامل لجميع المستثمرين</li>
                  <li>سيحصل المستثمرون على أرباحهم كاملة بعد خصم العمولات</li>
                  <li>الصفقة محققة لأهدافها المالية</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  } else {
    // Loss scenario
    const lossAmount = Math.abs(analysis.profitOrLossAmount)
    const recoveryPercentage = (analysis.details.investorRecovery / analysis.details.originalInvestment) * 100

    return (
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-900">الصفقة غير مربحة</h3>
              <p className="text-sm text-red-700">{analysis.reason}</p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-white rounded-lg border border-red-200">
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.message}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">رأس المال الأصلي</p>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(analysis.details.originalInvestment)}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">مبلغ الخسارة</p>
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-lg font-bold text-red-700">
                {formatCurrency(lossAmount)}
              </p>
              <p className="text-xs text-red-600 mt-1">
                -{formatPercentage(Math.abs(analysis.profitOrLossPercentage))}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">العمولات</p>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-700">
                {formatCurrency(analysis.details.commissionsPaid)}
              </p>
              <p className="text-xs text-gray-500">لا عمولات</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">استرداد جزئي</p>
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-lg font-bold text-orange-700">
                {formatCurrency(analysis.details.investorRecovery)}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {formatPercentage(recoveryPercentage)}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">تنبيه - الصفقة في خسارة</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>لم يتحقق الربح المتوقع من الصفقة</li>
                  <li>سيتم استرداد {formatPercentage(recoveryPercentage)} فقط من رأس المال</li>
                  <li>لن يتم خصم أي عمولات (ساهم انفست أو الاحتياطي)</li>
                  <li>الخسارة الإجمالية: {formatCurrency(lossAmount)} ({formatPercentage(Math.abs(analysis.profitOrLossPercentage))})</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">تفاصيل توزيع الخسارة:</h4>
            <div className="text-xs text-gray-700 space-y-1">
              <p>• سيتم توزيع المبلغ المتبقي ({formatCurrency(analysis.details.investorRecovery)}) على المستثمرين حسب نسبة استثماراتهم</p>
              <p>• كل مستثمر سيحصل على نسبة من رأس ماله الأصلي فقط</p>
              <p>• لا يوجد أرباح في هذا التوزيع</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
}

