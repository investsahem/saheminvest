'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface AdminTransactionsStats {
    pendingDepositsCount: number
    pendingWithdrawalsCount: number
    pendingTotalCount: number
    isLoading: boolean
    error: string | null
}

export const useAdminTransactions = () => {
    const { data: session } = useSession()
    const [stats, setStats] = useState<AdminTransactionsStats>({
        pendingDepositsCount: 0,
        pendingWithdrawalsCount: 0,
        pendingTotalCount: 0,
        isLoading: true,
        error: null
    })

    const fetchTransactionsStats = async () => {
        if (!session?.user || session.user.role !== 'ADMIN') {
            setStats(prev => ({ ...prev, isLoading: false }))
            return
        }

        try {
            setStats(prev => ({ ...prev, isLoading: true, error: null }))

            const response = await fetch('/api/admin/transactions/pending-count')

            if (response.ok) {
                const data = await response.json()
                setStats({
                    pendingDepositsCount: data.pendingDeposits || 0,
                    pendingWithdrawalsCount: data.pendingWithdrawals || 0,
                    pendingTotalCount: (data.pendingDeposits || 0) + (data.pendingWithdrawals || 0),
                    isLoading: false,
                    error: null
                })
            } else {
                setStats(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Failed to fetch transactions data'
                }))
            }
        } catch (error) {
            console.error('Error fetching transactions stats:', error)
            setStats(prev => ({
                ...prev,
                isLoading: false,
                error: 'Network error'
            }))
        }
    }

    useEffect(() => {
        fetchTransactionsStats()

        // Refresh every 30 seconds
        const interval = setInterval(fetchTransactionsStats, 30000)

        return () => clearInterval(interval)
    }, [session])

    return {
        ...stats,
        refetch: fetchTransactionsStats
    }
}
