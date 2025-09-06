'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  User, Building2, Globe, Phone, Mail, MapPin, 
  Calendar, Users, Briefcase, Award, Camera, 
  Upload, Save, Eye, Settings, Trash2, Plus, X,
  Linkedin, Twitter, Facebook, Instagram
} from 'lucide-react'

interface PartnerProfile {
  id?: string
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
  registrationNumber?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  investmentAreas?: string[]
  minimumDealSize?: number
  maximumDealSize?: number
  preferredDuration?: string
  yearsExperience?: number
  isPublic?: boolean
  allowInvestorContact?: boolean
  showSuccessMetrics?: boolean
}

const PartnerProfilePage = () => {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<PartnerProfile>({
    companyName: '',
    investmentAreas: [],
    isPublic: true,
    allowInvestorContact: true,
    showSuccessMetrics: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [newInvestmentArea, setNewInvestmentArea] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/partner/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setProfile(data.profile)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'sahaminvest')
    formData.append('folder', 'partner-profiles')

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(prev => ({
          ...prev,
          [type === 'logo' ? 'logo' : 'coverImage']: data.secure_url
        }))
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image')
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file, 'logo')
    }
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file, 'cover')
    }
  }

  const addInvestmentArea = () => {
    if (newInvestmentArea.trim()) {
      setProfile(prev => ({
        ...prev,
        investmentAreas: [...(prev.investmentAreas || []), newInvestmentArea.trim()]
      }))
      setNewInvestmentArea('')
    }
  }

  const removeInvestmentArea = (index: number) => {
    setProfile(prev => ({
      ...prev,
      investmentAreas: prev.investmentAreas?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      const response = await fetch('/api/partner/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        alert('Profile saved successfully!')
        fetchProfile() // Refresh the profile data
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile')
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <PartnerLayout title="Partner Profile" subtitle="Manage your company profile">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout 
      title="Partner Profile" 
      subtitle="Create and manage your company profile for investors"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Button
              variant={previewMode ? "outline" : "default"}
              onClick={() => setPreviewMode(false)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button
              variant={previewMode ? "default" : "outline"}
              onClick={() => setPreviewMode(true)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          </div>
          
          {!previewMode && (
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          )}
        </div>

        {previewMode ? (
          /* Preview Mode */
          <div className="space-y-6">
            {/* Cover Image & Logo */}
            <Card className="overflow-hidden">
              <div 
                className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative"
                style={{
                  backgroundImage: profile.coverImage ? `url(${profile.coverImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute bottom-4 left-6 flex items-end gap-4">
                  <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
                    {profile.logo ? (
                      <img src={profile.logo} alt="Company Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="text-white mb-2">
                    <h1 className="text-2xl font-bold">{profile.companyName}</h1>
                    {profile.tagline && (
                      <p className="text-blue-100">{profile.tagline}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Company Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">About {profile.displayName || profile.companyName}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {profile.description || 'No description provided.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Investment Focus */}
                {profile.investmentAreas && profile.investmentAreas.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Investment Focus</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.investmentAreas.map((area, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {area}
                          </span>
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
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.website}
                          </a>
                        </div>
                      )}
                      {profile.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{profile.email}</span>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{profile.phone}</span>
                        </div>
                      )}
                      {(profile.address || profile.city || profile.country) && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
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
                      {profile.industry && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Industry:</span>
                          <span className="font-medium">{profile.industry}</span>
                        </div>
                      )}
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
                      {profile.yearsExperience && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience:</span>
                          <span className="font-medium">{profile.yearsExperience} years</span>
                        </div>
                      )}
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
                          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {profile.twitter && (
                          <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200">
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                        {profile.facebook && (
                          <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200">
                            <Facebook className="w-4 h-4" />
                          </a>
                        )}
                        {profile.instagram && (
                          <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200">
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <Input
                      type="text"
                      value={profile.companyName}
                      onChange={(e) => setProfile(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Your Company Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <Input
                      type="text"
                      value={profile.displayName || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Public display name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tagline
                    </label>
                    <Input
                      type="text"
                      value={profile.tagline || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="A brief tagline about your company"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={profile.description || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell investors about your company, mission, and experience..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Identity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Visual Identity</h3>
                
                {/* Logo Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {profile.logo ? (
                        <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {profile.coverImage ? (
                      <div className="relative">
                        <img src={profile.coverImage} alt="Cover" className="w-full h-32 object-cover rounded-lg" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setProfile(prev => ({ ...prev, coverImage: undefined }))}
                          className="absolute top-2 right-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 mb-2">Upload a cover image</p>
                        <input
                          type="file"
                          ref={coverInputRef}
                          onChange={handleCoverUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => coverInputRef.current?.click()}
                        >
                          Choose Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Brand Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={profile.brandColor || '#3B82F6'}
                      onChange={(e) => setProfile(prev => ({ ...prev, brandColor: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={profile.brandColor || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, brandColor: e.target.value }))}
                      placeholder="#3B82F6"
                      className="flex-1 max-w-32"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <Input
                      type="url"
                      value={profile.website || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@yourcompany.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <Input
                      type="text"
                      value={profile.country || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="United States"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Input
                      type="text"
                      value={profile.city || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      type="text"
                      value={profile.address || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Business Street"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <Input
                      type="text"
                      value={profile.industry || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="Technology, Real Estate, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Founded Year
                    </label>
                    <Input
                      type="number"
                      value={profile.foundedYear || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, foundedYear: parseInt(e.target.value) || undefined }))}
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Size
                    </label>
                    <select
                      value={profile.employeeCount || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, employeeCount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select team size</option>
                      <option value="1">Just me</option>
                      <option value="2-10">2-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <select
                      value={profile.businessType || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, businessType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select business type</option>
                      <option value="LLC">LLC</option>
                      <option value="Corporation">Corporation</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <Input
                      type="number"
                      value={profile.yearsExperience || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || undefined }))}
                      placeholder="5"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number
                    </label>
                    <Input
                      type="text"
                      value={profile.registrationNumber || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, registrationNumber: e.target.value }))}
                      placeholder="Business registration number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <Input
                      type="url"
                      value={profile.linkedin || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <Input
                      type="url"
                      value={profile.twitter || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="https://twitter.com/yourcompany"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <Input
                      type="url"
                      value={profile.facebook || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="https://facebook.com/yourcompany"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <Input
                      type="url"
                      value={profile.instagram || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="https://instagram.com/yourcompany"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Focus */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Investment Focus</h3>
                
                {/* Investment Areas */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Areas
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      value={newInvestmentArea}
                      onChange={(e) => setNewInvestmentArea(e.target.value)}
                      placeholder="Add investment area"
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInvestmentArea())}
                    />
                    <Button
                      type="button"
                      onClick={addInvestmentArea}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                  {profile.investmentAreas && profile.investmentAreas.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.investmentAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                        >
                          {area}
                          <button
                            type="button"
                            onClick={() => removeInvestmentArea(index)}
                            className="hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Deal Size Range */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Deal Size
                    </label>
                    <Input
                      type="number"
                      value={profile.minimumDealSize || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, minimumDealSize: parseFloat(e.target.value) || undefined }))}
                      placeholder="10000"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Deal Size
                    </label>
                    <Input
                      type="number"
                      value={profile.maximumDealSize || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, maximumDealSize: parseFloat(e.target.value) || undefined }))}
                      placeholder="1000000"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Duration
                    </label>
                    <select
                      value={profile.preferredDuration || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, preferredDuration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select duration</option>
                      <option value="Short-term">Short-term (< 6 months)</option>
                      <option value="Medium-term">Medium-term (6-18 months)</option>
                      <option value="Long-term">Long-term (> 18 months)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profile.isPublic}
                      onChange={(e) => setProfile(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Make profile public to investors</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profile.allowInvestorContact}
                      onChange={(e) => setProfile(prev => ({ ...prev, allowInvestorContact: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Allow investors to contact me</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profile.showSuccessMetrics}
                      onChange={(e) => setProfile(prev => ({ ...prev, showSuccessMetrics: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Show success metrics and statistics</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </PartnerLayout>
  )
}

export default PartnerProfilePage
