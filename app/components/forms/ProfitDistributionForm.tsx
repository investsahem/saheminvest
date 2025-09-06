'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { useTranslation } from '../providers/I18nProvider'
import { 
  DollarSign, 
  Users, 
  Calculator, 
  Send, 
  AlertCircle,
  CheckCircle,
  Eye,
  Calendar
} from 'lucide-react'

interface Investment {
  id: string
  amount: number
  investor: {
    id: string
    name: string
    email: string
  }
}

interface Deal {
  id: string
  title: string
  currentFunding: number
  fundingGoal: number
  investments: Investment[]
}

interface ProfitDistribution {
  investorId: string
  investorName: string
  investmentAmount: number
  profitAmount: number
  profitPercentage: number
}

interface ProfitDistributionFormProps {
  deal: Deal
  onSubmit: (distributions: ProfitDistribution[]) => Promise<void>
  onCancel: () => void
}

export default function ProfitDistributionForm({ deal, onSubmit, onCancel }: ProfitDistributionFormProps) {
  const { t } = useTranslation()
  const [totalProfitAmount, setTotalProfitAmount] = useState<number>(0)
  const [distributionType, setDistributionType] = useState<'percentage' | 'fixed'>('percentage')
  const [profitPercentage, setProfitPercentage] = useState<number>(5)
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({})
  const [distributions, setDistributions] = useState<ProfitDistribution[]>([])
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [distributionDate, setDistributionDate] = useState(new Date().toISOString().split('T')[0])

  // Calculate distributions when inputs change
  useEffect(() => {
    calculateDistributions()
  }, [totalProfitAmount, distributionType, profitPercentage, customAmounts, deal.investments])

  const calculateDistributions = () => {
    if (!deal.investments || deal.investments.length === 0) return

    const newDistributions: ProfitDistribution[] = deal.investments.map(investment => {
      let profitAmount = 0

      if (distributionType === 'percentage') {
        // Calculate profit based on percentage of investment
        profitAmount = (Number(investment.amount) * profitPercentage) / 100
      } else {
        // Use custom fixed amounts
        profitAmount = customAmounts[investment.investor.id] || 0
      }

      return {
        investorId: investment.investor.id,
        investorName: investment.investor.name,
        investmentAmount: Number(investment.amount),
        profitAmount: profitAmount,
        profitPercentage: (profitAmount / Number(investment.amount)) * 100
      }
    })

    setDistributions(newDistributions)
    
    // Update total profit amount if using percentage distribution
    if (distributionType === 'percentage') {
      const total = newDistributions.reduce((sum, dist) => sum + dist.profitAmount, 0)
      setTotalProfitAmount(total)
    }
  }

  const handleCustomAmountChange = (investorId: string, amount: number) => {
    setCustomAmounts(prev => ({
      ...prev,
      [investorId]: amount
    }))
  }

  const handleSubmit = async () => {
    if (distributions.length === 0) {
      alert('No distributions calculated')
      return
    }

    if (!description.trim()) {
      alert('Please enter a description for this profit distribution')
      return
    }

    try {
      setLoading(true)
      await onSubmit(distributions)
    } catch (error) {
      console.error('Error submitting profit distribution:', error)
      alert('Failed to submit profit distribution')
    } finally {
      setLoading(false)
    }
  }

  const totalDistributionAmount = distributions.reduce((sum, dist) => sum + dist.profitAmount, 0)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Profit Distribution - {deal.title}
            </h2>
            <p className="text-gray-600">
              Total Raised: ${Number(deal.currentFunding).toLocaleString()} | 
              Investors: {deal.investments.length}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              <Send className="w-4 h-4 mr-2" />
              Submit for Approval
            </Button>
          </div>
        </div>

        {/* Distribution Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Distribution Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distribution Type
                </label>
                <select
                  value={distributionType}
                  onChange={(e) => setDistributionType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Percentage of Investment</option>
                  <option value="fixed">Fixed Amounts</option>
                </select>
              </div>

              {distributionType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profit Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={profitPercentage}
                    onChange={(e) => setProfitPercentage(Number(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., توزيع جزئي للأرباح - الجزء الأول"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distribution Date
                </label>
                <input
                  type="date"
                  value={distributionDate}
                  onChange={(e) => setDistributionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Distribution Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Investment:</span>
                <span className="font-semibold">${Number(deal.currentFunding).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Distribution:</span>
                <span className="font-semibold text-green-600">
                  ${totalDistributionAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Return:</span>
                <span className="font-semibold">
                  {deal.currentFunding > 0 ? 
                    ((totalDistributionAmount / Number(deal.currentFunding)) * 100).toFixed(2) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Investors:</span>
                <span className="font-semibold">{deal.investments.length}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Investor Distributions */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Investor Distributions
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Investor</th>
                  <th className="text-right py-3 px-4">Investment</th>
                  <th className="text-right py-3 px-4">
                    {distributionType === 'percentage' ? 'Profit (%)' : 'Custom Amount'}
                  </th>
                  <th className="text-right py-3 px-4">Profit Amount</th>
                  <th className="text-right py-3 px-4">Return %</th>
                </tr>
              </thead>
              <tbody>
                {distributions.map((dist, index) => (
                  <tr key={dist.investorId} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{dist.investorName}</p>
                        <p className="text-sm text-gray-500">{dist.investorId}</p>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
                      ${dist.investmentAmount.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      {distributionType === 'fixed' ? (
                        <input
                          type="number"
                          value={customAmounts[dist.investorId] || 0}
                          onChange={(e) => handleCustomAmountChange(dist.investorId, Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                        />
                      ) : (
                        `${profitPercentage}%`
                      )}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-green-600">
                      ${dist.profitAmount.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
                      {dist.profitPercentage.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-gray-50">
                  <td className="py-3 px-4 font-bold">Total</td>
                  <td className="text-right py-3 px-4 font-bold">
                    ${Number(deal.currentFunding).toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4"></td>
                  <td className="text-right py-3 px-4 font-bold text-green-600">
                    ${totalDistributionAmount.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 font-bold">
                    {deal.currentFunding > 0 ? 
                      ((totalDistributionAmount / Number(deal.currentFunding)) * 100).toFixed(2) : 0}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Warning */}
        {totalDistributionAmount > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Profit Distribution Notice
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This profit distribution will be submitted for admin approval. 
                  Once approved, the amounts will be automatically credited to investor wallets.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
