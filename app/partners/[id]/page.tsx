'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  Building2, Globe, Phone, Mail, MapPin, Calendar, 
  Users, Briefcase, Award, Star, TrendingUp, Target,
  ExternalLink, MessageCircle, ChevronRight, Clock,
  DollarSign, BarChart3, CheckCircle, Linkedin,
  Twitter, Facebook, Instagram, ArrowLeft
} from 'lucide-react'

interface PartnerProfile {
  id: string
  companyName: string
  displayName?: string
  tagline?: string
  description?: string
  logo?: string
  coverImage?: string
  brandColor?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  industry?: string
  foundedYear?: number
  employeeCount?: string
  businessType?: string
  yearsExperience?: number
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  investmentAreas?: string[]
  minimumDealSize?: number
  maximumDealSize?: number
  preferredDuration?: string
  isVerified: boolean
  allowInvestorContact: boolean
  showSuccessMetrics: boolean
  user: {
    id: string
    name: string
    email: string
    createdAt: string
  }
  stats: {
    totalDeals: number
    completedDeals: number
    activeDeals: number
    totalFundsRaised: number
    successRate: number
    memberSince: string
  }
  recentDeals: Array<{
    id: string
    title: string
    description: string
    fundingGoal: number
    currentFunding: number
    expectedReturn: number
    duration: number
    status: string
    imageUrl?: string
    createdAt: string
  }>
}

const PartnerProfileViewPage = () => {
  const params = useParams()
  const { data: session } = useSession()
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const partnerId = params.id as string

  useEffect(() => {
    if (partnerId) {
      fetchPartnerProfile()
    }
  }, [partnerId])

  const fetchPartnerProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/partner/profile/${partnerId}`)
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      } else if (response.status === 404) {
        setError('Partner profile not found')
      } else {
        setError('Failed to load partner profile')
      }
    } catch (error) {
      console.error('Error fetching partner profile:', error)
      setError('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

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
      month: 'long'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'FUNDED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active'
      case 'COMPLETED': return 'Completed'
      case 'FUNDED': return 'Funded'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/deals">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Deals
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/deals" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Deals
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-gray-900">Sahem Invest</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cover Image & Header */}
        <Card className="overflow-hidden mb-8">
          <div 
            className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative"
            style={{
              backgroundImage: profile.coverImage ? `url(${profile.coverImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: profile.brandColor || undefined
            }}
          >
            <div className="absolute bottom-6 left-6 flex items-end gap-6">
              <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
                {profile.logo ? (
                  <Image 
                    src={profile.logo} 
                    alt="Company Logo" 
                    width={96}
                    height={96}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="text-white mb-2">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold">{profile.displayName || profile.companyName}</h1>
                  {profile.isVerified && (
                    <div className="flex items-center gap-1 bg-white bg-opacity-20 rounded-full px-2 py-1">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>
                {profile.tagline && (
                  <p className="text-lg text-blue-100">{profile.tagline}</p>
                )}
                {profile.industry && (
                  <p className="text-sm text-blue-200">{profile.industry}</p>
                )}
              </div>
            </div>
            
            {profile.allowInvestorContact && session?.user && (
              <div className="absolute bottom-6 right-6">
                <Button className="bg-white text-gray-900 hover:bg-gray-100 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Contact Partner
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">About {profile.displayName || profile.companyName}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {profile.description || 'No description provided.'}
                </p>
                
                {/* Key Stats */}
                {profile.showSuccessMetrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{profile.stats.totalDeals}</div>
                      <div className="text-sm text-gray-600">Total Deals</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{profile.stats.completedDeals}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{formatCurrency(profile.stats.totalFundsRaised)}</div>
                      <div className="text-sm text-gray-600">Funds Raised</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{profile.stats.successRate.toFixed(0)}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Focus */}
            {profile.investmentAreas && profile.investmentAreas.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Investment Focus</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.investmentAreas.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                  
                  {(profile.minimumDealSize || profile.maximumDealSize || profile.preferredDuration) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                      {profile.minimumDealSize && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{formatCurrency(profile.minimumDealSize)}</div>
                          <div className="text-sm text-gray-600">Minimum Deal Size</div>
                        </div>
                      )}
                      {profile.maximumDealSize && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{formatCurrency(profile.maximumDealSize)}</div>
                          <div className="text-sm text-gray-600">Maximum Deal Size</div>
                        </div>
                      )}
                      {profile.preferredDuration && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{profile.preferredDuration}</div>
                          <div className="text-sm text-gray-600">Preferred Duration</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Deals */}
            {profile.recentDeals.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Recent Deals</h3>
                    <Link href={`/deals?partner=${profile.user.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.recentDeals.slice(0, 4).map((deal) => (
                      <Link key={deal.id} href={`/deals/${deal.id}`} className="block">
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            {deal.imageUrl && (
                              <Image
                                src={deal.imageUrl}
                                alt={deal.title}
                                width={60}
                                height={60}
                                className="w-15 h-15 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{deal.title}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{deal.description}</p>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-green-600">{formatCurrency(deal.fundingGoal)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(deal.status)}`}>
                                  {getStatusText(deal.status)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {deal.expectedReturn}% return
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {deal.duration} months
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {profile.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline truncate flex items-center gap-1"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {profile.email && profile.allowInvestorContact && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 truncate">{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && profile.allowInvestorContact && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">{profile.phone}</span>
                    </div>
                  )}
                  {(profile.address || profile.city || profile.country) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        {[profile.address, profile.city, profile.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Business Details</h3>
                <div className="space-y-3 text-sm">
                  {profile.foundedYear && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Founded:</span>
                      <span className="font-medium">{profile.foundedYear}</span>
                    </div>
                  )}
                  {profile.employeeCount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Team Size:</span>
                      <span className="font-medium">{profile.employeeCount}</span>
                    </div>
                  )}
                  {profile.businessType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Type:</span>
                      <span className="font-medium">{profile.businessType}</span>
                    </div>
                  )}
                  {profile.yearsExperience && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{profile.yearsExperience} years</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">{formatDate(profile.stats.memberSince)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            {(profile.linkedin || profile.twitter || profile.facebook || profile.instagram) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Social Media</h3>
                  <div className="flex gap-3">
                    {profile.linkedin && (
                      <a 
                        href={profile.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {profile.twitter && (
                      <a 
                        href={profile.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-3 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {profile.facebook && (
                      <a 
                        href={profile.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {profile.instagram && (
                      <a 
                        href={profile.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-3 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trust Indicators */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Trust & Verification</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-4 h-4 ${profile.isVerified ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${profile.isVerified ? 'text-green-600' : 'text-gray-600'}`}>
                      {profile.isVerified ? 'Verified Partner' : 'Verification Pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">
                      Member since {formatDate(profile.stats.memberSince)}
                    </span>
                  </div>
                  {profile.showSuccessMetrics && (
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600">
                        {profile.stats.successRate.toFixed(0)}% success rate
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnerProfileViewPage
