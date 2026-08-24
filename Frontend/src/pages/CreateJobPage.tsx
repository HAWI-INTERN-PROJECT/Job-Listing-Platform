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

export default function CreateJobPage() {
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

      {/* Main area */}
      <div className="min-w-0 flex-1">

        {/* Top navigation */}
        <header className="border-b bg-background">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-xl font-semibold">Create Job</h1>
            </div>

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
        <main className="px-4 py-6 sm:px-6 lg:px-8">

          {/* Page header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Create a New Job
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Provide the details of the position you want to publish.
            </p>
          </div>

          <form className="space-y-6">

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>

              <CardContent className="grid gap-5 md:grid-cols-2">

                <div className="space-y-2">
                  <Label htmlFor="job-title">
                    Job Title <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="job-title"
                    placeholder="e.g. Senior React Developer"
                  />

                  {/* Example validation state */}
                  <p className="hidden text-sm text-destructive">
                    Job title is required
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Job Category <span className="text-destructive">*</span>
                  </Label>

                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    <option>Technology</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Finance</option>
                    <option>Human Resources</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment-type">
                    Employment Type <span className="text-destructive">*</span>
                  </Label>

                  <select
                    id="employment-type"
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select employment type</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="positions">
                    Number of Available Positions{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="positions"
                    type="number"
                    min="1"
                    placeholder="e.g. 2"
                  />
                </div>

              </CardContent>
            </Card>

            {/* Job Location */}
            <Card>
              <CardHeader>
                <CardTitle>Job Location</CardTitle>
              </CardHeader>

              <CardContent className="grid gap-5 md:grid-cols-2">

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="location"
                    placeholder="e.g. Addis Ababa, Ethiopia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work-mode">Work Location</Label>

                  <select
                    id="work-mode"
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option>On-site</option>
                    <option>Remote</option>
                  </select>
                </div>

              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>

              <CardContent className="grid gap-5">

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Job Description{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <textarea
                    id="description"
                    className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Describe the position..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">
                    Responsibilities{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <textarea
                    id="responsibilities"
                    className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="List the main responsibilities..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">
                    Requirements{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <textarea
                    id="requirements"
                    className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="List the required qualifications and skills..."
                  />
                </div>

              </CardContent>
            </Card>

            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>

              <CardContent>

                <div className="max-w-md space-y-2">
                  <Label htmlFor="deadline">
                    Application Deadline{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="deadline"
                    type="date"
                  />

                  <p className="text-xs text-muted-foreground">
                    Applications will close after this date.
                  </p>

                  {/* Example validation state */}
                  <p className="hidden text-sm text-destructive">
                    Application deadline is required
                  </p>
                </div>

              </CardContent>
            </Card>

            {/* Admin notice */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-medium">Important</p>
              <p className="mt-1">
                Your job post will be reviewed by an administrator before it
                becomes publicly visible.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline">
                Cancel
              </Button>

              <Button type="button" variant="outline">
                Save as Draft
              </Button>

              <Button type="submit">
                Post Job
              </Button>
            </div>

          </form>
        </main>
      </div>
    </div>
  )
}