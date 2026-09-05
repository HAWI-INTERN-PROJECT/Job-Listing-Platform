import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'

import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
    <div className="h-screen flex overflow-hidden bg-muted/40">
      {/* Sidebar */}
      <EmployerSidebar />

      {/* Main area */}
      <div className="min-w-0 flex-1 overflow-y-auto pt-14 md:pt-0">
        {/* Header */}
        <EmployerHeader title="Edit Job" />

        <main className="px-4 py-5 sm:px-6 lg:px-8">
          {/* Page heading */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Edit Job Post
              </h2>

              <p className="text-sm text-muted-foreground">
                Update the details of your job posting.
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                isClosed
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {isClosed ? 'Closed' : 'Approved'}
            </span>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                isClosed
                  ? 'border-gray-200 bg-gray-50 text-gray-700'
                  : 'border-green-200 bg-green-50 text-green-700'
              }`}
            >
              {isClosed ? (
                <XCircle className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}

              {message}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSave}>
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Basic Information
                </CardTitle>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="title">
                    Job Title{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="title"
                    name="title"
                    value={job.title}
                    onChange={handleChange}
                    disabled={isClosed}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category">
                    Job Category{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <select
                    id="category"
                    name="category"
                    value={job.category}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option>Technology</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Finance</option>
                    <option>Human Resources</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="employmentType">
                    Employment Type{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <select
                    id="employmentType"
                    name="employmentType"
                    value={job.employmentType}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="positions">
                    Available Positions{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="positions"
                    name="positions"
                    type="number"
                    min="1"
                    value={job.positions}
                    onChange={handleChange}
                    disabled={isClosed}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Location
                </CardTitle>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="location">
                    Location{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="location"
                    name="location"
                    value={job.location}
                    onChange={handleChange}
                    disabled={isClosed}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="workMode">
                    Work Location
                  </Label>

                  <select
                    id="workMode"
                    name="workMode"
                    value={job.workMode}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option>On-site</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Job Details
                </CardTitle>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="description">
                    Job Description{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <textarea
                    id="description"
                    name="description"
                    value={job.description}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="min-h-24 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="responsibilities">
                    Responsibilities{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <textarea
                    id="responsibilities"
                    name="responsibilities"
                    value={job.responsibilities}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="min-h-24 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="requirements">
                    Requirements{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <textarea
                    id="requirements"
                    name="requirements"
                    value={job.requirements}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="min-h-24 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Application Details
                </CardTitle>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="deadline">
                    Application Deadline{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={job.deadline}
                    onChange={handleChange}
                    disabled={isClosed}
                  />

                  <p className="text-xs text-muted-foreground">
                    Applications will close after this date.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status">
                    Job Status
                  </Label>

                  <select
                    id="status"
                    name="status"
                    value={job.status}
                    onChange={handleChange}
                    disabled={isClosed}
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option>Open</option>
                    <option>Closed</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Close warning */}
            {!isClosed && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-medium">
                  Close this job?
                </p>

                <p className="mt-1">
                  Closing this job will prevent new applications.
                </p>
              </div>
            )}

            {isClosed && (
              <div className="rounded-lg border bg-muted px-4 py-3 text-sm">
                <p className="font-medium">
                  This job is closed.
                </p>

                <p className="mt-1 text-muted-foreground">
                  New applications are no longer being accepted.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>

              {!isClosed && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleCloseJob}
                >
                  Close Job
                </Button>
              )}

              {!isClosed && (
                <Button type="submit">
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