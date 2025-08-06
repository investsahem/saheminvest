'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  MessageSquare, Send, Search, Filter, Plus, Users, 
  Mail, Phone, Calendar, Clock, CheckCircle, AlertCircle,
  User, Building2, Star, Reply, Forward, Archive, Trash2
} from 'lucide-react'

interface Message {
  id: string
  subject: string
  content: string
  from: string
  to: string
  type: 'email' | 'message' | 'notification'
  status: 'unread' | 'read' | 'replied' | 'archived'
  priority: 'low' | 'medium' | 'high'
  date: string
  dealId?: string
  dealTitle?: string
  attachments?: number
  investorName?: string
  investorEmail?: string
}

interface Contact {
  id: string
  name: string
  email: string
  role: 'investor' | 'admin' | 'support'
  avatar?: string
  lastContact: string
  totalMessages: number
  dealCount: number
  investmentAmount?: number
}

const PartnerCommunicationsPage = () => {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'messages' | 'contacts'>('messages')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    content: ''
  })

  // Sample messages data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleMessages: Message[] = [
        {
          id: '1',
          subject: 'Investment inquiry about AI Healthcare Platform',
          content: 'Hello, I am interested in learning more about the AI Healthcare Platform investment opportunity. Could you provide additional details about the expected timeline and risk factors?',
          from: 'Ahmed Al-Rashid',
          to: 'Partner User',
          type: 'email',
          status: 'unread',
          priority: 'high',
          date: '2024-01-20T10:30:00Z',
          dealId: '1',
          dealTitle: 'AI Healthcare Platform',
          investorName: 'Ahmed Al-Rashid',
          investorEmail: 'ahmed@example.com'
        },
        {
          id: '2',
          subject: 'Deal completion confirmation - Smart Home Solutions',
          content: 'Thank you for the successful completion of the Smart Home Solutions project. The returns exceeded expectations. Looking forward to future opportunities.',
          from: 'Sarah Johnson',
          to: 'Partner User',
          type: 'email',
          status: 'read',
          priority: 'medium',
          date: '2024-01-18T14:15:00Z',
          dealId: '2',
          dealTitle: 'Smart Home Solutions',
          investorName: 'Sarah Johnson',
          investorEmail: 'sarah@example.com'
        },
        {
          id: '3',
          subject: 'Document verification required',
          content: 'We need additional documentation for compliance verification. Please upload the required certificates at your earliest convenience.',
          from: 'Admin Support',
          to: 'Partner User',
          type: 'notification',
          status: 'unread',
          priority: 'high',
          date: '2024-01-17T09:45:00Z'
        },
        {
          id: '4',
          subject: 'Investment update request',
          content: 'Could you please provide an update on the Medical Device Manufacturing project? Investors are eager to know about the current progress.',
          from: 'Mohammed Al-Saadoun',
          to: 'Partner User',
          type: 'message',
          status: 'replied',
          priority: 'medium',
          date: '2024-01-15T16:20:00Z',
          dealId: '3',
          dealTitle: 'Medical Device Manufacturing',
          investorName: 'Mohammed Al-Saadoun',
          investorEmail: 'mohammed@example.com'
        },
        {
          id: '5',
          subject: 'New investment opportunity discussion',
          content: 'I would like to discuss potential investment in your upcoming renewable energy project. When would be a good time for a call?',
          from: 'Lisa Chen',
          to: 'Partner User',
          type: 'email',
          status: 'read',
          priority: 'medium',
          date: '2024-01-12T11:10:00Z',
          investorName: 'Lisa Chen',
          investorEmail: 'lisa@example.com'
        }
      ]

      const sampleContacts: Contact[] = [
        {
          id: '1',
          name: 'Ahmed Al-Rashid',
          email: 'ahmed@example.com',
          role: 'investor',
          lastContact: '2024-01-20',
          totalMessages: 8,
          dealCount: 2,
          investmentAmount: 45000
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          role: 'investor',
          lastContact: '2024-01-18',
          totalMessages: 5,
          dealCount: 2,
          investmentAmount: 32000
        },
        {
          id: '3',
          name: 'Mohammed Al-Saadoun',
          email: 'mohammed@example.com',
          role: 'investor',
          lastContact: '2024-01-15',
          totalMessages: 12,
          dealCount: 3,
          investmentAmount: 78000
        },
        {
          id: '4',
          name: 'Lisa Chen',
          email: 'lisa@example.com',
          role: 'investor',
          lastContact: '2024-01-12',
          totalMessages: 3,
          dealCount: 1,
          investmentAmount: 23000
        },
        {
          id: '5',
          name: 'Admin Support',
          email: 'support@sahaminvest.com',
          role: 'admin',
          lastContact: '2024-01-17',
          totalMessages: 15,
          dealCount: 0
        }
      ]

      setMessages(sampleMessages)
      setContacts(sampleContacts)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter messages
  const filteredMessages = messages.filter(message => {
    const matchesSearch = searchTerm === '' || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || message.status === filterStatus
    const matchesType = filterType === 'all' || message.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-gray-100 text-gray-800'
      case 'replied': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <Mail className="w-4 h-4" />
      case 'read': return <CheckCircle className="w-4 h-4" />
      case 'replied': return <Reply className="w-4 h-4" />
      case 'archived': return <Archive className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message)
    if (message.status === 'unread') {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'read' } : m
      ))
    }
  }

  const handleReply = (message: Message) => {
    setComposeData({
      to: message.from,
      subject: `Re: ${message.subject}`,
      content: ''
    })
    setShowCompose(true)
    setSelectedMessage(null)
  }

  const handleCompose = () => {
    setComposeData({ to: '', subject: '', content: '' })
    setShowCompose(true)
  }

  const handleSendMessage = () => {
    // Simulate sending message
    const newMessage: Message = {
      id: Date.now().toString(),
      subject: composeData.subject,
      content: composeData.content,
      from: 'Partner User',
      to: composeData.to,
      type: 'email',
      status: 'read',
      priority: 'medium',
      date: new Date().toISOString()
    }
    
    setMessages(prev => [newMessage, ...prev])
    setShowCompose(false)
    setComposeData({ to: '', subject: '', content: '' })
  }

  const handleArchiveMessage = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'archived' } : m
    ))
  }

  const handleDeleteMessage = (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      setMessages(prev => prev.filter(m => m.id !== messageId))
    }
  }

  // Calculate summary metrics
  const unreadCount = messages.filter(m => m.status === 'unread').length
  const totalMessages = messages.length
  const highPriorityCount = messages.filter(m => m.priority === 'high' && m.status === 'unread').length

  return (
    <PartnerLayout
      title="Communications"
      subtitle="Manage communications with investors and stakeholders"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Unread Messages</p>
                  <p className="text-2xl font-bold text-blue-900">{unreadCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Messages</p>
                  <p className="text-2xl font-bold text-green-900">{totalMessages}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">High Priority</p>
                  <p className="text-2xl font-bold text-red-900">{highPriorityCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Active Contacts</p>
                  <p className="text-2xl font-bold text-purple-900">{contacts.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'messages'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'contacts'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contacts
          </button>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={activeTab === 'messages' ? 'Search messages...' : 'Search contacts...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {activeTab === 'messages' && (
                  <>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>

                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="email">Email</option>
                      <option value="message">Message</option>
                      <option value="notification">Notification</option>
                    </select>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleCompose}
                >
                  <Plus className="w-4 h-4" />
                  Compose
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'messages' ? (
          /* Messages List */
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <Card key={message.id} className={`hover:shadow-md transition-shadow cursor-pointer ${
                message.status === 'unread' ? 'border-blue-300 bg-blue-50' : ''
              }`} onClick={() => handleMessageClick(message)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {message.subject}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                              {getStatusIcon(message.status)}
                              {message.status}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(message.priority)}`}></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            From: {message.from} • {formatDate(message.date)}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {message.content}
                      </p>

                      {message.dealTitle && (
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{message.dealTitle}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className={`text-xs font-medium ${getPriorityColor(message.priority)}`}>
                            {message.priority.toUpperCase()} PRIORITY
                          </span>
                          {message.attachments && (
                            <span className="text-xs text-gray-500">
                              {message.attachments} attachments
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReply(message)
                            }}
                          >
                            <Reply className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleArchiveMessage(message.id)
                            }}
                          >
                            <Archive className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteMessage(message.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Contacts List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{contact.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{contact.totalMessages} messages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Last: {formatDate(contact.lastContact)}</span>
                    </div>
                  </div>

                  {contact.investmentAmount && (
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Total Investment</span>
                        <span className="text-sm font-semibold text-green-800">
                          {formatCurrency(contact.investmentAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-green-600">Active Deals</span>
                        <span className="text-xs font-medium text-green-700">{contact.dealCount}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setComposeData({
                          to: contact.email,
                          subject: '',
                          content: ''
                        })
                        setShowCompose(true)
                      }}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`mailto:${contact.email}`)}
                    >
                      <Mail className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Compose Message</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCompose(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <Input
                      type="email"
                      value={composeData.to}
                      onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="recipient@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <Input
                      type="text"
                      value={composeData.subject}
                      onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Message subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={composeData.content}
                      onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Type your message here..."
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCompose(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!composeData.to || !composeData.subject || !composeData.content}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty States */}
        {!loading && (
          <>
            {activeTab === 'messages' && filteredMessages.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Your messages will appear here when you receive them.'
                    }
                  </p>
                  <Button onClick={handleCompose}>
                    <Plus className="w-4 h-4 mr-2" />
                    Compose Message
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'contacts' && filteredContacts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? 'Try adjusting your search criteria.'
                      : 'Your contacts will appear here as you interact with investors.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PartnerLayout>
  )
}

export default PartnerCommunicationsPage