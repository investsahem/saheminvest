'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import InvestorLayout from '../../components/layout/InvestorLayout'
import { Wallet } from '../../components/dashboard/Wallet'
import { useTranslation } from '../../components/providers/I18nProvider'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'fee'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  reference?: string
  method?: string
  projectTitle?: string
  projectCategory?: string
}

const WalletPage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalInvested: 0,
    totalReturns: 0,
    activeInvestmentValue: 0,
    profitsSummary: {
      distributedProfits: 0,
      partialCapitalReturned: 0,
      unrealizedGains: 0
    },
    transactionSummary: {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalInvestments: 0,
      actualTotalInvested: 0,
      totalReturns: 0,
      calculatedBalance: 0
    },
    distributions: {
      partial: [] as any[],
      final: [] as any[]
    }
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch wallet data and transactions
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!session?.user) return

      try {
        // Fetch wallet balance
        const balanceResponse = await fetch('/api/wallet/balance')
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json()
          setWalletData(balanceData)
        }

        // Fetch transactions
        const transactionsResponse = await fetch('/api/wallet/transactions?limit=20')
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json()
          setTransactions(transactionsData.transactions)
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [session, refreshTrigger])

  // Function to refresh data after transactions
  const refreshWalletData = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Handle deposit
  const handleDeposit = async (amount: number, method: string, cardDetails?: any) => {
    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          method,
          cardDetails
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Refresh wallet data
        refreshWalletData()
        return {
          success: true,
          message: result.transaction.message,
          transaction: result.transaction
        }
      } else {
        return { success: false, message: result.error }
      }
    } catch (error) {
      console.error('Error processing deposit:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  // Handle withdrawal
  const handleWithdraw = async (amount: number, method: string) => {
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          method
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Refresh wallet data
        refreshWalletData()
        return {
          success: true,
          message: result.transaction.message,
          transaction: result.transaction
        }
      } else {
        return { success: false, message: result.error }
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  if (loading) {
    return (
      <InvestorLayout title={t('portfolio_wallet.title')} subtitle={t('portfolio_wallet.subtitle')}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  return (
    <InvestorLayout
      title={t('portfolio_wallet.title')}
      subtitle={t('portfolio_wallet.subtitle')}
    >
      <Wallet
        balance={walletData.balance}
        totalInvested={walletData.totalInvested}
        totalReturns={walletData.totalReturns}
        activeInvestmentValue={walletData.activeInvestmentValue}
        profitsSummary={walletData.profitsSummary}
        transactionSummary={walletData.transactionSummary}
        distributions={walletData.distributions}
        transactions={transactions}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
      />
    </InvestorLayout>
  )
}

export default WalletPage

