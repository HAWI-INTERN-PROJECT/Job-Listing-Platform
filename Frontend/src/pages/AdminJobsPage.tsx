import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface EmployerInfo {
  id: number
  company_name: string
  logo: string | null
  website: string | null
  location: string | null
}

interface CategoryInfo {
  id: number
  name: string
  slug: string
}

interface JobItem {
  id: number
  employer_id: number
  category_id: number
  title: string
  slug: string
  description: string
  requirements: string[]
  responsibilities: string[]
  job_type: string
  job_type_label: string
  experience_level: string
  experience_level_label: string
  location: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  is_remote: boolean
  status: string
  status_label: string
  rejection_reason?: string
  published_at?: string
  views_count: number
  applications_count: number
  created_at: string
  employer?: EmployerInfo
  category?: CategoryInfo
}

interface PaginatedJobsResponse {
  data: JobItem[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

const STATUS_TABS = [
  { id: 'all', label: 'All Jobs' },
  { id: 'pending_approval', label: 'Pending Approval' },
  { id: 'published', label: 'Published' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'closed', label: 'Closed' },
  { id: 'draft', label: 'Draft' },
]

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [lastPage, setLastPage] = useState<number>(1)
  const [totalJobs, setTotalJobs] = useState<number>(0)

  // Modals state
  const [reviewJob, setReviewJob] = useState<JobItem | null>(null)
  const [rejectingJob, setRejectingJob] = useState<JobItem | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [deletingJob, setDeletingJob] = useState<JobItem | null>(null)
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false)

  const fetchJobs = useCallback(async (page: number, status: string, search: string) => {
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

      const response = await api.get('/admin/jobs', { params })
      const resData = response.data?.data ?? response.data
      const paginated: PaginatedJobsResponse = resData.data ? resData : resData

      setJobs(paginated.data || [])
      setCurrentPage(paginated.current_page || 1)
      setLastPage(paginated.last_page || 1)
      setTotalJobs(paginated.total || 0)
    } catch (err: unknown) {
      console.error('Failed to load jobs:', err)
      setError('Failed to fetch job posts. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs(currentPage, statusFilter, searchQuery)
  }, [currentPage, statusFilter, searchQuery, fetchJobs])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    setSearchQuery(searchInput)
  }

  const handleStatusTabChange = (statusId: string) => {
    setStatusFilter(statusId)
    setCurrentPage(1)
  }

  const handleApprove = async (job: JobItem) => {
    try {
      setIsActionLoading(true)
      await api.post(`/admin/jobs/${job.id}/approve`)
      toast.success(`"${job.title}" approved and published successfully!`)
      if (reviewJob?.id === job.id) {
        setReviewJob(null)
      }
      fetchJobs(currentPage, statusFilter, searchQuery)
    } catch (err: unknown) {
      console.error('Failed to approve job:', err)
      toast.error('Failed to approve job post.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingJob) return
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejecting the job post.')
      return
    }

    try {
      setIsActionLoading(true)
      await api.post(`/admin/jobs/${rejectingJob.id}/reject`, {
        reason: rejectionReason.trim(),
      })
      toast.success(`"${rejectingJob.title}" rejected with feedback.`)
      setRejectingJob(null)
      setRejectionReason('')
      if (reviewJob?.id === rejectingJob.id) {
        setReviewJob(null)
      }
      fetchJobs(currentPage, statusFilter, searchQuery)
    } catch (err: unknown) {
      console.error('Failed to reject job:', err)
      toast.error('Failed to reject job post.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingJob) return
    try {
      setIsActionLoading(true)
      await api.delete(`/admin/jobs/${deletingJob.id}`)
      toast.success(`Job "${deletingJob.title}" has been deleted.`)
      setDeletingJob(null)
      if (reviewJob?.id === deletingJob.id) {
        setReviewJob(null)
      }
      fetchJobs(currentPage, statusFilter, searchQuery)
    } catch (err: unknown) {
      console.error('Failed to delete job:', err)
      toast.error('Failed to delete job post.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending_approval':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'closed':
        return 'bg-slate-200 text-slate-700 border-slate-300'
      case 'draft':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Job Post Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review, approve, reject, or remove job listings submitted across the platform ({totalJobs} total)
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search title or company..."
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

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50/70 text-slate-500 font-medium">
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Type / Location</th>
                <th className="px-6 py-4">Applicants</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={24} />
                      <p className="text-sm font-medium">Loading job listings...</p>
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <p className="text-base font-semibold text-slate-700">No job posts found</p>
                    <p className="text-sm mt-1">Try clearing filters or adjusting your search term.</p>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-b last:border-0 hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 max-w-[220px] truncate">
                      {job.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {job.employer?.company_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {job.category?.name || 'General'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span>{job.job_type_label || job.job_type}</span>
                      {job.location && (
                        <span className="block text-xs text-slate-400 mt-0.5">{job.location}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {job.applications_count}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          job.status
                        )}`}
                      >
                        {job.status_label || job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Review/View Modal Trigger */}
                        <button
                          onClick={() => setReviewJob(job)}
                          title="Review Job Details"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Approve Action (Only for pending) */}
                        {job.status === 'pending_approval' && (
                          <button
                            onClick={() => handleApprove(job)}
                            disabled={isActionLoading}
                            title="Approve & Publish"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}

                        {/* Reject Action (Only for pending) */}
                        {job.status === 'pending_approval' && (
                          <button
                            onClick={() => {
                              setRejectingJob(job)
                              setRejectionReason('')
                            }}
                            disabled={isActionLoading}
                            title="Reject Job"
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <XCircle size={18} />
                          </button>
                        )}

                        {/* Remove / Delete Action */}
                        <button
                          onClick={() => setDeletingJob(job)}
                          disabled={isActionLoading}
                          title="Remove Job Listing"
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={18} />
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

      {/* Review Modal */}
      {reviewJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 p-6 space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-2 ${getStatusBadge(reviewJob.status)}`}>
                  {reviewJob.status_label || reviewJob.status}
                </span>
                <h3 className="text-2xl font-bold text-slate-900">{reviewJob.title}</h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" />
                  <span className="font-semibold text-slate-700">{reviewJob.employer?.company_name || 'N/A'}</span>
                </p>
              </div>

              <button
                onClick={() => setReviewJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Rejection notice if present */}
            {reviewJob.status === 'rejected' && reviewJob.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                <p className="font-bold">Rejection Feedback:</p>
                <p className="mt-1">{reviewJob.rejection_reason}</p>
              </div>
            )}

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-sm border">
              <div>
                <span className="text-slate-400 text-xs block">Job Type</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                  <Briefcase size={14} className="text-blue-600" />
                  {reviewJob.job_type_label || reviewJob.job_type}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Location</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                  <MapPin size={14} className="text-blue-600" />
                  {reviewJob.location || (reviewJob.is_remote ? 'Remote' : 'On-site')}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Salary</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                  <DollarSign size={14} className="text-green-600" />
                  {reviewJob.salary_min && reviewJob.salary_max
                    ? `${reviewJob.salary_min.toLocaleString()} - ${reviewJob.salary_max.toLocaleString()} ${reviewJob.salary_currency}`
                    : 'Negotiable'}
                </span>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Job Description</h4>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                {reviewJob.description}
              </p>
            </div>

            {/* Requirements */}
            {reviewJob.requirements && reviewJob.requirements.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Requirements</h4>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {reviewJob.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {reviewJob.responsibilities && reviewJob.responsibilities.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Responsibilities</h4>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {reviewJob.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t flex items-center justify-between">
              <button
                onClick={() => {
                  setDeletingJob(reviewJob)
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete Listing
              </button>

              <div className="flex items-center gap-3">
                {reviewJob.status === 'pending_approval' && (
                  <>
                    <button
                      onClick={() => {
                        setRejectingJob(reviewJob)
                        setRejectionReason('')
                      }}
                      className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => handleApprove(reviewJob)}
                      disabled={isActionLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isActionLoading && <Loader2 size= {16} className="animate-spin" />}
                      Approve & Publish
                    </button>
                  </>
                )}

                <button
                  onClick={() => setReviewJob(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Reject Job Listing</h3>
              <button onClick={() => setRejectingJob(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Provide feedback detailing why <strong>"{rejectingJob.title}"</strong> is being rejected:
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please clarify job location requirements and salary details."
                className="w-full p-3 text-sm border rounded-xl outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingJob(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isActionLoading && <Loader2 size={16} className="animate-spin" />}
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-red-600">Delete Job Post</h3>
              <button onClick={() => setDeletingJob(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to delete the job post <strong>"{deletingJob.title}"</strong>? This action will remove the listing from the platform.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingJob(null)}
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