import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Eye,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  User,
  XCircle,
} from 'lucide-react'
import api from '@/lib/api'

type CompanyUser = {
  id: number
  name: string
  email: string
}

type JobPostItem = {
  id: number
  title: string
  job_type: string
  status: string
  created_at: string
}

type EmployerCompany = {
  id: number
  company_name: string
  email: string | null
  phone: string | null
  location: string | null
  website: string | null
  industry: string | null
  company_size: string | null
  description: string | null
  logo: string | null
  approval_status: 'approved' | 'pending' | 'rejected'
  job_posts_count?: number
  user?: CompanyUser
  job_posts?: JobPostItem[]
  created_at: string
}

type Stats = {
  total_companies: number
  approved_companies: number
  pending_companies: number
  rejected_companies: number
  total_jobs: number
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<EmployerCompany[]>([])
  const [stats, setStats] = useState<Stats>({
    total_companies: 0,
    approved_companies: 0,
    pending_companies: 0,
    rejected_companies: 0,
    total_jobs: 0,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [selectedCompany, setSelectedCompany] = useState<EmployerCompany | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [statusFilter])

  async function fetchCompanies(searchTerm = search) {
    try {
      setIsLoading(true)
      const params: Record<string, string> = {}
      if (searchTerm) params.search = searchTerm
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter

      const res = await api.get('/admin/companies', { params })

      if (res.data.success) {
        const payload = res.data.data
        setCompanies(payload.companies?.data || payload.companies || [])
        if (payload.stats) {
          setStats(payload.stats)
        }
      }
    } catch (err: any) {
      setErrorMessage('Failed to load companies list.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    fetchCompanies(search)
  }

  async function handleStatusUpdate(id: number, newStatus: 'approved' | 'rejected') {
    try {
      setActionLoadingId(id)
      setMessage('')
      setErrorMessage('')

      const endpoint = newStatus === 'approved' ? `/admin/companies/${id}/approve` : `/admin/companies/${id}/reject`
      const res = await api.post(endpoint)

      if (res.data.success) {
        setMessage(`Company profile ${newStatus} successfully.`)
        fetchCompanies()

        if (selectedCompany?.id === id) {
          setSelectedCompany((prev) => (prev ? { ...prev, approval_status: newStatus } : null))
        }

        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to update status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDeleteCompany(id: number) {
    try {
      setActionLoadingId(id)
      const res = await api.delete(`/admin/companies/${id}`)

      if (res.data.success) {
        setMessage('Company profile deleted successfully.')
        setDeleteTargetId(null)
        if (selectedCompany?.id === id) {
          setSelectedCompany(null)
        }
        fetchCompanies()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete company profile.')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleViewDetails(company: EmployerCompany) {
    try {
      setSelectedCompany(company)
      setIsDetailLoading(true)
      const res = await api.get(`/admin/companies/${company.id}`)
      if (res.data.success) {
        setSelectedCompany(res.data.data)
      }
    } catch (err: any) {
      console.error('Failed to load company detail', err)
    } finally {
      setIsDetailLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Companies Management</h2>
          <p className="text-sm text-slate-500">
            Review, verify, and manage employer accounts registered on the platform.
          </p>
        </div>

        <button
          onClick={() => fetchCompanies()}
          className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Companies</span>
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total_companies}</p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Approved Companies</span>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.approved_companies}</p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Pending Review</span>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{stats.pending_companies}</p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Jobs Posted</span>
            <Building2 className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total_jobs}</p>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="h-5 w-5" />
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {errorMessage}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name, email, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Companies Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-sm text-slate-500">Loading companies...</span>
          </div>
        ) : companies.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-base font-medium">No companies found</p>
            <p className="text-sm text-slate-400">Try clearing search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Industry / Location</th>
                  <th className="px-6 py-4">Jobs Posted</th>
                  <th className="px-6 py-4">Verification Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-blue-50 font-bold text-blue-600">
                          {c.logo ? (
                            <img
                              src={c.logo.startsWith('http') ? c.logo : `/storage/${c.logo}`}
                              alt={c.company_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            c.company_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{c.company_name}</p>
                          <p className="text-xs text-slate-500">{c.email || c.user?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{c.industry || 'Not specified'}</p>
                      <p className="text-xs text-slate-500">{c.location || 'Location not set'}</p>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700">
                      {c.job_posts_count ?? 0} jobs
                    </td>

                    <td className="px-6 py-4">
                      {c.approval_status === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle size={12} /> Approved
                        </span>
                      ) : c.approval_status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          <XCircle size={12} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          <Clock size={12} /> Pending Review
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(c)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>

                        {c.approval_status !== 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(c.id, 'approved')}
                            disabled={actionLoadingId === c.id}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            title="Approve Company"
                          >
                            Approve
                          </button>
                        )}

                        {c.approval_status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusUpdate(c.id, 'rejected')}
                            disabled={actionLoadingId === c.id}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100"
                            title="Reject Company"
                          >
                            Reject
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteTargetId(c.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete Company"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border bg-blue-50 text-xl font-bold text-blue-600">
                  {selectedCompany.logo ? (
                    <img
                      src={
                        selectedCompany.logo.startsWith('http')
                          ? selectedCompany.logo
                          : `/storage/${selectedCompany.logo}`
                      }
                      alt={selectedCompany.company_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    selectedCompany.company_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedCompany.company_name}</h3>
                  <p className="text-sm text-slate-500">{selectedCompany.industry || 'Industry not set'}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCompany(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {isDetailLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-slate-500">Loading details...</span>
              </div>
            ) : (
              <div className="space-y-5 text-sm text-slate-700">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{selectedCompany.email || selectedCompany.user?.email || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{selectedCompany.phone || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{selectedCompany.location || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400" />
                    {selectedCompany.website ? (
                      <a
                        href={selectedCompany.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedCompany.website}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900">Account Owner</h4>
                  <div className="mt-1 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-slate-700">
                    <User className="h-4 w-4 text-slate-500" />
                    <span>{selectedCompany.user?.name || 'Owner User'}</span>
                    <span className="text-slate-400">({selectedCompany.user?.email})</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900">About Organization</h4>
                  <p className="mt-1 leading-relaxed text-slate-600">
                    {selectedCompany.description || 'No description provided.'}
                  </p>
                </div>

                {selectedCompany.job_posts && selectedCompany.job_posts.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900">Jobs Posted ({selectedCompany.job_posts.length})</h4>
                    <ul className="mt-2 divide-y rounded-lg border max-h-40 overflow-y-auto">
                      {selectedCompany.job_posts.map((j) => (
                        <li key={j.id} className="flex items-center justify-between p-3 text-xs">
                          <span className="font-medium text-slate-900">{j.title}</span>
                          <span className="capitalize text-slate-500">{j.status.replace('_', ' ')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 border-t pt-4">
                  {selectedCompany.approval_status !== 'approved' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedCompany.id, 'approved')}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Approve Profile
                    </button>
                  )}

                  {selectedCompany.approval_status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedCompany.id, 'rejected')}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Reject Profile
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Delete Company Profile?</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete this company profile? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCompany(deleteTargetId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}