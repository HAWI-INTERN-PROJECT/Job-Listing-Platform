import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Eye,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  User as UserIcon,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface ApplicantInfo {
  id: number
  name: string
  email: string
  username: string
  cv_path: string | null
}

interface EmployerInfo {
  id: number
  company_name: string
  logo: string | null
}

interface JobPostInfo {
  id: number
  title: string
  slug: string
  job_type: string
  job_type_label: string
  location: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  employer?: EmployerInfo
}

interface ApplicationItem {
  id: number
  user_id: number
  job_post_id: number
  applicant?: ApplicantInfo
  job_post?: JobPostInfo
  cv_path: string | null
  cover_letter: string | null
  status: string
  status_label: string
  created_at: string
}

interface PaginatedApplicationsResponse {
  data: ApplicationItem[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

const STATUS_TABS = [
  { id: 'all', label: 'All Applications' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
]

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [lastPage, setLastPage] = useState<number>(1)
  const [totalApplications, setTotalApplications] = useState<number>(0)

  // Modals state
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null)
  const [deletingApp, setDeletingApp] = useState<ApplicationItem | null>(null)
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false)

  const fetchApplications = useCallback(async (page: number, status: string, search: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const params: Record<string, string | number> = { page }
      if (status !== 'all') {
        params.status = status
      }
      if (search.trim()) {
        params.search = search.trim()
      }

      const response = await api.get('/admin/applications', { params })
      const resData = response.data?.data ?? response.data
      const paginated: PaginatedApplicationsResponse = resData.data ? resData : resData

      setApplications(paginated.data || [])
      setCurrentPage(paginated.current_page || 1)
      setLastPage(paginated.last_page || 1)
      setTotalApplications(paginated.total || 0)
    } catch (err: unknown) {
      console.error('Failed to load applications:', err)
      setError('Failed to fetch job applications. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications(currentPage, statusFilter, searchQuery)
  }, [currentPage, statusFilter, searchQuery, fetchApplications])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    setSearchQuery(searchInput)
  }

  const handleStatusTabChange = (statusId: string) => {
    setStatusFilter(statusId)
    setCurrentPage(1)
  }

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    try {
      setIsActionLoading(true)
      const response = await api.patch(`/admin/applications/${appId}/status`, {
        status: newStatus,
      })
      const updatedApp: ApplicationItem = response.data?.data ?? response.data

      toast.success(`Application status updated to "${updatedApp.status_label || newStatus}".`)

      if (selectedApp?.id === appId) {
        setSelectedApp(updatedApp)
      }

      fetchApplications(currentPage, statusFilter, searchQuery)
    } catch (err: unknown) {
      console.error('Failed to update application status:', err)
      toast.error('Failed to update application status.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingApp) return
    try {
      setIsActionLoading(true)
      await api.delete(`/admin/applications/${deletingApp.id}`)
      toast.success('Application record deleted successfully.')
      setDeletingApp(null)
      if (selectedApp?.id === deletingApp.id) {
        setSelectedApp(null)
      }
      fetchApplications(currentPage, statusFilter, searchQuery)
    } catch (err: unknown) {
      console.error('Failed to delete application:', err)
      toast.error('Failed to delete application record.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDownloadCv = async (app: ApplicationItem) => {
    try {
      const response = await api.get(`/admin/applications/${app.id}/download-cv`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `cv_${app.applicant?.name || 'applicant'}_${app.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('CV downloaded successfully!')
    } catch (err: unknown) {
      console.error('Failed to download CV:', err)
      toast.error('CV file unavailable for download.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'under_review':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'shortlisted':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'hired':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const formatDate = (dateStr?: string) => {
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
          <h2 className="text-xl font-bold text-slate-900">Job Applications</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage candidate job applications across all platform listings ({totalApplications} total)
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search applicant, job, company..."
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
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleStatusTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50/70 text-slate-500 font-medium">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Applied Job</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={24} />
                      <p className="text-sm font-medium">Loading applications...</p>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <p className="text-base font-semibold text-slate-700">No applications found</p>
                    <p className="text-sm mt-1">Try selecting another filter tab or search term.</p>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="border-b last:border-0 hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center border border-blue-200">
                          {app.applicant?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{app.applicant?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{app.applicant?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-800">
                      {app.job_post?.title || 'Job Listing'}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {app.job_post?.employer?.company_name || 'N/A'}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status_label || app.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">{formatDate(app.created_at)}</td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Download CV */}
                        <button
                          onClick={() => handleDownloadCv(app)}
                          title="Download CV"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <Download size={16} />
                        </button>

                        {/* View Details */}
                        <button
                          onClick={() => setSelectedApp(app)}
                          title="View Application Details"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Delete Application */}
                        <button
                          onClick={() => setDeletingApp(app)}
                          title="Delete Application Record"
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
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

      {/* Application Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 p-6 space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-2 ${getStatusBadge(selectedApp.status)}`}>
                  {selectedApp.status_label || selectedApp.status}
                </span>
                <h3 className="text-xl font-bold text-slate-900">Application Review</h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  Applied for <span className="font-semibold text-slate-800">{selectedApp.job_post?.title}</span> at{' '}
                  <span className="font-semibold text-blue-600">{selectedApp.job_post?.employer?.company_name || 'N/A'}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Applicant Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-sm border">
              <div>
                <span className="text-slate-400 text-xs block">Applicant Name</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <UserIcon size={14} className="text-blue-600" />
                  {selectedApp.applicant?.name}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Email Address</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Mail size={14} className="text-blue-600" />
                  {selectedApp.applicant?.email}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Applied Date</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar size={14} className="text-blue-600" />
                  {formatDate(selectedApp.created_at)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Curriculum Vitae</span>
                <button
                  onClick={() => handleDownloadCv(selectedApp)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mt-1"
                >
                  <Download size={13} /> Download CV Document
                </button>
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" /> Cover Letter
              </h4>
              <div className="p-4 bg-slate-50 rounded-xl border text-sm text-slate-700 whitespace-pre-line leading-relaxed min-h-[100px]">
                {selectedApp.cover_letter || 'No cover letter submitted.'}
              </div>
            </div>

            {/* Status Modification Actions */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Update Application Status</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'submitted', label: 'Submitted', color: 'hover:bg-blue-50 text-blue-700' },
                  { id: 'under_review', label: 'Under Review', color: 'hover:bg-amber-50 text-amber-700' },
                  { id: 'shortlisted', label: 'Shortlist Candidate', color: 'hover:bg-purple-50 text-purple-700' },
                  { id: 'hired', label: 'Hire Candidate', color: 'hover:bg-emerald-50 text-emerald-700' },
                  { id: 'rejected', label: 'Reject Candidate', color: 'hover:bg-red-50 text-red-700' },
                ].map((st) => {
                  const isCurrent = selectedApp.status === st.id
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleUpdateStatus(selectedApp.id, st.id)}
                      disabled={isActionLoading || isCurrent}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-slate-900 text-white border-slate-900'
                          : `bg-white ${st.color} border-slate-200`
                      }`}
                    >
                      {isCurrent && <CheckCircle size={12} />}
                      {st.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t flex items-center justify-between">
              <button
                onClick={() => setDeletingApp(selectedApp)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete Application
              </button>

              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-red-600">Delete Application Record</h3>
              <button onClick={() => setDeletingApp(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to delete the application submitted by{' '}
              <strong>"{deletingApp.applicant?.name}"</strong> for{' '}
              <strong>"{deletingApp.job_post?.title}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingApp(null)}
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