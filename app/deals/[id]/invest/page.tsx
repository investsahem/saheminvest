'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import InvestorLayout from '../../../components/layout/InvestorLayout'
import { useTranslation } from '../../../components/providers/I18nProvider'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Users, 
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  Wallet
} from 'lucide-react'

interface Deal {
  id: string
  title: string
  description: string
  category: string
  thumbnailImage?: string
  fundingGoal: number
  currentFunding: number
  expectedReturn: number
  minInvestment: number
  duration: number
  endDate: string
  status: string
  partnerName?: string
  _count?: {
    investments: number
  }
}

interface User {
  id: string
  name: string
  email: string
  walletBalance: number
}

export default function InvestPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const dealId = params.id as string

  const [deal, setDeal] = useState<Deal | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [investing, setInvesting] = useState(false)
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch deal details
  useEffect(() => {
    if (!dealId) return

    const fetchDeal = async () => {
      try {
        const response = await fetch(`/api/deals/${dealId}`)
        if (response.ok) {
          const dealData = await response.json()
          setDeal(dealData)
        } else {
          setError('Deal not found')
        }
      } catch (error) {
        console.error('Error fetching deal:', error)
        setError('Failed to load deal details')
      }
    }

    fetchDeal()
  }, [dealId])

  // Fetch user wallet balance
  useEffect(() => {
    if (!session?.user?.id) return

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/wallet/balance`)
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [session])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateExpectedProfit = () => {
    const amount = parseFloat(investmentAmount)
    if (!amount || !deal) return 0
    return (amount * deal.expectedReturn) / 100
  }

  const calculateTimeLeft = () => {
    if (!deal?.endDate) return { days: 0, hours: 0 }
    
    const now = new Date()
    const end = new Date(deal.endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return { days: 0, hours: 0 }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    return { days, hours }
  }

  const handleInvestment = async () => {
    if (!investmentAmount || !deal || !user) return

    const amount = parseFloat(investmentAmount)
    
    // Validation
    if (amount < deal.minInvestment) {
      setError(`Minimum investment is ${formatCurrency(deal.minInvestment)}`)
      return
    }

    if (amount > user.walletBalance) {
      setError(`Insufficient balance. Your balance: ${formatCurrency(user.walletBalance)}`)
      return
    }

    setInvesting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/deals/${dealId}/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(`Investment successful! You invested ${formatCurrency(amount)} in ${deal.title}`)
        
        // Update user balance
        setUser(prev => prev ? {
          ...prev,
          walletBalance: prev.walletBalance - amount
        } : null)

        // Update deal funding
        setDeal(prev => prev ? {
          ...prev,
          currentFunding: prev.currentFunding + amount
        } : null)

        // Clear the form
        setInvestmentAmount('')
        
        // Redirect after success
        setTimeout(() => {
          router.push('/portfolio/investments')
        }, 2000)
      } else {
        setError(result.error || 'Investment failed')
      }
    } catch (error) {
      console.error('Error making investment:', error)
      setError('Network error. Please try again.')
    } finally {
      setInvesting(false)
    }
  }

  if (loading) {
    return (
      <InvestorLayout title="Loading..." subtitle="">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  if (!deal) {
    return (
      <InvestorLayout title="Deal Not Found" subtitle="">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Deal Not Found</h2>
            <p className="text-gray-600 mb-4">The investment opportunity you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/deals')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
          </CardContent>
        </Card>
      </InvestorLayout>
    )
  }

  const fundingProgress = (deal.currentFunding / deal.fundingGoal) * 100
  const timeLeft = calculateTimeLeft()
  const expectedProfit = calculateExpectedProfit()

  return (
    <InvestorLayout 
      title={`Invest in ${deal.title}`}
      subtitle="Review deal details and make your investment"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          onClick={() => router.back()} 
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Deals
        </Button>

        {/* Success Message */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800">{success}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deal Details */}
          <div className="space-y-6">
            {/* Deal Image & Basic Info */}
            <Card>
              <CardContent className="p-0">
                {deal.thumbnailImage && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={deal.thumbnailImage}
                      alt={deal.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {deal.category}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{deal.title}</h1>
                  <p className="text-gray-600 mb-4">{deal.description}</p>
                  
                  {deal.partnerName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">{deal.partnerName}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Deal Metrics */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Funding Goal</p>
                      <p className="font-semibold">{formatCurrency(deal.fundingGoal)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Current Funding</p>
                      <p className="font-semibold">{formatCurrency(deal.currentFunding)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Expected Return</p>
                      <p className="font-semibold">{deal.expectedReturn}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{deal.duration} months</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-indigo-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Investors</p>
                      <p className="font-semibold">{deal._count?.investments || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Time Left</p>
                      <p className="font-semibold">{timeLeft.days}d {timeLeft.hours}h</p>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Funding Progress</span>
                    <span>{Math.round(fundingProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Form */}
          <div className="space-y-6">
            {/* Wallet Balance */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Wallet className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Your Wallet</h3>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    {user ? formatCurrency(user.walletBalance) : '$0'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Investment Form */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Make Investment</h3>
                
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <p className="text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Investment Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Amount
                    </label>
                    <Input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder={`Minimum ${formatCurrency(deal.minInvestment)}`}
                      min={deal.minInvestment}
                      max={user?.walletBalance || 0}
                      className="text-lg"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Minimum investment: {formatCurrency(deal.minInvestment)}
                    </p>
                  </div>

                  {/* Expected Profit */}
                  {investmentAmount && expectedProfit > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Expected Profit</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {formatCurrency(expectedProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Total Return</span>
                        <span className="text-lg font-semibold text-green-600">
                          {formatCurrency(parseFloat(investmentAmount) + expectedProfit)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Investment Button */}
                  <Button
                    onClick={handleInvestment}
                    disabled={!investmentAmount || investing || parseFloat(investmentAmount) < deal.minInvestment}
                    className="w-full"
                    size="lg"
                  >
                    {investing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Investment...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5 mr-2" />
                        Invest {investmentAmount ? formatCurrency(parseFloat(investmentAmount)) : 'Now'}
                      </>
                    )}
                  </Button>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[deal.minInvestment, deal.minInvestment * 2, deal.minInvestment * 5].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setInvestmentAmount(amount.toString())}
                        disabled={!user || amount > user.walletBalance}
                      >
                        {formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Terms */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Terms</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Minimum Investment:</span>
                    <span className="font-medium">{formatCurrency(deal.minInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Return:</span>
                    <span className="font-medium">{deal.expectedReturn}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investment Duration:</span>
                    <span className="font-medium">{deal.duration} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deal Status:</span>
                    <span className="font-medium text-green-600">{deal.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </InvestorLayout>
  )
}


