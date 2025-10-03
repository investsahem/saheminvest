'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation } from '../providers/I18nProvider'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  Wallet as WalletIcon, DollarSign, ArrowUpRight, ArrowDownLeft, 
  TrendingUp, CreditCard, Landmark, Plus, Minus, Eye, EyeOff,
  CheckCircle, Clock, AlertCircle, Shield, Lock
} from 'lucide-react'
import { SuccessModal } from '../ui/SuccessModal'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'fee'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  reference?: string
}

interface TransactionResult {
  success: boolean
  message: string
  transaction?: {
    id: string
    amount: number
    method: string
    status: string
    reference: string
    message: string
  }
}

interface WalletProps {
  balance: number
  totalInvested: number
  totalReturns: number
  transactions: Transaction[]
  activeInvestmentValue?: number
  profitsSummary?: {
    distributedProfits: number
    unrealizedGains: number
  }
  transactionSummary?: {
    totalDeposits: number
    totalWithdrawals: number
    totalInvestments: number
    actualTotalInvested: number
    totalReturns: number
    calculatedBalance: number
  }
  onDeposit?: (amount: number, method: string, cardDetails?: any) => Promise<TransactionResult>
  onWithdraw?: (amount: number, method: string) => Promise<TransactionResult>
}

export function Wallet({
  balance,
  totalInvested,
  totalReturns,
  transactions,
  activeInvestmentValue = 0,
  profitsSummary = { distributedProfits: 0, unrealizedGains: 0 },
  transactionSummary = { totalDeposits: 0, totalWithdrawals: 0, totalInvestments: 0, actualTotalInvested: 0, totalReturns: 0, calculatedBalance: 0 },
  onDeposit,
  onWithdraw
}: WalletProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history'>('overview')
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState<'cash' | 'bank'>('cash')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank' | ''>('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'pending' | 'error',
    title: '',
    message: '',
    amount: 0,
    method: '' as 'cash' | 'card' | 'bank' | '',
    reference: ''
  })
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    amount: 0,
    method: '' as 'cash' | 'bank',
    onConfirm: () => {},
    onCancel: () => {}
  })
  
  // Card payment form states
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
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
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-blue-600" />
      case 'return':
        return <DollarSign className="w-5 h-5 text-purple-600" />
      case 'fee':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />
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

  const handlePaymentMethodSelect = async (method: 'cash' | 'card' | 'bank') => {
    setPaymentMethod(method)
    
    if (method === 'card') {
      setShowPaymentForm(true)
    } else {
      setShowPaymentForm(false)
      // For cash and bank, show confirmation modal
      const amount = parseFloat(depositAmount)
      if (amount > 0 && onDeposit) {
        showConfirmationModal(amount, method as 'cash' | 'bank', async () => {
          setIsProcessing(true)
          closeConfirmationModal()
          
          const result = await onDeposit(amount, method)
          setIsProcessing(false)
          
          if (result.success) {
            setDepositAmount('')
            setPaymentMethod('')
            setActiveTab('overview')
            
            // Show appropriate modal - cash and bank are always pending
            showModal('pending', t('wallet.deposit_submitted'), result.message, amount, method, result.transaction?.reference)
          } else {
            showModal('error', t('wallet.deposit_failed'), result.message, amount, method)
          }
        })
      }
    }
  }

  const handleCardPayment = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      alert(t('wallet.card_details.fill_all_fields'))
      return
    }

    setIsProcessing(true)
    
    try {
      const amount = parseFloat(depositAmount)
      if (amount > 0 && onDeposit) {
        const result = await onDeposit(amount, 'card', cardDetails)
        
        if (result.success) {
          setDepositAmount('')
          setPaymentMethod('')
          setShowPaymentForm(false)
          setCardDetails({ number: '', expiry: '', cvv: '', name: '' })
          setActiveTab('overview')
          showModal('success', t('wallet.payment_successful'), result.message, amount, 'card', result.transaction?.reference)
        } else {
          showModal('error', t('wallet.payment_failed'), result.message, amount, 'card')
        }
      }
    } catch (error) {
      showModal('error', t('wallet.payment_error'), t('wallet.errors.payment_failed'), parseFloat(depositAmount), 'card')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (amount > 0 && amount <= balance && onWithdraw) {
      setIsProcessing(true)
      const result = await onWithdraw(amount, withdrawMethod)
      setIsProcessing(false)
      
      if (result.success) {
        setWithdrawAmount('')
        setActiveTab('overview')
        showModal('pending', t('wallet.withdrawal_requested'), result.message, amount, withdrawMethod as 'cash' | 'bank')
      } else {
        showModal('error', t('wallet.withdrawal_failed'), result.message, amount, withdrawMethod as 'cash' | 'bank')
      }
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const showModal = (
    type: 'success' | 'pending' | 'error',
    title: string,
    message: string,
    amount?: number,
    method?: 'cash' | 'card' | 'bank',
    reference?: string
  ) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message,
      amount: amount || 0,
      method: method || '',
      reference: reference || ''
    })
  }

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }

  const showConfirmationModal = (amount: number, method: 'cash' | 'bank', onConfirm: () => void) => {
    setConfirmationModal({
      isOpen: true,
      amount,
      method,
      onConfirm,
      onCancel: () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }))
        setPaymentMethod('')
      }
    })
  }

  const closeConfirmationModal = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }))
  }

  // Calculate actual returns (distributed profits only, not wallet balance)
  const actualReturns = profitsSummary.distributedProfits

  return (
    <div className="space-y-8">
      {/* Enhanced Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Balance Card - Enhanced */}
        <Card className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <WalletIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 uppercase tracking-wider">{t('portfolio_wallet.balance_summary.current_balance')}</p>
                  <p className="text-xs text-slate-500">{t('portfolio_wallet.balance_summary.available_funds')}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="bg-white/70 border-slate-200 text-slate-600 hover:bg-white/90 shadow-sm"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-800">
                {showBalance ? `$${formatNumber(balance)}` : '••••••'}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-600">{t('portfolio_wallet.balance_summary.available_for_investment')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Invested Card - Enhanced */}
        <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-700 uppercase tracking-wider">{t('portfolio_wallet.balance_summary.total_invested')}</p>
                  <p className="text-xs text-emerald-600">{t('portfolio_wallet.balance_summary.active_investments')}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-emerald-800">
                {showBalance ? `$${formatNumber(totalInvested)}` : '••••••'}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-emerald-700">{t('portfolio_wallet.balance_summary.currently_deployed')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actual Returns Card - Fixed Calculation */}
        <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-700 uppercase tracking-wider">{t('portfolio_wallet.balance_summary.total_returns')}</p>
                  <p className="text-xs text-amber-600">{t('portfolio_wallet.balance_summary.profits_earned')}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-amber-800">
                {showBalance ? `$${formatNumber(actualReturns)}` : '••••••'}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-amber-700">{t('portfolio_wallet.balance_summary.distributed_profits')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview Card */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{t('portfolio_wallet.portfolio_performance.title')}</h3>
              <p className="text-slate-600">{t('portfolio_wallet.portfolio_performance.subtitle')}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-2xl font-bold text-slate-800">${formatNumber(transactionSummary.totalDeposits + actualReturns)}</p>
              <p className="text-sm text-slate-600">{t('portfolio_wallet.portfolio_performance.total_value')}</p>
              <p className="text-xs text-slate-500">{t('portfolio_wallet.portfolio_performance.total_value_desc')}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-2xl font-bold text-emerald-600">${formatNumber(totalInvested)}</p>
              <p className="text-sm text-slate-600">{t('portfolio_wallet.portfolio_performance.active_investments_value')}</p>
              <p className="text-xs text-slate-500">{t('portfolio_wallet.portfolio_performance.active_investments_desc')}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-2xl font-bold text-amber-600">
                {transactionSummary.totalDeposits > 0 ? `${((actualReturns / transactionSummary.totalDeposits) * 100).toFixed(1)}%` : '0.0%'}
              </p>
              <p className="text-sm text-slate-600">{t('portfolio_wallet.portfolio_performance.return_rate')}</p>
              <p className="text-xs text-slate-500">{t('portfolio_wallet.portfolio_performance.return_rate_desc')}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-2xl font-bold text-blue-600">${formatNumber(profitsSummary.unrealizedGains)}</p>
              <p className="text-sm text-slate-600">{t('portfolio_wallet.portfolio_performance.unrealized_gains')}</p>
              <p className="text-xs text-slate-500">{t('portfolio_wallet.portfolio_performance.unrealized_gains_desc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  {tab === 'overview' && t('portfolio_wallet.tabs.overview')}
                  {tab === 'deposit' && t('portfolio_wallet.tabs.deposit')}
                  {tab === 'withdraw' && t('portfolio_wallet.tabs.withdraw')}
                  {tab === 'history' && t('portfolio_wallet.tabs.transaction_history')}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('portfolio_wallet.wallet_overview.title')}</h3>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setActiveTab('deposit')}
                  className="w-full h-16 flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
                >
                  <Plus className="w-5 h-5" />
                  <div className="text-center">
                    <p className="font-medium">{t('portfolio_wallet.wallet_overview.deposit_title')}</p>
                    <p className="text-xs opacity-80">{t('portfolio_wallet.wallet_overview.deposit_subtitle')}</p>
                  </div>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('withdraw')}
                  className="w-full h-16 flex items-center justify-center gap-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Minus className="w-5 h-5" />
                  <div className="text-center">
                    <p className="font-medium">{t('portfolio_wallet.wallet_overview.withdraw_title')}</p>
                    <p className="text-xs opacity-80">{t('portfolio_wallet.wallet_overview.withdraw_subtitle')}</p>
                  </div>
                </Button>
              </div>

              {/* Recent Transactions Preview */}
              {transactions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">{t('portfolio_wallet.transactions.recent_transactions')}</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('history')}
                    >
                      {t('portfolio_wallet.transactions.view_all')}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            ['deposit', 'return'].includes(transaction.type) ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {['deposit', 'return'].includes(transaction.type) ? '+' : '-'}
                            {formatNumber(transaction.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'deposit' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('portfolio_wallet.actions.deposit_funds')}</h3>
              
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.amount')}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              {depositAmount && parseFloat(depositAmount) > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('common.payment_method')}
                  </label>
                  <div className="space-y-3">
                    <div 
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePaymentMethodSelect('cash')}
                    >
                      <WalletIcon className="w-5 h-5 text-gray-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{t('wallet.payment_methods.cash_office')}</p>
                        <p className="text-sm text-gray-500">{t('wallet.payment_methods.instant_no_fees')}</p>
                      </div>
                      {paymentMethod === 'cash' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    </div>

                    <div 
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePaymentMethodSelect('card')}
                    >
                      <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{t('wallet.payment_methods.credit_card')}</p>
                        <p className="text-sm text-gray-500">{t('wallet.payment_methods.instant_fee')}</p>
                      </div>
                      {paymentMethod === 'card' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    </div>

                    <div 
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePaymentMethodSelect('bank')}
                    >
                      <Landmark className="w-5 h-5 text-gray-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{t('wallet.payment_methods.bank_transfer')}</p>
                        <p className="text-sm text-gray-500">{t('wallet.payment_methods.bank_transfer_time')}</p>
                      </div>
                      {paymentMethod === 'bank' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    </div>
                  </div>
                </div>
              )}

              {/* Card Payment Form */}
              {(showPaymentForm && paymentMethod === 'card') && (
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">{t('wallet.security.secure_payment')}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('wallet.card_details.card_number')}
                      </label>
                      <Input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: formatCardNumber(e.target.value)})}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('wallet.card_details.cardholder_name')}
                      </label>
                      <Input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value.toUpperCase()})}
                        placeholder="AHMED AL-RASHID"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('wallet.card_details.expiry_date')}
                        </label>
                        <Input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: formatExpiry(e.target.value)})}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <Input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">{t('wallet.security.info_protected')}</p>
                        <p>{t('wallet.security.encryption_notice')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleCardPayment} 
                      disabled={isProcessing || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
                    >
                      {isProcessing ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.processing')}
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay ${formatNumber(parseFloat(depositAmount))}
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowPaymentForm(false)
                        setPaymentMethod('')
                        setCardDetails({ number: '', expiry: '', cvv: '', name: '' })
                      }}
                      disabled={isProcessing}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!showPaymentForm && (
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab('overview')
                      setPaymentMethod('')
                      setDepositAmount('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('portfolio_wallet.actions.withdraw_funds')}</h3>
              
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.amount')}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    max={balance}
                    step="0.01"
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    {t('wallet.withdraw.maximum')}: {showBalance ? `$${formatNumber(balance)}` : '••••••'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWithdrawAmount(balance.toString())}
                    disabled={balance <= 0}
                  >
                    {t('wallet.withdraw.max')}
                  </Button>
                </div>
              </div>

              {/* Withdrawal Method */}
              {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('wallet.withdraw.withdrawal_method')}
                  </label>
                  <div className="space-y-3">
                    <div 
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        withdrawMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setWithdrawMethod('cash')}
                    >
                      <WalletIcon className="w-5 h-5 text-gray-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{t('wallet.withdraw.cash_office')}</p>
                        <p className="text-sm text-gray-500">{t('wallet.payment_methods.instant_no_fees')}</p>
                      </div>
                      {withdrawMethod === 'cash' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    </div>

                    <div 
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        withdrawMethod === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setWithdrawMethod('bank')}
                    >
                      <Landmark className="w-5 h-5 text-gray-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{t('wallet.payment_methods.bank_transfer')}</p>
                        <p className="text-sm text-gray-500">{t('wallet.payment_methods.bank_transfer_time')}</p>
                      </div>
                      {withdrawMethod === 'bank' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Notice */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900 mb-1">{t('wallet.withdraw.notice_title')}</h4>
                    <p className="text-sm text-orange-800">
                      {t('wallet.withdraw.notice_text')}
                      {withdrawMethod === 'bank' && ` ${t('wallet.withdraw.bank_notice')}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleWithdraw} 
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance || !withdrawMethod || isProcessing}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4 mr-2" />
                      Request Withdrawal ${withdrawAmount && formatNumber(parseFloat(withdrawAmount))}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setActiveTab('overview')
                    setWithdrawAmount('')
                    setWithdrawMethod('cash')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('portfolio_wallet.tabs.transaction_history')}</h3>
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
                            <p className="text-xs text-gray-400">Ref: {transaction.reference}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-medium ${
                          ['deposit', 'return'].includes(transaction.type) ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {['deposit', 'return'].includes(transaction.type) ? '+' : '-'}
                          ${formatNumber(transaction.amount)}
                        </p>
                        <span className={getStatusBadge(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {t('portfolio_wallet.transactions.no_transactions')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success/Status Modal */}
      <SuccessModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        amount={modalState.amount}
        method={modalState.method as 'cash' | 'card' | 'bank'}
        reference={modalState.reference}
      />

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('wallet.deposit.confirm_title')}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {t('wallet.deposit.confirm_deposit')
                  .replace('{{amount}}', formatNumber(confirmationModal.amount))
                  .replace('{{method}}', confirmationModal.method === 'cash' ? t('wallet.payment_methods.cash') : t('wallet.payment_methods.bank_transfer'))
                }
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{t('common.amount')}</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${formatNumber(confirmationModal.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('common.payment_method')}</span>
                  <div className="flex items-center gap-2">
                    {confirmationModal.method === 'cash' ? (
                      <WalletIcon className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Landmark className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {confirmationModal.method === 'cash' ? t('wallet.payment_methods.cash') : t('wallet.payment_methods.bank_transfer')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={confirmationModal.onCancel}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={confirmationModal.onConfirm}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.processing')}
                    </>
                  ) : (
                    t('wallet.deposit.confirm_button')
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 