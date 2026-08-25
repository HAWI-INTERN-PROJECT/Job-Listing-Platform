import {
  Bell,
  Briefcase,
  LogOut,
  Settings,
  User,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditJobPage() {
  return (
    <div className="min-h-screen bg-muted/40 md:flex">

      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-background md:flex md:min-h-screen md:flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2 text-primary-foreground">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">JobPlatform</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <a
            href="/employer-dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <Briefcase className="h-4 w-4" />
            Dashboard
          </a>

          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <User className="h-4 w-4" />
            Company Profile
          </a>

          <a
            href="/my-job-posts"
            className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
          >
            <Briefcase className="h-4 w-4" />
            My Job Posts
          </a>

          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <Users className="h-4 w-4" />
            Applicants
          </a>

          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Settings
          </a>
        </nav>

        <div className="border-t p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">

        {/* Top bar */}
        <header className="border-b bg-background">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-semibold">Edit Job</h1>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  E
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-medium">Employer</p>
                  <p className="text-xs text-muted-foreground">
                    Employer Account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 py-5 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Edit Job Post
              </h2>
              <p className="text-sm text-muted-foreground">
                Update the details of your job posting.
              </p>
            </div>

            <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Approved
            </span>
          </div>

          <form className="space-y-4">

            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Basic Information
                </CardTitle>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-4">

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="job-title">
                    Job Title <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="job-title"
                    defaultValue="Senior React Developer"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category">
                    Job Category <span className="text-destructive">*</span>
                  </Label>

                  <select
                    id="category"
                    defaultValue="Technology"
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option>Technology</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Finance</option>
                    <option>Human Resources</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="employment-type">
                    Employment Type <span className="text-destructive">*</span>
                  </Label>

                  <select
                    id="employment-type"
                    defaultValue="Full-time"
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                    type="number"
                    defaultValue="2"
                    min="1"
                  />
                </div>

              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Location</CardTitle>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-2">

                <div className="space-y-1.5">
                  <Label htmlFor="location">
                    Location <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="location"
                    defaultValue="Addis Ababa, Ethiopia"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="work-mode">Work Location</Label>

                  <select
                    id="work-mode"
                    defaultValue="On-site"
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option>On-site</option>
                    <option>Remote</option>
                  </select>
                </div>

              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Job Details</CardTitle>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-3">

                <div className="space-y-1.5">
                  <Label htmlFor="description">
                    Job Description{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <textarea
                    id="description"
                    defaultValue="We are looking for a Senior React Developer to build and maintain modern web applications for our growing technology team."
                    className="min-h-24 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="responsibilities">
                    Responsibilities{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <textarea
                    id="responsibilities"
                    defaultValue="Develop React applications, collaborate with designers and backend developers, review code, and maintain application performance."
                    className="min-h-24 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="requirements">
                    Requirements{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <textarea
                    id="requirements"
                    defaultValue="3+ years of React experience, strong JavaScript and TypeScript knowledge, Git experience, and good communication skills."
                    className="min-h-24 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
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
                    type="date"
                    defaultValue="2026-08-30"
                  />

                  <p className="text-xs text-muted-foreground">
                    Applications will close after this date.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job-status">Job Status</Label>

                  <select
                    id="job-status"
                    defaultValue="Open"
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option>Open</option>
                    <option>Closed</option>
                  </select>
                </div>

              </CardContent>
            </Card>

            {/* Close confirmation */}
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p className="font-medium">Close this job?</p>
              <p className="mt-1">
                Closing this job will prevent new applications.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="outline">
                Cancel
              </Button>

              <Button type="button" variant="destructive">
                Close Job
              </Button>

              <Button type="submit">
                Save Changes
              </Button>
            </div>

          </form>
        </main>
      </div>
    </div>
  )
}