'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X, 
  CreditCard, 
  Wallet, 
  Landmark,
  ArrowRight,
  Shield
} from 'lucide-react'
import { Button } from './Button'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'pending' | 'error'
  title: string
  message: string
  amount?: number
  method?: 'cash' | 'card' | 'bank'
  reference?: string
  details?: string[]
}

export function SuccessModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  amount,
  method,
  reference,
  details = []
}: SuccessModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500" />
      default:
        return <CheckCircle className="w-16 h-16 text-green-500" />
    }
  }

  const getMethodIcon = () => {
    switch (method) {
      case 'cash':
        return <Wallet className="w-5 h-5 text-gray-600" />
      case 'card':
        return <CreditCard className="w-5 h-5 text-gray-600" />
      case 'bank':
        return <Landmark className="w-5 h-5 text-gray-600" />
      default:
        return null
    }
  }

  const getMethodName = () => {
    switch (method) {
      case 'cash':
        return 'Cash Deposit'
      case 'card':
        return 'Credit Card'
      case 'bank':
        return 'Bank Transfer'
      default:
        return 'Payment'
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-emerald-50'
      case 'pending':
        return 'bg-gradient-to-br from-yellow-50 to-amber-50'
      case 'error':
        return 'bg-gradient-to-br from-red-50 to-rose-50'
      default:
        return 'bg-gradient-to-br from-green-50 to-emerald-50'
    }
  }

  const getStatusMessage = () => {
    if (type === 'success' && method === 'card') {
      return {
        status: 'Completed',
        description: 'Your deposit has been processed successfully and added to your wallet.',
        nextSteps: [
          'Funds are now available for investment',
          'You can view this transaction in your history',
          'Start exploring investment opportunities'
        ]
      }
    } else if (type === 'pending' && (method === 'cash' || method === 'bank')) {
      return {
        status: 'Under Review',
        description: 'Your deposit request has been submitted and is being reviewed by our team.',
        nextSteps: [
          'We will verify your payment within 24 hours',
          'You will receive a notification once approved',
          'Funds will be added to your wallet after verification'
        ]
      }
    } else if (type === 'error') {
      return {
        status: 'Failed',
        description: 'There was an issue processing your deposit. Please try again.',
        nextSteps: [
          'Check your payment details',
          'Ensure sufficient funds are available',
          'Contact support if the issue persists'
        ]
      }
    }
    return {
      status: 'Completed',
      description: message,
      nextSteps: []
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className={`${getBgColor()} px-6 py-8 text-center relative`}>
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <div className="flex justify-center mb-4">
                    {getIcon()}
                  </div>
                  
                  <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
                    {title}
                  </Dialog.Title>
                  
                  <p className="text-gray-600 text-sm">
                    {statusInfo.description}
                  </p>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                  {/* Transaction Details */}
                  {amount && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Amount</span>
                        <span className="text-lg font-bold text-gray-900">
                          ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      {method && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Payment Method</span>
                          <div className="flex items-center gap-2">
                            {getMethodIcon()}
                            <span className="text-sm font-medium text-gray-900">{getMethodName()}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Status</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            type === 'success' ? 'bg-green-500' : 
                            type === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            type === 'success' ? 'text-green-700' : 
                            type === 'pending' ? 'text-yellow-700' : 'text-red-700'
                          }`}>
                            {statusInfo.status}
                          </span>
                        </div>
                      </div>
                      
                      {reference && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Reference</span>
                          <span className="text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded">
                            {reference}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Next Steps */}
                  {statusInfo.nextSteps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        What happens next?
                      </h4>
                      <div className="space-y-2">
                        {statusInfo.nextSteps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <p className="text-sm text-gray-600">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Security Notice for Pending Transactions */}
                  {type === 'pending' && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-sm font-medium text-blue-900 mb-1">Secure Processing</h5>
                          <p className="text-xs text-blue-800">
                            Your transaction is being processed securely. We'll notify you via email and in-app notification once it's completed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex gap-3">
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {type === 'success' ? 'Continue Investing' : 'Got it'}
                  </Button>
                  {type === 'pending' && (
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      View History
                    </Button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
