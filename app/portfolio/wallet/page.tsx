'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import InvestorLayout from '../../components/layout/InvestorLayout'
import { Wallet } from '../../components/dashboard/Wallet'
import { useTranslation } from '../../components/providers/I18nProvider'

const WalletPage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalInvested: 0,
    totalReturns: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!session?.user) return
      
      try {
        const response = await fetch('/api/wallet/balance')
        if (response.ok) {
          const data = await response.json()
          setWalletData(data)
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [session])

  // Sample transactions - in real app, fetch from API
  // These transactions should total: +20500 deposits, -8000 investments, +1200 returns = 13700
  // But current balance is 12500, so there might be some fees or other transactions
  const transactions = [
    {
      id: '1',
      type: 'deposit' as const,
      amount: 15000.00,
      createdAt: '2024-01-15T10:30:00Z',
      status: 'completed' as const,
      reference: 'DEP-2024-001',
      description: 'Initial account funding - Bank Transfer'
    },
    {
      id: '2',
      type: 'deposit' as const,
      amount: 5500.00,
      createdAt: '2024-01-20T14:20:00Z',
      status: 'completed' as const,
      reference: 'DEP-2024-002',
      description: 'Additional funding - Credit Card'
    },
    {
      id: '3',
      type: 'investment' as const,
      amount: 5000.00,
      createdAt: '2024-01-19T14:15:00Z',
      status: 'completed' as const,
      reference: 'INV-2024-001',
      description: 'Investment in Electronics Manufacturing Project'
    },
    {
      id: '4',
      type: 'investment' as const,
      amount: 3000.00,
      createdAt: '2024-01-17T16:20:00Z',
      status: 'completed' as const,
      reference: 'INV-2024-002',
      description: 'Investment in Luxury Real Estate Development'
    },
    {
      id: '5',
      type: 'return' as const,
      amount: 750.00,
      createdAt: '2024-01-18T09:45:00Z',
      status: 'completed' as const,
      reference: 'RET-2024-001',
      description: 'Q4 2023 Return - Real Estate Project'
    },
    {
      id: '6',
      type: 'return' as const,
      amount: 450.00,
      createdAt: '2024-01-16T11:10:00Z',
      status: 'completed' as const,
      reference: 'RET-2024-002',
      description: 'Monthly Return - Tech Portfolio'
    },
    {
      id: '7',
      type: 'fee' as const,
      amount: 200.00,
      createdAt: '2024-01-21T08:00:00Z',
      status: 'completed' as const,
      reference: 'FEE-2024-001',
      description: 'Platform management fee'
    }
  ]

  if (loading) {
    return (
      <InvestorLayout title="Digital Wallet" subtitle="Manage your funds and transactions">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  return (
    <InvestorLayout
      title="Digital Wallet"
      subtitle="Manage your funds and transactions"
    >
      <Wallet
        balance={walletData.balance}
        totalInvested={walletData.totalInvested}
        totalReturns={walletData.totalReturns}
        transactions={transactions}
        onDeposit={(amount) => {
          // Handle deposit - refresh wallet data
          setWalletData(prev => ({
            ...prev,
            balance: prev.balance + amount
          }))
        }}
        onWithdraw={(amount) => {
          // Handle withdraw - refresh wallet data
          setWalletData(prev => ({
            ...prev,
            balance: prev.balance - amount
          }))
        }}
      />
    </InvestorLayout>
  )
}

export default WalletPage
