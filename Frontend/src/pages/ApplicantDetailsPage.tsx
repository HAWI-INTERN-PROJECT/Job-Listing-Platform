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
  Inbox,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
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
  status: ApplicationStatusType
  status_label: string
  created_at: string
}

const STATUS_CONFIG: Record<
  ApplicationStatusType,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  submitted: {
    label: 'Submitted',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    icon: Inbox,
  },
  under_review: {
    label: 'Under review',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    icon: Clock,
  },
  shortlisted: {
    label: 'Shortlisted',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    icon: Star,
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
    icon: XCircle,
  },
  hired: {
    label: 'Hired',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    icon: CheckCircle2,
  },
}

function StatusBadge({ status, label }: { status: ApplicationStatusType; label?: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    badgeClass: 'bg-muted text-muted-foreground border',
    icon: Clock,
  }

  const IconComponent = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.badgeClass}`}
    >
      <IconComponent className="h-3.5 w-3.5" />
      {label || config.label}
    </span>
  )
}

export default function ApplicantDetailsPage() {
  const [searchParams] = useSearchParams()
  const applicationId = searchParams.get('id')

  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatusType>('under_review')
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

  const handleUpdateStatus = async (statusToSet?: ApplicationStatusType) => {
    if (!application) return
    const statusValue = statusToSet || selectedStatus

    try {
      setIsUpdatingStatus(true)
      const res = await api.put(`/employer/applications/${application.id}/status`, {
        status: statusValue,
      })
      const updated: ApplicationDetails = res.data?.data || res.data
      setApplication(updated)
      setSelectedStatus(updated.status)
      toast.success(`Application status updated to "${updated.status_label || statusValue}".`)
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
              {/* Quick Status Bar */}
              <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border bg-background p-3">
                <span className="text-xs font-semibold text-muted-foreground mr-2">
                  Change Status to:
                </span>

                <Button
                  size="sm"
                  variant={application.status === 'submitted' ? 'default' : 'outline'}
                  className={
                    application.status === 'submitted'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-blue-200'
                  }
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus('submitted')}
                >
                  <Inbox className="mr-1.5 h-3.5 w-3.5" />
                  Submitted
                </Button>

                <Button
                  size="sm"
                  variant={application.status === 'under_review' ? 'default' : 'outline'}
                  className={
                    application.status === 'under_review'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-amber-200'
                  }
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus('under_review')}
                >
                  <Clock className="mr-1.5 h-3.5 w-3.5" />
                  Under review
                </Button>

                <Button
                  size="sm"
                  variant={application.status === 'shortlisted' ? 'default' : 'outline'}
                  className={
                    application.status === 'shortlisted'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 border-purple-200'
                  }
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus('shortlisted')}
                >
                  <Star className="mr-1.5 h-3.5 w-3.5" />
                  Shortlisted
                </Button>

                <Button
                  size="sm"
                  variant={application.status === 'rejected' ? 'destructive' : 'outline'}
                  className={
                    application.status === 'rejected'
                      ? ''
                      : 'text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200'
                  }
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus('rejected')}
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Rejected
                </Button>

                <Button
                  size="sm"
                  variant={application.status === 'hired' ? 'default' : 'outline'}
                  className={
                    application.status === 'hired'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-200'
                  }
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus('hired')}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Hired
                </Button>
              </div>

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

                    {/* Change Status Section with all 5 real scenario statuses */}
                    <div className="border-t pt-5">
                      <label htmlFor="status-select" className="mb-2 block text-sm font-semibold">
                        Update Candidate Status
                      </label>

                      <p className="mb-3 text-xs text-muted-foreground">
                        Assign one of the 5 real-scenario hiring statuses. The candidate will receive an immediate notification upon update.
                      </p>

                      <select
                        id="status-select"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatusType)}
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm font-medium"
                      >
                        <option value="submitted">• Submitted (New application received)</option>
                        <option value="under_review">• Under review (Evaluating candidate profile & CV)</option>
                        <option value="shortlisted">• Shortlisted (Selected for interview / next round)</option>
                        <option value="rejected">• Rejected (Not selected for this role)</option>
                        <option value="hired">• Hired (Final offer extended and candidate hired)</option>
                      </select>

                      <div className="mt-4 flex gap-2">
                        <Button
                          className="w-full"
                          disabled={isUpdatingStatus || selectedStatus === application.status}
                          onClick={() => handleUpdateStatus(selectedStatus)}
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

              {/* Hiring Pipeline Timeline Card */}
              <Card className="mt-5">
                <CardHeader>
                  <CardTitle className="text-base">Real Scenario Hiring Pipeline</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm">
                    {/* Stage 1: Submitted */}
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        ✓
                      </span>
                      <div>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">• Submitted</p>
                        <p className="text-[11px] text-muted-foreground">Application received</p>
                      </div>
                    </div>

                    <span className="hidden text-muted-foreground sm:block">→</span>

                    {/* Stage 2: Under review */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          application.status !== 'submitted'
                            ? 'bg-amber-600 text-white'
                            : 'border text-muted-foreground'
                        }`}
                      >
                        {application.status !== 'submitted' ? '✓' : '2'}
                      </span>
                      <div>
                        <p
                          className={
                            application.status !== 'submitted'
                              ? 'font-semibold text-amber-600 dark:text-amber-400'
                              : 'text-muted-foreground'
                          }
                        >
                          • Under review
                        </p>
                        <p className="text-[11px] text-muted-foreground">Profile & CV screening</p>
                      </div>
                    </div>

                    <span className="hidden text-muted-foreground sm:block">→</span>

                    {/* Stage 3: Shortlisted */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          application.status === 'shortlisted' || application.status === 'hired'
                            ? 'bg-purple-600 text-white'
                            : 'border text-muted-foreground'
                        }`}
                      >
                        {application.status === 'shortlisted' || application.status === 'hired'
                          ? '✓'
                          : '3'}
                      </span>
                      <div>
                        <p
                          className={
                            application.status === 'shortlisted' || application.status === 'hired'
                              ? 'font-semibold text-purple-600 dark:text-purple-400'
                              : 'text-muted-foreground'
                          }
                        >
                          • Shortlisted
                        </p>
                        <p className="text-[11px] text-muted-foreground">Interview selection</p>
                      </div>
                    </div>

                    <span className="hidden text-muted-foreground sm:block">→</span>

                    {/* Stage 4: Decision (Hired / Rejected) */}
                    <div className="flex items-center gap-2">
                      {application.status === 'hired' ? (
                        <>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                            ✓
                          </span>
                          <div>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">• Hired</p>
                            <p className="text-[11px] text-emerald-600">Candidate selected</p>
                          </div>
                        </>
                      ) : application.status === 'rejected' ? (
                        <>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                            ✕
                          </span>
                          <div>
                            <p className="font-bold text-red-600 dark:text-red-400">• Rejected</p>
                            <p className="text-[11px] text-red-600">Application closed</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border text-xs text-muted-foreground">
                            4
                          </span>
                          <div>
                            <p className="text-muted-foreground font-medium">Final Decision</p>
                            <p className="text-[11px] text-muted-foreground">• Hired or • Rejected</p>
                          </div>
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
