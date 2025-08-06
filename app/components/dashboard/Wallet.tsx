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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank' | ''>('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  
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

  const handlePaymentMethodSelect = (method: 'cash' | 'card' | 'bank') => {
    setPaymentMethod(method)
    
    if (method === 'card') {
      setShowPaymentForm(true)
    } else {
      setShowPaymentForm(false)
      // For cash and bank, process immediately with confirmation
      if (confirm(`Are you sure you want to deposit $${formatNumber(parseFloat(depositAmount))} via ${method === 'cash' ? 'cash' : 'bank transfer'}?`)) {
        const amount = parseFloat(depositAmount)
        if (amount > 0 && onDeposit) {
          onDeposit(amount)
          setDepositAmount('')
          setPaymentMethod('')
          setActiveTab('overview')
          alert(`Deposit request successful! Amount: $${formatNumber(amount)} via ${method === 'cash' ? 'cash' : 'bank transfer'}`)
        }
      } else {
        // Reset payment method if user cancels
        setPaymentMethod('')
      }
    }
  }

  const handleCardPayment = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      alert('Please fill in all card details')
      return
    }

    setIsProcessing(true)
    
    // Mock payment processing
    setTimeout(() => {
      const amount = parseFloat(depositAmount)
      if (amount > 0 && onDeposit) {
        onDeposit(amount)
        setDepositAmount('')
        setPaymentMethod('')
        setShowPaymentForm(false)
        setCardDetails({ number: '', expiry: '', cvv: '', name: '' })
        setActiveTab('overview')
        alert('Payment successful!')
      }
      setIsProcessing(false)
    }, 2000)
  }

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount)
    if (amount > 0 && onDeposit) {
      onDeposit(amount)
      setDepositAmount('')
      setPaymentMethod('')
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

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Current Balance</p>
                <p className="text-2xl font-bold text-blue-900">
                  {showBalance ? `$${formatNumber(balance)}` : '••••••'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="bg-white/50 border-blue-200 text-blue-700 hover:bg-white/80"
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <WalletIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Invested</p>
                <p className="text-2xl font-bold text-green-900">
                  {showBalance ? `$${formatNumber(totalInvested)}` : '••••••'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Returns</p>
                <p className="text-2xl font-bold text-purple-900">
                  {showBalance ? `$${formatNumber(totalReturns)}` : '••••••'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
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
                  {tab === 'overview' && 'Overview'}
                  {tab === 'deposit' && 'Deposit'}
                  {tab === 'withdraw' && 'Withdraw'}
                  {tab === 'history' && 'Transaction History'}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Wallet Overview</h3>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setActiveTab('deposit')}
                  className="w-full h-16 flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
                >
                  <Plus className="w-5 h-5" />
                  <div className="text-center">
                    <p className="font-medium">Deposit</p>
                    <p className="text-xs opacity-80">Add funds to wallet</p>
                  </div>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('withdraw')}
                  className="w-full h-16 flex items-center justify-center gap-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Minus className="w-5 h-5" />
                  <div className="text-center">
                    <p className="font-medium">Withdraw</p>
                    <p className="text-xs opacity-80">Withdraw from wallet</p>
                  </div>
                </Button>
              </div>

              {/* Recent Transactions Preview */}
              {transactions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Recent Transactions</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('history')}
                    >
                      View All
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
              <h3 className="text-lg font-semibold text-gray-900">Deposit Funds</h3>
              
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
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
                    Payment Method
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
                        <p className="font-medium text-gray-900">Cash at Office</p>
                        <p className="text-sm text-gray-500">Instant - No fees</p>
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
                        <p className="font-medium text-gray-900">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">Instant - 2.5% fee</p>
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
                        <p className="font-medium text-gray-900">Bank Transfer</p>
                        <p className="text-sm text-gray-500">1-3 business days - No fees</p>
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
                    <span className="text-sm font-medium text-green-800">Secure & Encrypted Payment</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
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
                        Cardholder Name
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
                          Expiry Date
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
                        <p className="font-medium">Information Protected</p>
                        <p>All card data is encrypted and secure. We don't store card information.</p>
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
                          Processing...
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
                      Cancel
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
              <h3 className="text-lg font-semibold text-gray-900">Withdraw Funds</h3>
              
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
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
                    Maximum: {showBalance ? `$${formatNumber(balance)}` : '••••••'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWithdrawAmount(balance.toString())}
                    disabled={balance <= 0}
                  >
                    Max
                  </Button>
                </div>
              </div>

              {/* Withdrawal Method */}
              {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Withdrawal Method
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
                        <p className="font-medium text-gray-900">Cash from Office</p>
                        <p className="text-sm text-gray-500">Instant - No fees</p>
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
                        <p className="font-medium text-gray-900">Bank Transfer</p>
                        <p className="text-sm text-gray-500">1-3 business days - No fees</p>
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
                    <h4 className="font-medium text-orange-900 mb-1">Important Notice</h4>
                    <p className="text-sm text-orange-800">
                      Withdrawals require administrative approval and may take 1-3 business days to process.
                      {withdrawMethod === 'bank' && ' Bank transfers may take additional time depending on your bank.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleWithdraw} 
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance || !withdrawMethod}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Request Withdrawal ${withdrawAmount && formatNumber(parseFloat(withdrawAmount))}
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
              <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
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
                  No transactions yet
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 