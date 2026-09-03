import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Ban,
  CheckCircle,
  MoreVertical,
  Loader2,
  AlertCircle,
  Mail,
  Building2,
  Calendar,
  ShieldCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  UserCheck,
  UserX,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface EmployerInfo {
  id: number
  company_name: string
  logo: string | null
  approval_status: string
}

interface UserItem {
  id: number
  name: string
  email: string
  username: string
  role: string
  role_label?: string
  is_suspended: boolean
  status: string
  email_verified_at: string | null
  created_at: string
  employer?: EmployerInfo
}

interface PaginatedUsersResponse {
  data: UserItem[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

const FILTERS = [
  { id: 'All', label: 'All Users' },
  { id: 'Job Seekers', label: 'Job Seekers', role: 'employee' },
  { id: 'Employers', label: 'Employers', role: 'employer' },
  { id: 'Admins', label: 'Admins', role: 'admin' },
  { id: 'Suspended', label: 'Suspended', status: 'suspended' },
] as const

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filter & Search state
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [lastPage, setLastPage] = useState<number>(1)
  const [totalUsers, setTotalUsers] = useState<number>(0)

  // Modals state
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null)
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false)

  const fetchUsers = useCallback(async (page: number, filterId: string, search: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const params: Record<string, string | number> = { page }
      const filterConfig = FILTERS.find((f) => f.id === filterId)

      if (filterConfig && 'role' in filterConfig && filterConfig.role) {
        params.role = filterConfig.role
      }
      if (filterConfig && 'status' in filterConfig && filterConfig.status) {
        params.status = filterConfig.status
      }
      if (search.trim()) {
        params.search = search.trim()
      }

      const response = await api.get('/admin/users', { params })
      const resData = response.data?.data ?? response.data
      const paginated: PaginatedUsersResponse = resData.data ? resData : resData

      setUsers(paginated.data || [])
      setCurrentPage(paginated.current_page || 1)
      setLastPage(paginated.last_page || 1)
      setTotalUsers(paginated.total || 0)
    } catch (err: unknown) {
      console.error('Failed to load users:', err)
      setError('Failed to fetch platform users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers(currentPage, activeFilter, searchQuery)
  }, [currentPage, activeFilter, searchQuery, fetchUsers])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    setSearchQuery(searchInput)
  }

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
    setCurrentPage(1)
  }

  const handleToggleSuspend = async (user: UserItem) => {
    try {
      setIsActionLoading(true)
      const response = await api.post(`/admin/users/${user.id}/toggle-suspend`)
      const updatedUser: UserItem = response.data?.data ?? response.data

      const actionText = updatedUser.is_suspended ? 'suspended' : 'reactivated'
      toast.success(`User "${user.name}" has been ${actionText}.`)

      if (selectedUser?.id === user.id) {
        setSelectedUser(updatedUser)
      }

      fetchUsers(currentPage, activeFilter, searchQuery)
    } catch (err: unknown) {
      console.error('Failed to toggle suspension:', err)
      toast.error('Failed to update user suspension status.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return
    try {
      setIsActionLoading(true)
      await api.delete(`/admin/users/${deletingUser.id}`)
      toast.success(`User "${deletingUser.name}" has been permanently deleted.`)
      setDeletingUser(null)
      if (selectedUser?.id === deletingUser.id) {
        setSelectedUser(null)
      }
      fetchUsers(currentPage, activeFilter, searchQuery)
    } catch (err: unknown) {
      console.error('Failed to delete user:', err)
      toast.error('Failed to delete user account.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'employer':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'employee':
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage registered accounts, roles, and status suspensions across the platform ({totalUsers} total)
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, username..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.id
          return (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50/70 text-slate-500 font-medium">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={24} />
                      <p className="text-sm font-medium">Loading user accounts...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <p className="text-base font-semibold text-slate-700">No users found</p>
                    <p className="text-sm mt-1">Try selecting a different filter tab or search term.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 font-medium">{u.email}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role_label || u.role}
                      </span>
                      {u.employer && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Building2 size={12} /> {u.employer.company_name}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                          u.is_suspended
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-green-100 text-green-700 border-green-200'
                        }`}
                      >
                        {u.is_suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">{formatDate(u.created_at)}</td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Suspension */}
                        {u.is_suspended ? (
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            disabled={isActionLoading}
                            title="Reactivate Account"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle size={14} /> Reactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            disabled={isActionLoading}
                            title="Suspend Account"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5"
                          >
                            <Ban size={14} /> Suspend
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => setSelectedUser(u)}
                          title="View Profile Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {lastPage > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-700">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-700">{lastPage}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                className="p-2 border rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                disabled={currentPage === lastPage || isLoading}
                className="p-2 border rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center border border-blue-200">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-400">@{selectedUser.username}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border">
                <Mail className="text-blue-600" size={18} />
                <div>
                  <span className="text-xs text-slate-400 block">Email Address</span>
                  <span className="font-semibold text-slate-800">{selectedUser.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-xs text-slate-400 block">Role</span>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadge(
                      selectedUser.role
                    )}`}
                  >
                    {selectedUser.role_label || selectedUser.role}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-xs text-slate-400 block">Status</span>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      selectedUser.is_suspended
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-green-100 text-green-700 border-green-200'
                    }`}
                  >
                    {selectedUser.is_suspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
              </div>

              {selectedUser.employer && (
                <div className="p-3 bg-slate-50 rounded-xl border flex items-center gap-3">
                  <Building2 className="text-blue-600" size={18} />
                  <div>
                    <span className="text-xs text-slate-400 block">Employer Company</span>
                    <span className="font-semibold text-slate-800">
                      {selectedUser.employer.company_name}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-xs text-slate-400 block">Email Verified</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-1">
                    {selectedUser.email_verified_at ? (
                      <>
                        <ShieldCheck size={16} className="text-green-600" /> Verified
                      </>
                    ) : (
                      'Unverified'
                    )}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-xs text-slate-400 block">Joined Date</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-1">
                    <Calendar size={16} className="text-blue-600" />
                    {formatDate(selectedUser.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t flex items-center justify-between">
              <button
                onClick={() => setDeletingUser(selectedUser)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete Account
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleSuspend(selectedUser)}
                  disabled={isActionLoading}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    selectedUser.is_suspended
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isActionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : selectedUser.is_suspended ? (
                    <UserCheck size={16} />
                  ) : (
                    <UserX size={16} />
                  )}
                  {selectedUser.is_suspended ? 'Reactivate User' : 'Suspend User'}
                </button>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-red-600">Delete User Account</h3>
              <button onClick={() => setDeletingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete user <strong>"{deletingUser.name}"</strong> (
              {deletingUser.email})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isActionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                {isActionLoading && <Loader2 size={16} className="animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}