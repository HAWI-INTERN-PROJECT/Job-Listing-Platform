import { useState, useEffect, useCallback } from 'react'
import {
  Download,
  MoreHorizontal,
  Search,
  X,
  Loader2,
  FileText,
  Briefcase,
  Inbox,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

export type ApplicationStatusType =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'rejected'
  | 'hired'

interface ApplicantUser {
  id: number
  name: string
  email: string
  username: string
  cv_path?: string | null
}

interface JobPostSummary {
  id: number
  title: string
  slug?: string
  job_type?: string
  job_type_label?: string
}

interface ApplicationItem {
  id: number
  user_id: number
  job_post_id: number
  applicant?: ApplicantUser
  job_post?: JobPostSummary
  cv_path: string | null
  cover_letter: string | null
  status: ApplicationStatusType
  status_label: string
  created_at: string
}

interface StatusCounts {
  all: number
  submitted: number
  under_review: number
  shortlisted: number
  rejected: number
  hired: number
}

interface EmployerJob {
  id: number
  title: string
  status: string
}

const REAL_STATUSES: {
  id: ApplicationStatusType
  label: string
  color: string
  bgLight: string
  border: string
}[] = [
  {
    id: 'submitted',
    label: 'Submitted',
    color: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    id: 'under_review',
    label: 'Under review',
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    id: 'shortlisted',
    label: 'Shortlisted',
    color: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    id: 'rejected',
    label: 'Rejected',
    color: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    id: 'hired',
    label: 'Hired',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
]

function StatusBadge({ status, label }: { status: string; label?: string }) {
  const config = REAL_STATUSES.find((s) => s.id === status)

  const displayLabel =
    label ||
    (status === 'under_review'
      ? 'Under review'
      : status.charAt(0).toUpperCase() + status.slice(1))

  const colorClass = config
    ? `${config.bgLight} ${config.color} ${config.border} border`
    : 'bg-muted text-muted-foreground border border-border'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${colorClass}`}
    >
      {displayLabel}
    </span>
  )
}

export default function JobApplicantsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialJobId = searchParams.get('jobId')

  const [jobs, setJobs] = useState<EmployerJob[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState<number | null>(
    initialJobId ? Number(initialJobId) : null,
  )

  const [applicants, setApplicants] = useState<ApplicationItem[]>([])
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false)
  const [updatingApplicantId, setUpdatingApplicantId] = useState<number | null>(null)

  const [counts, setCounts] = useState<StatusCounts>({
    all: 0,
    submitted: 0,
    under_review: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalApplicants, setTotalApplicants] = useState(0)

  const [openMenu, setOpenMenu] = useState<number | null>(null)

  // Fetch employer's jobs for the dropdown
  useEffect(() => {
    let mounted = true

    const fetchJobs = async () => {
      try {
        setIsLoadingJobs(true)
        const res = await api.get('/employer/jobs')
        const jobList: EmployerJob[] = res.data?.data?.data || res.data?.data || []
        if (mounted) {
          setJobs(jobList)
          if (jobList.length > 0) {
            const targetId = initialJobId ? Number(initialJobId) : jobList[0].id
            const exists = jobList.some((j) => j.id === targetId)
            setSelectedJobId(exists ? targetId : jobList[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load employer jobs:', err)
        toast.error('Failed to load job listings.')
      } finally {
        if (mounted) setIsLoadingJobs(false)
      }
    }

    fetchJobs()

    return () => {
      mounted = false
    }
  }, [initialJobId])

  // Fetch applicants for the selected job
  const fetchApplicants = useCallback(
    async (jobId: number, page: number, status: string, query: string) => {
      try {
        setIsLoadingApplicants(true)
        const params: Record<string, string | number> = {
          page,
          per_page: 10,
        }
        if (status !== 'all') {
          params.status = status
        }
        if (query.trim()) {
          params.search = query.trim()
        }

        const res = await api.get(`/employer/jobs/${jobId}/applicants`, { params })
        const paginatedData = res.data?.data?.data ?? res.data?.data ?? []
        const meta = res.data?.data?.meta ?? res.data?.data ?? {}
        const serverCounts: StatusCounts | undefined = res.data?.data?.counts

        setApplicants(paginatedData)
        setCurrentPage(meta.current_page || 1)
        setTotalPages(meta.last_page || 1)
        setTotalApplicants(meta.total || paginatedData.length)

        if (serverCounts) {
          setCounts(serverCounts)
        }
      } catch (err) {
        console.error('Failed to load applicants:', err)
        toast.error('Failed to load applicants for this job post.')
        setApplicants([])
      } finally {
        setIsLoadingApplicants(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicants(selectedJobId, currentPage, statusFilter, search)
    }
  }, [selectedJobId, currentPage, statusFilter, search, fetchApplicants])

  const handleSelectedJobChange = (jobId: number) => {
    setSelectedJobId(jobId)
    setCurrentPage(1)
    setSearchParams({ jobId: String(jobId) })
  }

  const handleDownloadCV = async (applicant: ApplicationItem) => {
    try {
      toast.info('Downloading applicant CV...')
      const response = await api.get(`/employer/applications/${applicant.id}/cv`, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const name = applicant.applicant?.name
        ? applicant.applicant.name.toLowerCase().replace(/\\s+/g, '-')
        : 'applicant'
      link.download = `${name}-cv-${applicant.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('CV downloaded successfully!')
    } catch (err) {
      console.error('Error downloading CV:', err)
      toast.error('Applicant CV file not found or unavailable.')
    }
  }

  const handleUpdateStatus = async (
    applicantId: number,
    newStatus: ApplicationStatusType,
  ) => {
    try {
      setUpdatingApplicantId(applicantId)
      const res = await api.put(`/employer/applications/${applicantId}/status`, {
        status: newStatus,
      })
      const updated: ApplicationItem = res.data?.data || res.data

      toast.success(`Application status updated to "${updated.status_label || newStatus}".`)

      // Update in local state
      setApplicants((prev) =>
        prev.map((app) => (app.id === applicantId ? { ...app, ...updated } : app)),
      )
      setOpenMenu(null)

      // Refresh data and status counts
      if (selectedJobId) {
        fetchApplicants(selectedJobId, currentPage, statusFilter, search)
      }
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Failed to update application status.')
    } finally {
      setUpdatingApplicantId(null)
    }
  }

  const handleViewProfile = (applicantId: number) => {
    setOpenMenu(null)
    navigate(`/applicant-details?id=${applicantId}`)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const selectedJob = jobs.find((j) => j.id === selectedJobId)

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <EmployerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title="Job Applicants" />

        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Notion Document Header */}
          <div className="border-b border-border/60 pb-5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-foreground text-[11px] font-semibold">
                👥
              </span>
              <span>Hiring Funnel / Candidate Review</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Job Applicants
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Review candidates across all hiring stages: Submitted, Under review, Shortlisted, Rejected, and Hired.
                </p>
              </div>

              <Link to="/my-job-posts">
                <Button variant="outline" size="sm" className="rounded-lg h-8 px-3 text-xs self-start sm:self-auto">
                  <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                  All Job Posts
                </Button>
              </Link>
            </div>
          </div>

          {/* Job Post Selector */}
          <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="job-selector" className="text-xs font-semibold text-muted-foreground sm:w-32">
                Active Listing:
              </label>

              {isLoadingJobs ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading job listings...
                </div>
              ) : jobs.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  You have not posted any jobs yet.{' '}
                  <Link to="/create-job" className="text-foreground font-medium underline">
                    Post a new job
                  </Link>
                </p>
              ) : (
                <select
                  id="job-selector"
                  value={selectedJobId ?? ''}
                  onChange={(e) => handleSelectedJobChange(Number(e.target.value))}
                  className="rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground outline-none sm:max-w-md"
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({job.status})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Funnel Stage Metric Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {/* All Applicants */}
            <div
              className={`rounded-xl border p-3.5 shadow-xs cursor-pointer transition-all ${
                statusFilter === 'all'
                  ? 'border-foreground bg-card ring-1 ring-foreground/20'
                  : 'border-border/70 bg-card hover:border-foreground/20'
              }`}
              onClick={() => {
                setStatusFilter('all')
                setCurrentPage(1)
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">All</span>
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{counts.all}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Total received</p>
            </div>

            {/* Submitted */}
            <div
              className={`rounded-xl border p-3.5 shadow-xs cursor-pointer transition-all ${
                statusFilter === 'submitted'
                  ? 'border-blue-500 bg-card ring-1 ring-blue-500/20'
                  : 'border-border/70 bg-card hover:border-blue-500/40'
              }`}
              onClick={() => {
                setStatusFilter('submitted')
                setCurrentPage(1)
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Submitted</span>
                <Inbox className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{counts.submitted}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">New applications</p>
            </div>

            {/* Under review */}
            <div
              className={`rounded-xl border p-3.5 shadow-xs cursor-pointer transition-all ${
                statusFilter === 'under_review'
                  ? 'border-amber-500 bg-card ring-1 ring-amber-500/20'
                  : 'border-border/70 bg-card hover:border-amber-500/40'
              }`}
              onClick={() => {
                setStatusFilter('under_review')
                setCurrentPage(1)
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Under review</span>
                <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{counts.under_review}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Screening candidates</p>
            </div>

            {/* Shortlisted */}
            <div
              className={`rounded-xl border p-3.5 shadow-xs cursor-pointer transition-all ${
                statusFilter === 'shortlisted'
                  ? 'border-purple-500 bg-card ring-1 ring-purple-500/20'
                  : 'border-border/70 bg-card hover:border-purple-500/40'
              }`}
              onClick={() => {
                setStatusFilter('shortlisted')
                setCurrentPage(1)
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">Shortlisted</span>
                <Star className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">{counts.shortlisted}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Interview stage</p>
            </div>

            {/* Rejected */}
            <div
              className={`rounded-xl border p-3.5 shadow-xs cursor-pointer transition-all ${
                statusFilter === 'rejected'
                  ? 'border-rose-500 bg-card ring-1 ring-rose-500/20'
                  : 'border-border/70 bg-card hover:border-rose-500/40'
              }`}
              onClick={() => {
                setStatusFilter('rejected')
                setCurrentPage(1)
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Rejected</span>
                <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{counts.rejected}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Not selected</p>
            </div>

            {/* Hired */}
            <div
              className={`rounded-xl border p-3.5 shadow-xs cursor-pointer transition-all ${
                statusFilter === 'hired'
                  ? 'border-emerald-500 bg-card ring-1 ring-emerald-500/20'
                  : 'border-border/70 bg-card hover:border-emerald-500/40'
              }`}
              onClick={() => {
                setStatusFilter('hired')
                setCurrentPage(1)
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Hired</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{counts.hired}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Offer accepted</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-lg border border-border/80 bg-muted/30 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                placeholder="Search candidate name, email, or username..."
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1.5 text-xs text-foreground outline-none"
              >
                <option value="all">All Statuses ({counts.all})</option>
                <option value="submitted">Submitted ({counts.submitted})</option>
                <option value="under_review">Under review ({counts.under_review})</option>
                <option value="shortlisted">Shortlisted ({counts.shortlisted})</option>
                <option value="rejected">Rejected ({counts.rejected})</option>
                <option value="hired">Hired ({counts.hired})</option>
              </select>

              {(search || statusFilter !== 'all') && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="rounded-lg h-7 px-2 text-xs"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Applicants Table */}
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Applicants for: <span className="font-bold">{selectedJob?.title ?? 'Selected Job'}</span>
              </h3>
              <span className="text-xs text-muted-foreground">
                {totalApplicants} {totalApplicants === 1 ? 'applicant' : 'applicants'} found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3">Applicant</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Applied Date</th>
                    <th className="px-5 py-3">Curriculum Vitae</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Update Stage</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/50">
                  {isLoadingApplicants ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2 text-muted-foreground" />
                        Loading applicants...
                      </td>
                    </tr>
                  ) : applicants.length > 0 ? (
                    applicants.map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/applicant-details?id=${applicant.id}`}
                            className="font-semibold text-foreground hover:underline"
                          >
                            {applicant.applicant?.name || `Applicant #${applicant.id}`}
                          </Link>
                          {applicant.applicant?.username && (
                            <p className="text-[10px] text-muted-foreground">
                              @{applicant.applicant.username}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-muted-foreground">
                          {applicant.applicant?.email || 'N/A'}
                        </td>

                        <td className="px-5 py-3.5 text-muted-foreground">
                          {applicant.created_at
                            ? new Date(applicant.created_at).toLocaleDateString()
                            : 'N/A'}
                        </td>

                        <td className="px-5 py-3.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadCV(applicant)}
                            className="h-7 px-2 text-xs rounded-lg"
                          >
                            <Download className="mr-1 h-3.5 w-3.5" />
                            Download CV
                          </Button>
                        </td>

                        <td className="px-5 py-3.5">
                          <StatusBadge status={applicant.status} label={applicant.status_label} />
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {updatingApplicantId === applicant.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            ) : null}
                            <select
                              value={applicant.status}
                              disabled={updatingApplicantId === applicant.id}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  applicant.id,
                                  e.target.value as ApplicationStatusType,
                                )
                              }
                              className="rounded-lg border border-border/80 bg-muted/30 px-2 py-1 text-xs font-medium text-foreground outline-none"
                            >
                              <option value="submitted">Submitted</option>
                              <option value="under_review">Under review</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                              <option value="hired">Hired</option>
                            </select>
                          </div>
                        </td>

                        <td className="relative px-5 py-3.5 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              setOpenMenu(openMenu === applicant.id ? null : applicant.id)
                            }
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>

                          {openMenu === applicant.id && (
                            <div className="absolute right-5 top-11 z-30 w-48 rounded-xl border border-border/80 bg-popover text-popover-foreground p-1.5 shadow-xl text-left backdrop-blur-xs">
                              <button
                                type="button"
                                onClick={() => handleViewProfile(applicant.id)}
                                className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium hover:bg-muted flex items-center gap-2 text-foreground transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                View Profile
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadCV(applicant)}
                                className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium hover:bg-muted flex items-center gap-2 text-foreground transition-colors"
                              >
                                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                                Download CV
                              </button>

                              <div className="my-1 border-t border-border/60" />

                              <p className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Set Status
                              </p>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(applicant.id, 'shortlisted')}
                                className="w-full rounded-lg px-2.5 py-1 text-left text-xs hover:bg-muted flex items-center gap-1.5 text-purple-600 dark:text-purple-400"
                              >
                                <Star className="h-3 w-3" />
                                Shortlisted
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(applicant.id, 'hired')}
                                className="w-full rounded-lg px-2.5 py-1 text-left text-xs hover:bg-muted flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Hired
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(applicant.id, 'rejected')}
                                className="w-full rounded-lg px-2.5 py-1 text-left text-xs hover:bg-muted flex items-center gap-1.5 text-rose-600 dark:text-rose-400"
                              >
                                <XCircle className="h-3 w-3" />
                                Rejected
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                        No applicants found for this job post matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-2.5 border-t border-border/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between text-xs">
                <p className="text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
                  <span className="font-semibold text-foreground">{totalPages}</span> ({totalApplicants} total applicants)
                </p>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs rounded-lg"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs rounded-lg"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
