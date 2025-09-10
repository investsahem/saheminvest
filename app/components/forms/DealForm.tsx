'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '../providers/I18nProvider'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { 
  Upload, X, DollarSign, Calendar, MapPin, Tag, 
  FileText, Image as ImageIcon, AlertCircle, 
  Save, Eye, Trash2, Pause, Play
} from 'lucide-react'

interface DealFormProps {
  deal?: any
  onSubmit?: (data: FormData) => Promise<void>
  onCancel?: () => void
  mode?: 'create' | 'edit'
}

const DealForm = ({ deal, onSubmit, onCancel, mode = 'create' }: DealFormProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(deal?.thumbnailImage || '')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [highlights, setHighlights] = useState<string[]>(deal?.highlights || [''])
  const [tags, setTags] = useState<string[]>(deal?.tags || [''])

  const [formData, setFormData] = useState({
    title: deal?.title || '',
    description: deal?.description || '',
    category: deal?.category || '',
    location: deal?.location || '',
    fundingGoal: deal?.fundingGoal || '',
    minInvestment: deal?.minInvestment || '',
    expectedReturn: deal?.expectedReturn || '',
    duration: deal?.duration || '',
    riskLevel: deal?.riskLevel || 'MEDIUM',
    status: deal?.status || 'DRAFT',
    startDate: deal?.startDate ? new Date(deal.startDate).toISOString().split('T')[0] : '',
    endDate: deal?.endDate ? new Date(deal.endDate).toISOString().split('T')[0] : '',
    featured: deal?.featured || false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('🖼️ Image selected:', file?.name, file?.size)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        console.log('🖼️ Image preview set:', result.substring(0, 50) + '...')
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    } else {
      console.log('⚠️ No file selected in handleImageChange')
    }
  }

  const addHighlight = () => {
    setHighlights([...highlights, ''])
  }

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...highlights]
    newHighlights[index] = value
    setHighlights(newHighlights)
  }

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const addTag = () => {
    setTags([...tags, ''])
  }

  const updateTag = (index: number, value: string) => {
    const newTags = [...tags]
    newTags[index] = value
    setTags(newTags)
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent, status?: string) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitFormData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitFormData.append(key, value.toString())
        }
      })

      // Override status if provided
      if (status) {
        submitFormData.append('status', status)
      }

      // Add highlights and tags
      submitFormData.append('highlights', JSON.stringify(highlights.filter(h => h.trim())))
      submitFormData.append('tags', JSON.stringify(tags.filter(t => t.trim())))

      // Handle image upload
      const imageInput = imageInputRef.current
      const hasNewImageFile = imageInput?.files && imageInput.files.length > 0 && imageInput.files[0]
      
      console.log('🔍 Image handling debug info:', {
        hasNewImageFile: !!hasNewImageFile,
        mode,
        imagePreview: imagePreview ? imagePreview.substring(0, 50) + '...' : 'None',
        imagePreviewIsDataUrl: imagePreview?.startsWith('data:'),
        imageInputFiles: imageInput?.files?.length || 0,
        imageInputRef: !!imageInputRef.current,
        imageInputId: imageInputRef.current?.id || 'no-id',
        imageInputName: imageInputRef.current?.name || 'no-name'
      })
      
      if (hasNewImageFile && imageInput.files && imageInput.files.length > 0) {
        const file = imageInput.files[0]
        console.log('✅ Adding new image to form data:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        })
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert('Image file is too large. Please select a file under 10MB.')
          setLoading(false)
          return
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file.')
          setLoading(false)
          return
        }
        
        submitFormData.append('image', file)
        console.log('📤 New image file added to form data')
      } else if (mode === 'edit' && imagePreview && !imagePreview.startsWith('data:')) {
        // Keep existing image URL for edit mode
        submitFormData.append('existingImageUrl', imagePreview)
        console.log('🔄 Keeping existing image:', imagePreview)
      } else if (mode === 'create') {
        console.log('⚠️ No image selected for new deal creation')
      } else {
        console.log('ℹ️ No image changes for edit mode - imagePreview:', imagePreview)
      }

      if (onSubmit) {
        console.log('Submitting form data for', mode === 'edit' ? 'edit' : 'create')
        await onSubmit(submitFormData)
        console.log('Form submitted successfully')
      } else {
        // Default API call
        const url = mode === 'edit' ? `/api/deals/${deal.id}` : '/api/deals'
        const method = mode === 'edit' ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          body: submitFormData
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('API Error:', errorData)
          throw new Error(errorData.error || 'Failed to save deal')
        }

        const result = await response.json()
        console.log('API Response:', result)
        
        // Redirect based on status
        if (status === 'PUBLISHED' || formData.status === 'PUBLISHED') {
          router.push('/deals')
        } else {
          router.push('/admin')
        }
      }
    } catch (error) {
      console.error('Error saving deal:', error)
      alert('Failed to save deal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'Technology', 'Real Estate', 'Healthcare', 'Energy', 
    'Agriculture', 'Manufacturing', 'Finance', 'Education',
    'Transportation', 'Entertainment', 'Food & Beverage', 'Other'
  ]

  const riskLevels = [
    { value: 'LOW', label: 'Low Risk', color: 'text-green-600' },
    { value: 'MEDIUM', label: 'Medium Risk', color: 'text-yellow-600' },
    { value: 'HIGH', label: 'High Risk', color: 'text-red-600' }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardContent className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'edit' ? t('partner_deals.edit_deal') : t('partner_deals.create_new_deal')}
            </h1>
            <p className="text-gray-600">
              {mode === 'edit' 
                ? t('partner_deals.update_deal_subtitle')
                : t('partner_deals.form.subtitle')
              }
            </p>
          </div>

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
{t('partner_deals.basic_information')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('partner_deals.deal_title')} {t('partner_deals.required_field')}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('partner_deals.deal_title_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('partner_deals.category')} {t('partner_deals.required_field')}
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('partner_deals.select_category')}</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partner_deals.description')} {t('partner_deals.required_field')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('partner_deals.description_placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t('partner_deals.location')}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('partner_deals.location_placeholder')}
                />
              </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                {t('partner_deals.financial_details')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    {t('partner_deals.funding_goal')} {t('partner_deals.required_field')}
                  </label>
                  <input
                    type="number"
                    name="fundingGoal"
                    value={formData.fundingGoal}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('partner_deals.funding_goal_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('partner_deals.minimum_investment')} {t('partner_deals.required_field')}
                  </label>
                  <input
                    type="number"
                    name="minInvestment"
                    value={formData.minInvestment}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('partner_deals.minimum_investment_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('partner_deals.expected_return')} {t('partner_deals.required_field')}
                  </label>
                  <input
                    type="number"
                    name="expectedReturn"
                    value={formData.expectedReturn}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('partner_deals.expected_return_placeholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('partner_deals.duration')} {t('partner_deals.required_field')}
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('partner_deals.duration_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('partner_deals.risk_level')} {t('partner_deals.required_field')}
                  </label>
                  <select
                    name="riskLevel"
                    value={formData.riskLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {riskLevels.map(risk => (
                      <option key={risk.value} value={risk.value}>
                        {risk.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                {t('partner_deals.timeline')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {t('partner_deals.start_date')}
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('partner_deals.end_date')}
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                {t('partner_deals.media')}
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  {t('partner_deals.deal_image')}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {/* Single file input that works for both cases */}
                  <input
                    ref={imageInputRef}
                    id="image-input"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        {/* Change Image Button */}
                        <label
                          htmlFor="image-input"
                          className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 cursor-pointer"
                          title="Change Image"
                          onClick={() => {
                            console.log('🔄 Change image button clicked, ref exists:', !!imageInputRef.current)
                            if (imageInputRef.current) {
                              imageInputRef.current.click()
                            }
                          }}
                        >
                          <Upload className="w-4 h-4" />
                        </label>
                        {/* Remove Image Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('')
                            if (imageInputRef.current) {
                              imageInputRef.current.value = ''
                            }
                          }}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          title="Remove Image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="image-input" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            {t('partner_deals.upload_deal_image')}
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            {t('partner_deals.image_format_info')}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                {t('partner_deals.key_highlights')}
              </h2>
              
              <div className="space-y-3">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      placeholder={t('partner_deals.highlight_placeholder')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeHighlight(index)}
                      className="px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addHighlight}
                  className="w-full"
                >
                  {t('partner_deals.add_highlight')}
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                <Tag className="w-5 h-5 inline mr-2" />
                {t('partner_deals.tags')}
              </h2>
              
              <div className="space-y-3">
                {tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      placeholder={t('partner_deals.tag_placeholder')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeTag(index)}
                      className="px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  className="w-full"
                >
                  {t('partner_deals.add_tag')}
                </Button>
              </div>
            </div>

            {/* Status and Settings */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                {t('partner_deals.settings')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('partner_deals.status')}
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DRAFT">{t('partner_deals.status_draft')}</option>
                    <option value="PENDING">{t('partner_deals.status_pending')}</option>
                    <option value="PUBLISHED">{t('partner_deals.status_published')}</option>
                    <option value="ACTIVE">{t('partner_deals.status_active')}</option>
                    <option value="PAUSED">{t('partner_deals.status_paused')}</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    {t('partner_deals.featured_deal')}
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-8 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? t('partner_deals.saving') : mode === 'edit' ? t('partner_deals.update_deal') : t('partner_deals.save_as_draft')}
              </Button>

              <Button
                type="button"
                onClick={(e) => handleSubmit(e, 'PUBLISHED')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                {mode === 'edit' ? t('partner_deals.update_and_publish') : t('partner_deals.save_and_publish')}
              </Button>

              {mode === 'edit' && deal?.status === 'ACTIVE' && (
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'PAUSED')}
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  {t('partner_deals.pause_deal')}
                </Button>
              )}

              {mode === 'edit' && deal?.status === 'PAUSED' && (
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'ACTIVE')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {t('partner_deals.resume_deal')}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={onCancel || (() => router.back())}
                disabled={loading}
              >
                {t('partner_deals.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default DealForm