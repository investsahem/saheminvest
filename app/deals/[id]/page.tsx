'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import InvestorLayout from '../../components/layout/InvestorLayout'
import AdminLayout from '../../components/layout/AdminLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  ArrowLeft, MapPin, Calendar, DollarSign, TrendingUp,
  Users, Clock, Shield, Star, AlertCircle, CheckCircle,
  Edit, Trash2, Pause, Play, Eye, Share2, Heart
} from 'lucide-react'

interface DealDetails {
  id: string
  title: string
  description: string
  category: string
  location?: string
  fundingGoal: number
  currentFunding: number
  minInvestment: number
  expectedReturn: number
  duration: number
  riskLevel?: string
  status: string
  startDate?: string
  endDate?: string
  publishedAt?: string
  thumbnailImage?: string
  images: string[]
  highlights: string[]
  tags: string[]
  featured: boolean
  owner: {
    id: string
    name: string
    email: string
    image?: string
  }
  partner?: {
    id: string
    companyName: string
    logo?: string
    description?: string
  }
  investments: Array<{
    id: string
    amount: number
    investor: {
      id: string
      name: string
      image?: string
    }
  }>
  _count: {
    investments: number
  }
  createdAt: string
  updatedAt: string
}

const DealDetailsPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const dealId = params.id as string

  const [deal, setDeal] = useState<DealDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [showInvestForm, setShowInvestForm] = useState(false)
  const [investing, setInvesting] = useState(false)

  const isAdmin = session?.user?.role === 'ADMIN'
  const isDealManager = session?.user?.role === 'DEAL_MANAGER'
  const canManageDeal = isAdmin || isDealManager || (deal && deal.owner.id === session?.user?.id)

  // Fetch deal details
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await fetch(`/api/deals/${dealId}`)
        if (response.ok) {
          const data = await response.json()
          setDeal(data)
        } else {
          router.push('/deals')
        }
      } catch (error) {
        console.error('Error fetching deal:', error)
        router.push('/deals')
      } finally {
        setLoading(false)
      }
    }

    if (dealId) {
      fetchDeal()
    }
  }, [dealId, router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'LOW':
        return 'text-green-600 bg-green-100'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100'
      case 'HIGH':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleInvestment = async () => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    const amount = parseFloat(investmentAmount)
    if (amount < (deal?.minInvestment || 0)) {
      alert(`Minimum investment amount is ${formatCurrency(deal?.minInvestment || 0)}`)
      return
    }

    setInvesting(true)
    try {
      // This would integrate with your investment API
      const response = await fetch(`/api/deals/${dealId}/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      })

      if (response.ok) {
        alert('Investment successful!')
        setShowInvestForm(false)
        setInvestmentAmount('')
        // Refresh deal data
        window.location.reload()
      } else {
        alert('Investment failed. Please try again.')
      }
    } catch (error) {
      console.error('Investment error:', error)
      alert('Investment failed. Please try again.')
    } finally {
      setInvesting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Deal not found</h2>
          <p className="text-gray-600 mb-4">The deal you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/deals')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deals
          </Button>
        </div>
      </div>
    )
  }

  const fundingPercentage = (deal.currentFunding / deal.fundingGoal) * 100
  const daysLeft = deal.endDate ? Math.max(0, Math.ceil((new Date(deal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null

  const pageContent = (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/deals')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deals
        </Button>

        <div className="flex items-center gap-2">
          {canManageDeal && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/deals?edit=${deal.id}`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              
              {deal.status === 'ACTIVE' && (
                <Button variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
            </>
          )}
          
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Deal Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          {deal.thumbnailImage && (
            <div className="relative">
              <img
                key={`${deal.id}-${deal.thumbnailImage}`}
                src={deal.thumbnailImage}
                alt={deal.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', deal.thumbnailImage)
                  e.currentTarget.style.display = 'none'
                }}
              />
              {deal.featured && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 inline mr-1" />
                  Featured
                </div>
              )}
            </div>
          )}

          {/* Deal Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{deal.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {deal.location || 'Location not specified'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(deal.createdAt)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(deal.riskLevel)}`}>
                      {deal.riskLevel || 'MEDIUM'} Risk
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{deal.description}</p>
              </div>

              {/* Highlights */}
              {deal.highlights.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Highlights</h3>
                  <ul className="space-y-2">
                    {deal.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {deal.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {deal.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partner Info */}
          {deal.partner && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Partner</h3>
                <div className="flex items-start gap-4">
                  {deal.partner.logo && (
                    <img
                      src={deal.partner.logo}
                      alt={deal.partner.companyName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{deal.partner.companyName}</h4>
                    {deal.partner.description && (
                      <p className="text-gray-700 mt-2">{deal.partner.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Investors */}
          {deal.investments.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Investors</h3>
                <div className="space-y-3">
                  {deal.investments.slice(0, 5).map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {investment.investor.image ? (
                          <img
                            src={investment.investor.image}
                            alt={investment.investor.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{investment.investor.name}</span>
                      </div>
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(investment.amount)}
                      </span>
                    </div>
                  ))}
                  {deal.investments.length > 5 && (
                    <p className="text-sm text-gray-600 text-center mt-3">
                      +{deal.investments.length - 5} more investors
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Investment Panel */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatCurrency(deal.currentFunding)}
                </div>
                <div className="text-sm text-gray-600">
                  of {formatCurrency(deal.fundingGoal)} goal
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{Math.round(fundingPercentage)}%</div>
                  <div className="text-sm text-gray-600">Funded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{deal._count.investments}</div>
                  <div className="text-sm text-gray-600">Investors</div>
                </div>
              </div>

              {daysLeft !== null && (
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-gray-900">{daysLeft}</div>
                  <div className="text-sm text-gray-600">Days left</div>
                </div>
              )}

              {/* Investment Details */}
              <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expected Return</span>
                  <span className="font-semibold text-green-600">{deal.expectedReturn}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{deal.duration} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Minimum Investment</span>
                  <span className="font-semibold">{formatCurrency(deal.minInvestment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Level</span>
                  <span className={`font-semibold ${deal.riskLevel === 'LOW' ? 'text-green-600' : deal.riskLevel === 'HIGH' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {deal.riskLevel || 'MEDIUM'}
                  </span>
                </div>
              </div>

              {/* Investment Form */}
              {(deal.status === 'ACTIVE' || deal.status === 'PUBLISHED') && session?.user && (
                <div className="space-y-4">
                  {!showInvestForm ? (
                    <Button
                      onClick={() => setShowInvestForm(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Invest Now
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Investment Amount
                        </label>
                        <input
                          type="number"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          min={deal.minInvestment}
                          placeholder={`Min: ${formatCurrency(deal.minInvestment)}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleInvestment}
                          disabled={investing || !investmentAmount}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {investing ? 'Processing...' : 'Confirm Investment'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowInvestForm(false)
                            setInvestmentAmount('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!session?.user && (
                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign In to Invest
                </Button>
              )}

              {!['ACTIVE', 'PUBLISHED'].includes(deal.status) && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-yellow-800">
                    This deal is currently {deal.status.toLowerCase()} and not accepting investments.
                  </p>
                </div>
              )}

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Investment</p>
                    <p>All investments are protected by our investor protection program.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // Render with appropriate layout
  if (isAdmin) {
    return (
      <AdminLayout title={deal.title}>
        {pageContent}
      </AdminLayout>
    )
  } else {
    return (
      <InvestorLayout title={deal.title}>
        {pageContent}
      </InvestorLayout>
    )
  }
}

export default DealDetailsPage
