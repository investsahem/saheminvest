'use client'

import { useState } from 'react'
import { useTranslation } from '../providers/I18nProvider'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'fee'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  reference?: string
}

interface WalletProps {
  balance: number
  totalInvested: number
  totalReturns: number
  transactions: Transaction[]
  onDeposit?: (amount: number) => void
  onWithdraw?: (amount: number) => void
}

export function Wallet({
  balance,
  totalInvested,
  totalReturns,
  transactions,
  onDeposit,
  onWithdraw
}: WalletProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history'>('overview')
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState<'cash' | 'bank'>('cash')

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      case 'withdrawal':
        return <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      case 'investment':
        return <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      case 'return':
        return <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      case 'fee':
        return <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      default:
        return null
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    const baseClasses = "text-xs px-2 py-1 rounded-full"
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount)
    if (amount > 0 && onDeposit) {
      onDeposit(amount)
      setDepositAmount('')
      setActiveTab('overview')
    }
  }

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    if (amount > 0 && amount <= balance && onWithdraw) {
      onWithdraw(amount)
      setWithdrawAmount('')
      setActiveTab('overview')
    }
  }

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('wallet.balance')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(balance)} {t('common.currency')}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('wallet.total_invested')}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(totalInvested)} {t('common.currency')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('wallet.total_returns')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(totalReturns)} {t('common.currency')}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {['overview', 'deposit', 'withdraw', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'overview' && 'نظرة عامة'}
                  {tab === 'deposit' && t('wallet.deposit')}
                  {tab === 'withdraw' && t('wallet.withdraw')}
                  {tab === 'history' && t('wallet.transaction_history')}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">نظرة عامة على المحفظة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setActiveTab('deposit')}
                  className="w-full"
                >
                  {t('wallet.deposit')}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('withdraw')}
                  className="w-full"
                >
                  {t('wallet.withdraw')}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'deposit' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('wallet.deposit')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.amount')}
                  </label>
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">طرق الإيداع المتاحة:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• نقداً في المكتب</li>
                    <li>• بطاقة دفع إلكتروني</li>
                    <li>• تحويل بنكي</li>
                  </ul>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleDeposit} disabled={!depositAmount || parseFloat(depositAmount) <= 0}>
                    تأكيد الإيداع
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('overview')}>
                    {t('forms.cancel')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('wallet.withdraw')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.amount')}
                  </label>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    max={balance}
                    step="0.01"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    الحد الأقصى: {formatNumber(balance)} {t('common.currency')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    طريقة السحب
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="cash"
                        checked={withdrawMethod === 'cash'}
                        onChange={(e) => setWithdrawMethod(e.target.value as 'cash' | 'bank')}
                        className="ml-2"
                      />
                      <span>نقداً من المكتب</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="bank"
                        checked={withdrawMethod === 'bank'}
                        onChange={(e) => setWithdrawMethod(e.target.value as 'cash' | 'bank')}
                        className="ml-2"
                      />
                      <span>تحويل بنكي</span>
                    </label>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">ملاحظة:</h4>
                  <p className="text-sm text-gray-600">
                    عمليات السحب تحتاج إلى موافقة إدارية وقد تستغرق 1-3 أيام عمل.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleWithdraw} 
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance}
                  >
                    طلب السحب
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('overview')}>
                    {t('forms.cancel')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('wallet.transaction_history')}</h3>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                          {transaction.reference && (
                            <p className="text-xs text-gray-400">مرجع: {transaction.reference}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-medium ${
                          ['deposit', 'return'].includes(transaction.type) ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {['deposit', 'return'].includes(transaction.type) ? '+' : '-'}
                          {formatNumber(transaction.amount)} {t('common.currency')}
                        </p>
                        <span className={getStatusBadge(transaction.status)}>
                          {t(`status.${transaction.status}`)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد معاملات حتى الآن
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 