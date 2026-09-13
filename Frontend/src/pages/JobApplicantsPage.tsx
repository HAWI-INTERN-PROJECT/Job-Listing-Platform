import { useState, useEffect, useCallback } from 'react'
import {
  Download,
  MoreHorizontal,
  Search,
  X,
  Loader2,
  FileText,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
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
  status: 'submitted' | 'under_review' | 'shortlisted' | 'rejected' | 'hired'
  status_label: string
  created_at: string
}

interface EmployerJob {
  id: number
  title: string
  status: string
}

function StatusBadge({ status, label }: { status: string; label?: string }) {
  const styles: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    under_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
    shortlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    hired: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  }

  const displayLabel =
    label ||
    (status === 'under_review'
      ? 'Under Review'
      : status.charAt(0).toUpperCase() + status.slice(1))

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] ?? 'bg-muted text-muted-foreground'
      }`}
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
  const [isActionLoading, setIsActionLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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

        setApplicants(paginatedData)
        setCurrentPage(meta.current_page || 1)
        setTotalPages(meta.last_page || 1)
        setTotalApplicants(meta.total || paginatedData.length)
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
    status: 'submitted' | 'under_review' | 'shortlisted' | 'rejected' | 'hired',
  ) => {
    try {
      setIsActionLoading(true)
      const res = await api.put(`/employer/applications/${applicantId}/status`, {
        status,
      })
      const updated: ApplicationItem = res.data?.data || res.data

      toast.success(`Application status updated to "${updated.status_label || status}".`)

      setApplicants((prev) =>
        prev.map((app) => (app.id === applicantId ? { ...app, ...updated } : app)),
      )
      setOpenMenu(null)
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Failed to update application status.')
    } finally {
      setIsActionLoading(false)
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

  // Status counts from current view or calculations
  const submittedCount = applicants.filter((a) => a.status === 'submitted').length
  const underReviewCount = applicants.filter((a) => a.status === 'under_review').length
  const hiredCount = applicants.filter((a) => a.status === 'hired').length
  const rejectedCount = applicants.filter((a) => a.status === 'rejected').length

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
                Review and manage applications received for your posted jobs, download CVs, and update statuses.
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
                <label htmlFor="job-selector" className="text-sm font-medium sm:w-28">
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
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm sm:max-w-md"
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

          {/* Summary Cards */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Total Applicants</p>
                <p className="mt-1 text-2xl font-bold">{totalApplicants}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Submitted</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">{submittedCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Under Review</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600">{underReviewCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Hired</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{hiredCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Rejected</p>
                <p className="mt-1 text-2xl font-bold text-red-600">{rejectedCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter Bar */}
          <Card className="mt-5">
            <CardContent className="p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-9"
                    placeholder="Search candidate name or email"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applicants Table */}
          <Card className="mt-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Applicants for: <span className="text-primary">{selectedJob?.title ?? 'Selected Job'}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="px-6 py-3 font-medium">Applicant</th>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium">Applied Date</th>
                      <th className="px-6 py-3 font-medium">CV / Resume</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Quick Status Action</th>
                      <th className="px-6 py-3 font-medium text-right">More</th>
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
                          <td className="px-6 py-4 font-medium">
                            <Link
                              to={`/applicant-details?id=${applicant.id}`}
                              className="text-primary hover:underline font-semibold"
                            >
                              {applicant.applicant?.name || 'Applicant #' + applicant.id}
                            </Link>
                          </td>

                          {/* Email */}
                          <td className="px-6 py-4 text-muted-foreground">
                            {applicant.applicant?.email || 'N/A'}
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-muted-foreground">
                            {applicant.created_at
                              ? new Date(applicant.created_at).toLocaleDateString()
                              : 'N/A'}
                          </td>

                          {/* Download CV */}
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

                          {/* Status Badge */}
                          <td className="px-6 py-4">
                            <StatusBadge status={applicant.status} label={applicant.status_label} />
                          </td>

                          {/* Quick Actions (Hire / Reject) */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant={applicant.status === 'hired' ? 'default' : 'outline'}
                                className={
                                  applicant.status === 'hired'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 border-green-200'
                                }
                                disabled={isActionLoading || applicant.status === 'hired'}
                                onClick={() => handleUpdateStatus(applicant.id, 'hired')}
                                title="Hire applicant"
                              >
                                <UserCheck className="mr-1 h-3.5 w-3.5" />
                                {applicant.status === 'hired' ? 'Hired' : 'Hire'}
                              </Button>

                              <Button
                                size="sm"
                                variant={applicant.status === 'rejected' ? 'destructive' : 'outline'}
                                className={
                                  applicant.status === 'rejected'
                                    ? ''
                                    : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200'
                                }
                                disabled={isActionLoading || applicant.status === 'rejected'}
                                onClick={() => handleUpdateStatus(applicant.id, 'rejected')}
                                title="Reject applicant"
                              >
                                <UserX className="mr-1 h-3.5 w-3.5" />
                                {applicant.status === 'rejected' ? 'Rejected' : 'Reject'}
                              </Button>
                            </div>
                          </td>

                          {/* More dropdown */}
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
                              <div className="absolute right-6 top-14 z-20 w-48 rounded-md border bg-background p-1 shadow-lg text-left">
                                <button
                                  type="button"
                                  onClick={() => handleViewProfile(applicant.id)}
                                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                >
                                  <FileText className="h-4 w-4" />
                                  View Full Details
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(applicant.id, 'under_review')}
                                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                >
                                  <Clock className="h-4 w-4" />
                                  Mark Under Review
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(applicant.id, 'shortlisted')}
                                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-indigo-600"
                                >
                                  <UserCheck className="h-4 w-4" />
                                  Shortlist
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(applicant.id, 'hired')}
                                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-green-600"
                                >
                                  <UserCheck className="h-4 w-4" />
                                  Hire Applicant
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(applicant.id, 'rejected')}
                                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-600"
                                >
                                  <UserX className="h-4 w-4" />
                                  Reject Applicant
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
