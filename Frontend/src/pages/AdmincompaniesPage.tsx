import { useEffect, useState, useCallback } from 'react'
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

  const fetchCompanies = useCallback(async (searchTerm = search) => {
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
    } catch {
      setErrorMessage('Failed to load companies list.')
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

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
      {/* Notion Document Header */}
      <div className="border-b border-border/60 pb-5 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-foreground text-[11px] font-semibold">
            🏢
          </span>
          <span>Companies Directory / Employer Verification</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Company Directory & Moderation
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Review employer accounts, verify business registration, and manage company approval statuses.
            </p>
          </div>

          <button
            onClick={() => fetchCompanies()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/80 bg-card hover:bg-muted text-foreground transition-colors self-start sm:self-auto"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/70 bg-card p-4.5 shadow-xs space-y-2 hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Companies</span>
            <div className="p-2 rounded-lg bg-muted text-foreground">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">{stats.total_companies}</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4.5 shadow-xs space-y-2 hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Approved Companies</span>
            <div className="p-2 rounded-lg bg-muted text-foreground">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{stats.approved_companies}</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4.5 shadow-xs space-y-2 hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Review</span>
            <div className="p-2 rounded-lg bg-muted text-foreground">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{stats.pending_companies}</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4.5 shadow-xs space-y-2 hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Jobs Posted</span>
            <div className="p-2 rounded-lg bg-muted text-foreground">
              <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">{stats.total_jobs}</p>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by company name, email, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border/80 bg-muted/30 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1.5 text-xs text-foreground outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Companies Table */}
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2.5 text-xs text-muted-foreground font-medium">Loading companies...</span>
          </div>
        ) : companies.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-semibold text-foreground">No companies found</p>
            <p className="text-xs text-muted-foreground mt-0.5">Try clearing search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Industry / Location</th>
                  <th className="px-5 py-3">Jobs Posted</th>
                  <th className="px-5 py-3">Verification Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted font-bold text-xs text-foreground">
                          {c.logo ? (
                            <img
                              src={c.logo.startsWith("http") ? c.logo : `/storage/${c.logo}`}
                              alt={c.company_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            c.company_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{c.company_name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.email || c.user?.email || "No email"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-muted-foreground">
                      <p className="font-medium text-foreground">{c.industry || "Not specified"}</p>
                      <p className="text-[10px] text-muted-foreground">{c.location || "Location not set"}</p>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-foreground">
                      {c.job_posts_count ?? 0} jobs
                    </td>

                    <td className="px-5 py-3.5">
                      {c.approval_status === "approved" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle size={11} /> Approved
                        </span>
                      ) : c.approval_status === "rejected" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <XCircle size={11} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock size={11} /> Pending Review
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(c)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>

                        {c.approval_status !== "approved" && (
                          <button
                            onClick={() => handleStatusUpdate(c.id, "approved")}
                            disabled={actionLoadingId === c.id}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                            title="Approve Company"
                          >
                            Approve
                          </button>
                        )}

                        {c.approval_status !== "rejected" && (
                          <button
                            onClick={() => handleStatusUpdate(c.id, "rejected")}
                            disabled={actionLoadingId === c.id}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                            title="Reject Company"
                          >
                            Reject
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteTargetId(c.id)}
                          className="rounded-lg p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Company"
                        >
                          <Trash2 size={15} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-xl bg-card border border-border p-6 shadow-2xl space-y-5 text-foreground max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted text-lg font-bold text-foreground">
                  {selectedCompany.logo ? (
                    <img
                      src={
                        selectedCompany.logo.startsWith("http")
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
                  <h3 className="text-base font-bold text-foreground">{selectedCompany.company_name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedCompany.industry || "Industry not set"}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCompany(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            {isDetailLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-xs text-muted-foreground">Loading details...</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl border border-border/60">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedCompany.email || selectedCompany.user?.email || "N/A"}</span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl border border-border/60">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedCompany.phone || "N/A"}</span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl border border-border/60">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedCompany.location || "N/A"}</span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl border border-border/60">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {selectedCompany.website ? (
                      <a
                        href={selectedCompany.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {selectedCompany.website}
                      </a>
                    ) : (
                      <span className="text-foreground">N/A</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Account Owner</h4>
                  <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3 border border-border/60 text-foreground">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedCompany.user?.name || "Owner User"}</span>
                    <span className="text-muted-foreground">({selectedCompany.user?.email})</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">About Organization</h4>
                  <p className="leading-relaxed text-muted-foreground p-3 bg-muted/30 rounded-xl border border-border/60">
                    {selectedCompany.description || "No description provided."}
                  </p>
                </div>

                {selectedCompany.job_posts && selectedCompany.job_posts.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Jobs Posted ({selectedCompany.job_posts.length})</h4>
                    <ul className="divide-y divide-border/60 rounded-xl border border-border/60 max-h-40 overflow-y-auto">
                      {selectedCompany.job_posts.map((j) => (
                        <li key={j.id} className="flex items-center justify-between p-2.5 hover:bg-muted/30 transition-colors">
                          <span className="font-medium text-foreground">{j.title}</span>
                          <span className="capitalize text-muted-foreground">{j.status.replace("_", " ")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                  {selectedCompany.approval_status !== "approved" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedCompany.id, "approved")}
                      className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                      Approve Profile
                    </button>
                  )}

                  {selectedCompany.approval_status !== "rejected" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedCompany.id, "rejected")}
                      className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
                    >
                      Reject Profile
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="rounded-lg border border-border/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4 text-foreground">
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Delete Company Profile?</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete this company profile? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="rounded-lg border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCompany(deleteTargetId)}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
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
