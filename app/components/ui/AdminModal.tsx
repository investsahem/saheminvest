'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  X
} from 'lucide-react'
import { Button } from './Button'
import { useTranslation } from '../providers/I18nProvider'

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  details?: string[]
  showActions?: boolean
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

export function AdminModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  details = [],
  showActions = false,
  onConfirm,
  confirmText,
  cancelText
}: AdminModalProps) {
  const { t } = useTranslation()

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-16 h-16 text-yellow-500" />
      case 'info':
        return <Info className="w-16 h-16 text-blue-500" />
      default:
        return <CheckCircle className="w-16 h-16 text-green-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-emerald-50'
      case 'error':
        return 'bg-gradient-to-br from-red-50 to-rose-50'
      case 'warning':
        return 'bg-gradient-to-br from-yellow-50 to-amber-50'
      case 'info':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50'
      default:
        return 'bg-gradient-to-br from-green-50 to-emerald-50'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
      case 'error':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
      default:
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
    }
  }

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
                    {message}
                  </p>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  {/* Details */}
                  {details.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        {t('admin.details')}
                      </h4>
                      <div className="space-y-2">
                        {details.map((detail, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <p className="text-sm text-gray-600">{detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex gap-3">
                  {showActions && onConfirm ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                      >
                        {cancelText || t('common.cancel')}
                      </Button>
                      <Button
                        onClick={() => {
                          onConfirm()
                          onClose()
                        }}
                        className={`flex-1 text-white ${getButtonColor()}`}
                      >
                        {confirmText || t('common.confirm')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={onClose}
                      className={`w-full text-white ${getButtonColor()}`}
                    >
                      {t('common.got_it')}
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
