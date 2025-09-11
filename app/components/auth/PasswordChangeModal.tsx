'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react'

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userEmail: string
}

interface PasswordStrength {
  score: number
  label: string
  color: string
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

export default function PasswordChangeModal({ isOpen, onClose, onSuccess, userEmail }: PasswordChangeModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Calculate password strength
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    const score = Object.values(requirements).filter(Boolean).length
    
    let label = 'Very Weak'
    let color = 'text-red-500'
    
    if (score >= 5) {
      label = 'Very Strong'
      color = 'text-green-500'
    } else if (score >= 4) {
      label = 'Strong'
      color = 'text-green-400'
    } else if (score >= 3) {
      label = 'Medium'
      color = 'text-yellow-500'
    } else if (score >= 2) {
      label = 'Weak'
      color = 'text-orange-500'
    }

    return { score, label, color, requirements }
  }

  const passwordStrength = calculatePasswordStrength(formData.newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setFieldErrors({})

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        if (data.errors) {
          const errors: Record<string, string> = {}
          data.errors.forEach((error: any) => {
            errors[error.path[0]] = error.message
          })
          setFieldErrors(errors)
        } else {
          setError(data.message || 'Failed to change password')
        }
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] shadow-2xl backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#6be2c9]" />
                </div>
                <h2 className="text-2xl font-bold text-[#e9edf7] mb-2">Change Your Password</h2>
                <p className="text-[#b8c2d8] text-sm">
                  For security reasons, you need to set a new password for your account: <strong>{userEmail}</strong>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-[#e9edf7] mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#0f1640] border border-[#2d3a6b] rounded-lg text-[#e9edf7] focus:border-[#6be2c9] focus:outline-none pr-12"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8c2d8] hover:text-[#e9edf7]"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.currentPassword && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-[#e9edf7] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#0f1640] border border-[#2d3a6b] rounded-lg text-[#e9edf7] focus:border-[#6be2c9] focus:outline-none pr-12"
                      placeholder="Enter your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8c2d8] hover:text-[#e9edf7]"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.newPassword && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.newPassword}</p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-[#b8c2d8]">Strength:</span>
                        <span className={`text-sm font-medium ${passwordStrength.color}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        {Object.entries(passwordStrength.requirements).map(([key, met]) => (
                          <div key={key} className={`flex items-center gap-2 ${met ? 'text-green-400' : 'text-[#95a5c9]'}`}>
                            {met ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                            <span>
                              {key === 'length' && '8+ characters'}
                              {key === 'uppercase' && 'Uppercase letter'}
                              {key === 'lowercase' && 'Lowercase letter'}
                              {key === 'number' && 'Number'}
                              {key === 'special' && 'Special character'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-[#e9edf7] mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#0f1640] border border-[#2d3a6b] rounded-lg text-[#e9edf7] focus:border-[#6be2c9] focus:outline-none pr-12"
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8c2d8] hover:text-[#e9edf7]"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.confirmPassword}</p>
                  )}
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">Passwords don't match</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading || passwordStrength.score < 3 || formData.newPassword !== formData.confirmPassword}
                    className="flex-1 bg-gradient-to-r from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Changing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Change Password
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
