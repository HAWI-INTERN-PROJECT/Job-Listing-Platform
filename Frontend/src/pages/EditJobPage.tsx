import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  XCircle,
  Briefcase,
  MapPin,
  FileText,
  Calendar,
  AlertTriangle,
  Save,
} from 'lucide-react'

import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type JobForm = {
  title: string
  category: string
  employmentType: string
  positions: string
  location: string
  workMode: string
  description: string
  responsibilities: string
  requirements: string
  deadline: string
  status: string
}

const initialJob: JobForm = {
  title: 'Senior React Developer',
  category: 'Technology',
  employmentType: 'Full-time',
  positions: '2',
  location: 'Addis Ababa, Ethiopia',
  workMode: 'On-site',
  description:
    'We are looking for a Senior React Developer to build and maintain modern web applications for our growing technology team.',
  responsibilities:
    'Develop React applications, collaborate with designers and backend developers, review code, and maintain application performance.',
  requirements:
    '3+ years of React experience, strong JavaScript and TypeScript knowledge, Git experience, and good communication skills.',
  deadline: '2026-08-30',
  status: 'Open',
}

export default function EditJobPage() {
  const navigate = useNavigate()

  const [job, setJob] = useState<JobForm>(initialJob)
  const [savedJob, setSavedJob] = useState<JobForm>(initialJob)
  const [message, setMessage] = useState('')
  const [isClosed, setIsClosed] = useState(false)

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target

    setJob((currentJob) => ({
      ...currentJob,
      [name]: value,
    }))
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isClosed) {
      setMessage('This job is closed and cannot be edited.')
      setTimeout(() => {
        setMessage('')
      }, 3000)
      return
    }

    setSavedJob(job)
    setMessage('Job changes saved successfully.')
    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  function handleCancel() {
    setJob(savedJob)
    setMessage('Changes have been cancelled.')
    setTimeout(() => {
      navigate('/my-job-posts')
    }, 1000)
  }

  function handleCloseJob() {
    const confirmed = window.confirm(
      'Are you sure you want to close this job? New applications will no longer be accepted.',
    )

    if (!confirmed) {
      return
    }

    setIsClosed(true)
    setJob((currentJob) => ({
      ...currentJob,
      status: 'Closed',
    }))
    setSavedJob((currentJob) => ({
      ...currentJob,
      status: 'Closed',
    }))
    setMessage('Job has been closed successfully.')
    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <EmployerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title="Edit Job" />

        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Notion Document Header */}
          <div className="border-b border-border/60 pb-5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-foreground text-[11px] font-semibold">
                ✏️
              </span>
              <span>Job Postings / Edit Listing</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Edit Job Post
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Update position details, requirements, compensation, or close this listing.
                </p>
              </div>

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium self-start sm:self-auto ${
                  isClosed
                    ? 'bg-muted text-muted-foreground border border-border'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {isClosed ? 'Closed' : 'Approved'}
              </span>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium ${
                isClosed
                  ? 'border-border bg-muted/40 text-muted-foreground'
                  : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isClosed ? (
                <XCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              )}
              {message}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSave}>
            {/* Basic Information */}
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="title" className="text-xs font-medium text-muted-foreground">
                    Job Title <span className="text-rose-500">*</span>
                  </Label>
                  <input
                    id="title"
                    name="title"
                    value={job.title}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">
                    Job Category <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    id="category"
                    name="category"
                    value={job.category}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  >
                    <option>Technology</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Finance</option>
                    <option>Human Resources</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="employmentType" className="text-xs font-medium text-muted-foreground">
                    Employment Type <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={job.employmentType}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="positions" className="text-xs font-medium text-muted-foreground">
                    Available Positions <span className="text-rose-500">*</span>
                  </Label>
                  <input
                    id="positions"
                    name="positions"
                    type="number"
                    min="1"
                    value={job.positions}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">Location & Work Mode</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs font-medium text-muted-foreground">
                    Location <span className="text-rose-500">*</span>
                  </Label>
                  <input
                    id="location"
                    name="location"
                    value={job.location}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="workMode" className="text-xs font-medium text-muted-foreground">Work Location</Label>
                  <select
                    id="workMode"
                    name="workMode"
                    value={job.workMode}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  >
                    <option>On-site</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-semibold text-foreground">Job Details</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
                    Job Description <span className="text-rose-500">*</span>
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={job.description}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="w-full resize-none rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="responsibilities" className="text-xs font-medium text-muted-foreground">
                    Responsibilities <span className="text-rose-500">*</span>
                  </Label>
                  <textarea
                    id="responsibilities"
                    name="responsibilities"
                    rows={4}
                    value={job.responsibilities}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="w-full resize-none rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="requirements" className="text-xs font-medium text-muted-foreground">
                    Requirements <span className="text-rose-500">*</span>
                  </Label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    rows={4}
                    value={job.requirements}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="w-full resize-none rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-semibold text-foreground">Application Deadline & Status</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="deadline" className="text-xs font-medium text-muted-foreground">
                    Application Deadline <span className="text-rose-500">*</span>
                  </Label>
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={job.deadline}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  />
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Applications will close automatically after this date.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">Job Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={job.status}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  >
                    <option>Open</option>
                    <option>Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Close warning / status notice */}
            {!isClosed ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold">Listing is Active</p>
                  <p className="mt-0.5 text-amber-700/90 dark:text-amber-400/90">
                    Closing this job post will hide it from the search directory and reject any new candidate submissions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-xs text-muted-foreground flex items-start gap-2.5">
                <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">This job is closed</p>
                  <p className="mt-0.5">New applications are no longer accepted.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-2.5 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="rounded-lg h-8 px-3 text-xs"
              >
                Cancel
              </Button>

              {!isClosed && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleCloseJob}
                  className="rounded-lg h-8 px-3 text-xs"
                >
                  Close Job Post
                </Button>
              )}

              {!isClosed && (
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-lg h-8 px-3.5 text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
                >
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
