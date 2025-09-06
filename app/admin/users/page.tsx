'use client'

import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

// Sample data - would come from API/database in real app
const sampleUsers = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@sahaminvest.com',
    role: 'INVESTOR',
    isActive: true,
    createdAt: '2024-01-15',
    lastLogin: '2024-07-20',
    permissions: []
  },
  {
    id: '2',
    name: 'فاطمة علي',
    email: 'fatima@sahaminvest.com',
    role: 'DEAL_MANAGER',
    isActive: true,
    createdAt: '2024-02-10',
    lastLogin: '2024-07-19',
    permissions: ['READ_DEALS', 'WRITE_DEALS', 'READ_USERS']
  },
  {
    id: '3',
    name: 'محمد حسن',
    email: 'mohamed@sahaminvest.com',
    role: 'FINANCIAL_OFFICER',
    isActive: true,
    createdAt: '2024-03-05',
    lastLogin: '2024-07-18',
    permissions: ['READ_TRANSACTIONS', 'WRITE_TRANSACTIONS', 'READ_INVESTMENTS']
  },
  {
    id: '4',
    name: 'سارة أحمد',
    email: 'sara@sahaminvest.com',
    role: 'PORTFOLIO_ADVISOR',
    isActive: false,
    createdAt: '2024-04-12',
    lastLogin: '2024-07-15',
    permissions: ['READ_INVESTMENTS', 'WRITE_INVESTMENTS', 'READ_USERS']
  }
]

const rolePermissions = {
  ADMIN: [
    'READ_DEALS', 'WRITE_DEALS', 'DELETE_DEALS',
    'READ_USERS', 'WRITE_USERS', 'DELETE_USERS',
    'READ_TRANSACTIONS', 'WRITE_TRANSACTIONS',
    'READ_INVESTMENTS', 'WRITE_INVESTMENTS',
    'MANAGE_ROLES', 'MANAGE_PARTNERS',
    'VIEW_ANALYTICS', 'SYSTEM_SETTINGS'
  ],
  DEAL_MANAGER: [
    'READ_DEALS', 'WRITE_DEALS',
    'READ_USERS', 'READ_TRANSACTIONS',
    'READ_INVESTMENTS', 'MANAGE_PARTNERS'
  ],
  FINANCIAL_OFFICER: [
    'READ_DEALS', 'READ_USERS',
    'READ_TRANSACTIONS', 'WRITE_TRANSACTIONS',
    'READ_INVESTMENTS', 'VIEW_ANALYTICS'
  ],
  PORTFOLIO_ADVISOR: [
    'READ_DEALS', 'READ_USERS',
    'READ_INVESTMENTS', 'WRITE_INVESTMENTS'
  ],
  INVESTOR: ['READ_DEALS'],
  PARTNER: ['READ_DEALS', 'WRITE_DEALS']
}

// Removed hardcoded labels - will use translation function instead

export default function UsersManagementPage() {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const [users, setUsers] = useState(sampleUsers)
  const [selectedUser, setSelectedUser] = useState<typeof sampleUsers[0] | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('ALL')

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'INVESTOR' as keyof typeof rolePermissions,
    password: ''
  })

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'ALL' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const handleRoleChange = (userId: string, newRole: keyof typeof rolePermissions) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole, permissions: rolePermissions[newRole] }
        : user
    ))
    setShowRoleModal(false)
    setSelectedUser(null)
  }

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.password) {
      const user = {
        id: Date.now().toString(),
        ...newUser,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: '-',
        permissions: rolePermissions[newUser.role]
      }
      setUsers([...users, user])
      setNewUser({ name: '', email: '', role: 'INVESTOR', password: '' })
      setShowAddUser(false)
    }
  }

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ))
  }

  return (
    <AdminLayout 
      title={t('admin.users_management.title')}
      subtitle={t('admin.users_management.subtitle')}
    >

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <Input
              placeholder={t('admin.users_management.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">{t('admin.users_management.all_roles')}</option>
              {Object.keys(rolePermissions).map((role) => (
                <option key={role} value={role}>{t(`roles.${role}`)}</option>
              ))}
            </select>
          </div>
          <Button onClick={() => setShowAddUser(true)}>
            {t('admin.users_management.add_new_user')}
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.users_management.user')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.users_management.role')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.users_management.status')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.users_management.creation_date')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.users_management.last_login')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.users_management.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {t(`roles.${user.role}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(user.isActive)}`}>
                          {user.isActive ? t('admin.users_management.active') : t('admin.users_management.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.lastLogin === '-' ? '-' : formatDate(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowRoleModal(true)
                            }}
                          >
                            {t('admin.users_management.edit_role')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id)}
                            className={user.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                          >
                            {user.isActive ? t('admin.users_management.disable') : t('admin.users_management.enable')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Role Assignment Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {t('admin.users_management.edit_role_for')} {selectedUser.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.users_management.select_new_role')}
                  </label>
                  <div className="space-y-2">
                    {Object.keys(rolePermissions).map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={selectedUser.role === role}
                          onChange={() => setSelectedUser({...selectedUser, role: role as keyof typeof rolePermissions})}
                          className="ml-2"
                        />
                        <span className="font-medium">{t(`roles.${role}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t('admin.users_management.associated_permissions')}
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                      {rolePermissions[selectedUser.role as keyof typeof rolePermissions]?.map(permission => (
                        <div key={permission}>
                          • {t(`admin.permissions.${permission}`)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={() => handleRoleChange(selectedUser.id, selectedUser.role as keyof typeof rolePermissions)}
                >
                  {t('admin.users_management.save_changes')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRoleModal(false)
                    setSelectedUser(null)
                  }}
                >
                  {t('admin.users_management.cancel')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {t('admin.users_management.add_user_title')}
              </h3>
              
              <div className="space-y-4">
                <Input
                  label={t('admin.users_management.full_name')}
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder={t('admin.users_management.enter_full_name')}
                />
                <Input
                  label={t('admin.users_management.email')}
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder={t('admin.users_management.enter_email')}
                />
                <Input
                  label={t('admin.users_management.password')}
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder={t('admin.users_management.enter_password')}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.users_management.role_label')}
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as keyof typeof rolePermissions})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(rolePermissions).map((role) => (
                      <option key={role} value={role}>{t(`roles.${role}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleAddUser}>
                  {t('admin.users_management.add_user')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddUser(false)
                    setNewUser({ name: '', email: '', role: 'INVESTOR', password: '' })
                  }}
                >
                  {t('admin.users_management.cancel')}
                </Button>
              </div>
            </div>
          </div>
                  )}
    </AdminLayout>
  )
} 