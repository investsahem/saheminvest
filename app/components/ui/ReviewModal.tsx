'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './Button'
import { 
  Star, X, MessageSquare, Send, AlertCircle, CheckCircle,
  Building2, Briefcase, User
} from 'lucide-react'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  partner: {
    id: string
    companyName: string
    industry: string
  }
  deal: {
    id: string
    title: string
  }
  onSubmit: (reviewData: { rating: number; comment: string }) => Promise<void>
}

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  partner, 
  deal, 
  onSubmit 
}: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      setSubmitting(true)
      await onSubmit({ rating, comment })
      setSubmitted(true)
      setTimeout(() => {
        onClose()
        setRating(0)
        setComment('')
        setSubmitted(false)
      }, 2000)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      return (
        <button
          key={i}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          className="focus:outline-none transition-all duration-200 hover:scale-110"
        >
          <Star 
            className={`w-8 h-8 ${
              starValue <= (hoverRating || rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`} 
          />
        </button>
      )
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                <p className="text-sm text-gray-600">Share your experience with this partner</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Review Submitted!</h4>
              <p className="text-gray-600">
                Your review has been submitted and is pending approval. Thank you for your feedback!
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Partner and Deal Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Partner</h4>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{partner.companyName}</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-6">{partner.industry}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Deal</h4>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 line-clamp-1">{deal.title}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  How would you rate this partner? *
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars()}
                </div>
                <div className="text-sm text-gray-600">
                  {rating === 0 && 'Please select a rating'}
                  {rating === 1 && 'Poor - Very dissatisfied'}
                  {rating === 2 && 'Fair - Somewhat dissatisfied'}
                  {rating === 3 && 'Good - Neutral'}
                  {rating === 4 && 'Very Good - Satisfied'}
                  {rating === 5 && 'Excellent - Very satisfied'}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Share your experience (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell other investors about your experience with this partner..."
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">
                    Help other investors make informed decisions
                  </div>
                  <div className="text-sm text-gray-400">
                    {comment.length}/1000
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Review Guidelines</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Reviews are moderated and will be published after approval</li>
                      <li>• Please be honest and constructive in your feedback</li>
                      <li>• Avoid sharing personal or sensitive information</li>
                      <li>• Reviews cannot be edited once submitted</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={rating === 0 || submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Submit Review
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
