import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UserData {
  walletBalance: number
  portfolioValue: number
  totalReturns: number
  dailyChange: {
    amount: number
    percentage: number
    isPositive: boolean
  }
  activeInvestments: number
  isLoading: boolean
}

export function useUserData(): UserData {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserData>({
    walletBalance: 0,
    portfolioValue: 0,
    totalReturns: 0,
    dailyChange: {
      amount: 0,
      percentage: 0,
      isPositive: true
    },
    activeInvestments: 0,
    isLoading: true
  })

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user) {
        setUserData(prev => ({ ...prev, isLoading: false }))
        return
      }

      try {
        // Fetch wallet balance
        const walletResponse = await fetch('/api/wallet/balance')
        const walletData = walletResponse.ok ? await walletResponse.json() : null

        // Fetch portfolio overview
        const portfolioResponse = await fetch('/api/portfolio/overview')
        const portfolioData = portfolioResponse.ok ? await portfolioResponse.json() : null

        setUserData({
          walletBalance: walletData?.balance || 0,
          portfolioValue: walletData?.balance || 0,  // Portfolio value = wallet (capital + profits)
          totalReturns: portfolioData?.portfolio?.totalReturns || 0,
          dailyChange: portfolioData?.dailyChange || {
            amount: 0,
            percentage: 0,
            isPositive: true
          },
          activeInvestments: portfolioData?.portfolio?.activeInvestments || 0,
          isLoading: false
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUserData(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchUserData()
  }, [session])

  return userData
}


