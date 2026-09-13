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
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

export const REAL_STATUSES: {
  id: ApplicationStatusType
  label: string
  color: string
  bgLight: string
  border: string
}[] = [
  {
    id: 'submitted',
    label: 'Submitted',
    color: 'text-blue-700 dark:text-blue-300',
    bgLight: 'bg-blue-100 dark:bg-blue-950/60',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'under_review',
    label: 'Under review',
    color: 'text-amber-700 dark:text-amber-300',
    bgLight: 'bg-amber-100 dark:bg-amber-950/60',
    border: 'border-amber-200 dark:border-amber-800',
  },
  {
    id: 'shortlisted',
    label: 'Shortlisted',
    color: 'text-purple-700 dark:text-purple-300',
    bgLight: 'bg-purple-100 dark:bg-purple-950/60',
    border: 'border-purple-200 dark:border-purple-800',
  },
  {
    id: 'rejected',
    label: 'Rejected',
    color: 'text-red-700 dark:text-red-300',
    bgLight: 'bg-red-100 dark:bg-red-950/60',
    border: 'border-red-200 dark:border-red-800',
  },
  {
    id: 'hired',
    label: 'Hired',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgLight: 'bg-emerald-100 dark:bg-emerald-950/60',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
]

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const config = REAL_STATUSES.find((s) => s.id === status)

  const displayLabel =
    label ||
    (status === 'under_review'
      ? 'Under review'
      : status.charAt(0).toUpperCase() + status.slice(1))

  const colorClass = config
    ? `${config.bgLight} ${config.color} ${config.border} border`
    : 'bg-muted text-muted-foreground border'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}
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
        ? applicant.applicant.name.toLowerCase().replace(/\s+/g, '-')
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
    <div className="min-h-screen bg-muted/40 md:flex">
      <EmployerSidebar />

      <div className="min-w-0 flex-1">
        <EmployerHeader title="Job Applicants" />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Job Applicants</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review candidates across all hiring stages: Submitted, Under review, Shortlisted, Rejected, and Hired.
              </p>
            </div>
            <Link to="/my-job-posts">
              <Button variant="outline" size="sm">
                <Briefcase className="mr-2 h-4 w-4" />
                All Job Posts
              </Button>
            </Link>
          </div>

          {/* Job Post Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label htmlFor="job-selector" className="text-sm font-medium sm:w-32">
                  Select Job Post:
                </label>

                {isLoadingJobs ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading your jobs...
                  </div>
                ) : jobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    You have not posted any jobs yet.{' '}
                    <Link to="/create-job" className="text-primary underline">
                      Post a new job
                    </Link>
                  </p>
                ) : (
                  <select
                    id="job-selector"
                    value={selectedJobId ?? ''}
                    onChange={(e) => handleSelectedJobChange(Number(e.target.value))}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm font-medium sm:max-w-md"
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} ({job.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Real Scenario Status Cards */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {/* All Applicants */}
            <Card
              className={`cursor-pointer transition hover:border-primary ${
                statusFilter === 'all' ? 'border-primary ring-1 ring-primary' : ''
              }`}
              onClick={() => {
                setStatusFilter('all')
                setCurrentPage(1)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">All</p>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold">{counts.all}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Total received</p>
              </CardContent>
            </Card>

            {/* Submitted */}
            <Card
              className={`cursor-pointer transition hover:border-blue-500 ${
                statusFilter === 'submitted' ? 'border-blue-500 ring-1 ring-blue-500' : ''
              }`}
              onClick={() => {
                setStatusFilter('submitted')
                setCurrentPage(1)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Submitted</p>
                  <Inbox className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {counts.submitted}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">New applications</p>
              </CardContent>
            </Card>

            {/* Under review */}
            <Card
              className={`cursor-pointer transition hover:border-amber-500 ${
                statusFilter === 'under_review' ? 'border-amber-500 ring-1 ring-amber-500' : ''
              }`}
              onClick={() => {
                setStatusFilter('under_review')
                setCurrentPage(1)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Under review</p>
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {counts.under_review}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Screening candidates</p>
              </CardContent>
            </Card>

            {/* Shortlisted */}
            <Card
              className={`cursor-pointer transition hover:border-purple-500 ${
                statusFilter === 'shortlisted' ? 'border-purple-500 ring-1 ring-purple-500' : ''
              }`}
              onClick={() => {
                setStatusFilter('shortlisted')
                setCurrentPage(1)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Shortlisted</p>
                  <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="mt-2 text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {counts.shortlisted}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Selected for interview</p>
              </CardContent>
            </Card>

            {/* Rejected */}
            <Card
              className={`cursor-pointer transition hover:border-red-500 ${
                statusFilter === 'rejected' ? 'border-red-500 ring-1 ring-red-500' : ''
              }`}
              onClick={() => {
                setStatusFilter('rejected')
                setCurrentPage(1)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">Rejected</p>
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-300">
                  {counts.rejected}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Not selected</p>
              </CardContent>
            </Card>

            {/* Hired */}
            <Card
              className={`cursor-pointer transition hover:border-emerald-500 ${
                statusFilter === 'hired' ? 'border-emerald-500 ring-1 ring-emerald-500' : ''
              }`}
              onClick={() => {
                setStatusFilter('hired')
                setCurrentPage(1)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Hired</p>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {counts.hired}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Offer accepted</p>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter Toolbar */}
          <Card className="mt-5">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-9"
                    placeholder="Search candidate by name, email, or username..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-10 rounded-md border bg-background px-3 text-sm font-medium"
                  >
                    <option value="all">All Statuses ({counts.all})</option>
                    <option value="submitted">• Submitted ({counts.submitted})</option>
                    <option value="under_review">• Under review ({counts.under_review})</option>
                    <option value="shortlisted">• Shortlisted ({counts.shortlisted})</option>
                    <option value="rejected">• Rejected ({counts.rejected})</option>
                    <option value="hired">• Hired ({counts.hired})</option>
                  </select>

                  {(search || statusFilter !== 'all') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      title="Clear filters"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applicants Table */}
          <Card className="mt-5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                Applicants for:{' '}
                <span className="text-primary">{selectedJob?.title ?? 'Selected Job'}</span>
              </CardTitle>

              <span className="text-xs text-muted-foreground font-normal">
                {totalApplicants} {totalApplicants === 1 ? 'applicant' : 'applicants'} found
              </span>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="px-6 py-3 font-medium">Applicant</th>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium">Applied Date</th>
                      <th className="px-6 py-3 font-medium">Curriculum Vitae</th>
                      <th className="px-6 py-3 font-medium">Current Status</th>
                      <th className="px-6 py-3 font-medium">Update Status</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoadingApplicants ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2 text-primary" />
                          Loading applicants...
                        </td>
                      </tr>
                    ) : applicants.length > 0 ? (
                      applicants.map((applicant) => (
                        <tr key={applicant.id} className="border-b last:border-0 hover:bg-muted/20">
                          {/* Applicant Name */}
                          <td className="px-6 py-4">
                            <Link
                              to={`/applicant-details?id=${applicant.id}`}
                              className="text-primary hover:underline font-semibold"
                            >
                              {applicant.applicant?.name || `Applicant #${applicant.id}`}
                            </Link>
                            {applicant.applicant?.username && (
                              <p className="text-xs text-muted-foreground">
                                @{applicant.applicant.username}
                              </p>
                            )}
                          </td>

                          {/* Email */}
                          <td className="px-6 py-4 text-muted-foreground">
                            {applicant.applicant?.email || 'N/A'}
                          </td>

                          {/* Applied Date */}
                          <td className="px-6 py-4 text-muted-foreground">
                            {applicant.created_at
                              ? new Date(applicant.created_at).toLocaleDateString()
                              : 'N/A'}
                          </td>

                          {/* CV Download */}
                          <td className="px-6 py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadCV(applicant)}
                              className="flex items-center gap-1.5"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download CV</span>
                            </Button>
                          </td>

                          {/* Current Status Badge */}
                          <td className="px-6 py-4">
                            <StatusBadge status={applicant.status} label={applicant.status_label} />
                          </td>

                          {/* Inline Real Status Selector */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              {updatingApplicantId === applicant.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
                                className="h-9 rounded-md border bg-background px-2.5 py-1 text-xs font-medium cursor-pointer focus:ring-2 focus:ring-primary"
                              >
                                <option value="submitted">• Submitted</option>
                                <option value="under_review">• Under review</option>
                                <option value="shortlisted">• Shortlisted</option>
                                <option value="rejected">• Rejected</option>
                                <option value="hired">• Hired</option>
                              </select>
                            </div>
                          </td>

                          {/* Actions Dropdown */}
                          <td className="relative px-6 py-4 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setOpenMenu(openMenu === applicant.id ? null : applicant.id)
                              }
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>

                            {openMenu === applicant.id && (
                              <div className="absolute right-6 top-14 z-20 w-52 rounded-md border bg-background p-1.5 shadow-lg text-left">
                                <button
                                  type="button"
                                  onClick={() => handleViewProfile(applicant.id)}
                                  className="w-full rounded px-3 py-2 text-left text-xs font-medium hover:bg-muted flex items-center gap-2"
                                >
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  View Candidate Profile
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadCV(applicant)}
                                  className="w-full rounded px-3 py-2 text-left text-xs font-medium hover:bg-muted flex items-center gap-2"
                                >
                                  <Download className="h-4 w-4 text-muted-foreground" />
                                  Download Resume
                                </button>

                                <div className="my-1 border-t" />

                                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Change Status
                                </p>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(applicant.id, 'submitted')}
                                  className="w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center gap-2 text-blue-600"
                                >
                                  <Inbox className="h-3.5 w-3.5" />
                                  • Submitted
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(applicant.id, 'under_review')}
                                  className="w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center gap-2 text-amber-600"
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                  • Under review
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(applicant.id, 'shortlisted')}
                                  className="w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center gap-2 text-purple-600"
                                >
                                  <Star className="h-3.5 w-3.5" />
                                  • Shortlisted
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(applicant.id, 'rejected')}
                                  className="w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center gap-2 text-red-600"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  • Rejected
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(applicant.id, 'hired')}
                                  className="w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center gap-2 text-emerald-600 font-semibold"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  • Hired
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                          No applicants found for this job post matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} ({totalApplicants} total applicants)
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
