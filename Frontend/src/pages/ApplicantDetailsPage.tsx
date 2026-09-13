import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Download,
  Loader2,
  FileText,
  Mail,
  Calendar,
  Briefcase,
  AlertCircle,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
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

interface JobPostInfo {
  id: number
  title: string
  slug: string
  job_type: string
  job_type_label: string
  location?: string | null
}

interface ApplicationDetails {
  id: number
  user_id: number
  job_post_id: number
  applicant?: ApplicantUser
  job_post?: JobPostInfo
  cv_path: string | null
  cover_letter: string | null
  status: 'submitted' | 'under_review' | 'shortlisted' | 'rejected' | 'hired'
  status_label: string
  created_at: string
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
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {displayLabel}
    </span>
  )
}

export default function ApplicantDetailsPage() {
  const [searchParams] = useSearchParams()
  const applicationId = searchParams.get('id')

  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedStatus, setSelectedStatus] = useState<string>('under_review')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isDownloadingCv, setIsDownloadingCv] = useState(false)

  useEffect(() => {
    if (!applicationId) {
      setError('No application ID specified in the URL.')
      setIsLoading(false)
      return
    }

    let mounted = true

    const fetchApplication = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await api.get(`/employer/applications/${applicationId}`)
        const data: ApplicationDetails = res.data?.data || res.data
        if (mounted) {
          setApplication(data)
          setSelectedStatus(data.status)
        }
      } catch (err) {
        console.error('Failed to fetch applicant details:', err)
        if (mounted) {
          setError('Failed to load application details. Please confirm you have access.')
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchApplication()

    return () => {
      mounted = false
    }
  }, [applicationId])

  const handleDownloadCv = async () => {
    if (!application) return

    try {
      setIsDownloadingCv(true)
      toast.info('Downloading applicant CV...')
      const response = await api.get(`/employer/applications/${application.id}/cv`, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const name = application.applicant?.name
        ? application.applicant.name.toLowerCase().replace(/\s+/g, '-')
        : 'applicant'
      link.download = `${name}-cv-${application.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('CV downloaded successfully!')
    } catch (err) {
      console.error('Error downloading CV:', err)
      toast.error('Applicant CV file not found or unavailable.')
    } finally {
      setIsDownloadingCv(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!application) return

    try {
      setIsUpdatingStatus(true)
      const res = await api.put(`/employer/applications/${application.id}/status`, {
        status: selectedStatus,
      })
      const updated: ApplicationDetails = res.data?.data || res.data
      setApplication(updated)
      setSelectedStatus(updated.status)
      toast.success(`Application status updated to "${updated.status_label || selectedStatus}".`)
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Failed to update application status.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'AP'
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <EmployerSidebar />

      <div className="min-w-0 flex-1">
        <EmployerHeader title="Applicant Details" />

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-5">
            <Link
              to={
                application?.job_post_id
                  ? `/job-applicants?jobId=${application.job_post_id}`
                  : '/job-applicants'
              }
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Applicants
            </Link>

            {application && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {application.applicant?.name || 'Applicant'}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Applied for{' '}
                    <span className="font-semibold text-foreground">
                      {application.job_post?.title || 'Job Post'}
                    </span>
                  </p>
                </div>

                <StatusBadge status={application.status} label={application.status_label} />
              </div>
            )}
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-muted-foreground">Loading applicant profile...</p>
              </CardContent>
            </Card>
          ) : error || !application ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-10 w-10 text-destructive mb-3" />
                <p className="text-lg font-semibold text-destructive">Unable to load details</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Link to="/job-applicants" className="mt-4">
                  <Button variant="outline">Return to Applicants</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Two Column Layout */}
              <div className="grid gap-5 lg:grid-cols-2">
                {/* Applicant Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Applicant Information</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Avatar & Basic Info */}
                    <div className="flex items-center gap-4 border-b pb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                        {getInitials(application.applicant?.name)}
                      </div>

                      <div>
                        <h3 className="font-bold text-lg">
                          {application.applicant?.name || 'Unknown Candidate'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          @{application.applicant?.username || 'user'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email Address</p>
                          <p className="text-sm font-medium">
                            {application.applicant?.email || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Applied Position</p>
                          <p className="text-sm font-medium">
                            {application.job_post?.title || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Applied Date</p>
                          <p className="text-sm font-medium">
                            {new Date(application.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="border-t pt-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Cover Letter
                      </p>
                      <div className="rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap text-muted-foreground">
                        {application.cover_letter?.trim()
                          ? application.cover_letter
                          : 'No cover letter was submitted with this application.'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Application Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Review & Decision</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    {/* CV Download Section */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">
                        Resume / Curriculum Vitae
                      </p>
                      <div className="flex items-center justify-between rounded-lg border p-4 bg-background">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm font-semibold">
                              {application.applicant?.name
                                ? `${application.applicant.name}_CV.pdf`
                                : 'Applicant_CV.pdf'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Snapshot captured at time of application
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDownloadingCv}
                          onClick={handleDownloadCv}
                          className="flex items-center gap-1.5"
                        >
                          {isDownloadingCv ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span>Download CV</span>
                        </Button>
                      </div>
                    </div>

                    {/* Change Status Section */}
                    <div className="border-t pt-5">
                      <label htmlFor="status-select" className="mb-2 block text-sm font-semibold">
                        Update Candidate Status
                      </label>

                      <p className="mb-3 text-xs text-muted-foreground">
                        Select a decision for this applicant. The candidate will receive an immediate notification of this status change.
                      </p>

                      <select
                        id="status-select"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm font-medium"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="hired">Hired (Offer Accepted / Candidate Selected)</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <div className="mt-4 flex gap-2">
                        <Button
                          className="w-full"
                          disabled={isUpdatingStatus || selectedStatus === application.status}
                          onClick={handleUpdateStatus}
                        >
                          {isUpdatingStatus ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Save Status Update
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Card */}
              <Card className="mt-5">
                <CardHeader>
                  <CardTitle className="text-base">Hiring Pipeline Progress</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm">
                    {/* Step 1: Applied */}
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        ✓
                      </span>
                      <span className="font-medium">Applied</span>
                    </div>

                    <span className="hidden text-muted-foreground sm:block">→</span>

                    {/* Step 2: Under Review */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          application.status !== 'submitted'
                            ? 'bg-primary text-primary-foreground'
                            : 'border text-muted-foreground'
                        }`}
                      >
                        {application.status !== 'submitted' ? '✓' : '2'}
                      </span>
                      <span
                        className={
                          application.status !== 'submitted'
                            ? 'font-medium'
                            : 'text-muted-foreground'
                        }
                      >
                        Under Review
                      </span>
                    </div>

                    <span className="hidden text-muted-foreground sm:block">→</span>

                    {/* Step 3: Shortlisted */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          application.status === 'shortlisted' || application.status === 'hired'
                            ? 'bg-primary text-primary-foreground'
                            : 'border text-muted-foreground'
                        }`}
                      >
                        {application.status === 'shortlisted' || application.status === 'hired'
                          ? '✓'
                          : '3'}
                      </span>
                      <span
                        className={
                          application.status === 'shortlisted' || application.status === 'hired'
                            ? 'font-medium'
                            : 'text-muted-foreground'
                        }
                      >
                        Shortlisted
                      </span>
                    </div>

                    <span className="hidden text-muted-foreground sm:block">→</span>

                    {/* Step 4: Final Outcome (Hired / Rejected) */}
                    <div className="flex items-center gap-2">
                      {application.status === 'hired' ? (
                        <>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                            ✓
                          </span>
                          <span className="font-semibold text-green-600">Hired</span>
                        </>
                      ) : application.status === 'rejected' ? (
                        <>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                            ✕
                          </span>
                          <span className="font-semibold text-red-600">Rejected</span>
                        </>
                      ) : (
                        <>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border text-xs text-muted-foreground">
                            4
                          </span>
                          <span className="text-muted-foreground">Hired / Rejected</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
