import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  Bell,
  Plus,
  Eye,
  Pencil,
  X,
} from 'lucide-react'
import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function EmployerDashboardPage() {
  const jobs = [
    {
      title: 'Senior React Developer',
      location: 'Addis Ababa',
      type: 'Full-time',
      applications: 24,
      status: 'Approved',
    },
    {
      title: 'UI/UX Designer',
      location: 'Addis Ababa',
      type: 'Contract',
      applications: 12,
      status: 'Pending',
    },
    {
      title: 'Marketing Manager',
      location: 'Remote',
      type: 'Full-time',
      applications: 15,
      status: 'Closed',
    },
    {
      title: 'Backend Developer',
      location: 'Addis Ababa',
      type: 'Full-time',
      applications: 18,
      status: 'Rejected',
    },
  ]

  const applications = [
    {
      name: 'Alex Rivers',
      job: 'Senior React Developer',
      date: 'Aug 12, 2026',
      status: 'Under Review',
    },
    {
      name: 'Sara Johnson',
      job: 'UI/UX Designer',
      date: 'Aug 11, 2026',
      status: 'Shortlisted',
    },
    {
      name: 'Daniel Smith',
      job: 'Senior React Developer',
      date: 'Aug 10, 2026',
      status: 'Submitted',
    },
    {
      name: 'Emily Brown',
      job: 'Marketing Manager',
      date: 'Aug 9, 2026',
      status: 'Hired',
    },
  ]

  const statusClass = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Hired':
        return 'bg-green-100 text-green-700'
      case 'Pending':
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-700'
      case 'Rejected':
        return 'bg-red-100 text-red-700'
      case 'Closed':
        return 'bg-gray-100 text-gray-700'
      case 'Shortlisted':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
  <div className="min-h-screen bg-muted/40">
    <EmployerSidebar />

    <div className="md:ml-64">
      <EmployerHeader title="Employer Dashboard" />

      {/* Dashboard content */}
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        {/* Top navigation */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold">Employer Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 hover:bg-muted">
              <Bell className="h-5 w-5" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              E
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
          {/* Welcome */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, Employer!
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Here's an overview of your jobs and applications.
              </p>
            </div>

            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post a New Job
            </Button>
          </div>

          {/* Approval banner */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-start gap-3 p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />

              <div>
                <p className="font-semibold text-green-800">
                  Employer Account Approved
                </p>
                <p className="text-sm text-green-700">
                  Your company is approved and you can publish job posts.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold">148</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-yellow-100 p-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Applications
                  </p>
                  <p className="text-2xl font-bold">32</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-gray-100 p-3">
                  <CheckCircle className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Closed Jobs</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <CardTitle>Recent Job Posts</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your latest job listings
                  </p>
                </div>

                <Button variant="outline" size="sm">
                  View All Jobs
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Job Title</th>
                      <th className="pb-3 font-medium">Location</th>
                      <th className="pb-3 font-medium">Employment Type</th>
                      <th className="pb-3 font-medium">Applications</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.title} className="border-b last:border-0">
                        <td className="py-4 font-medium">{job.title}</td>
                        <td className="py-4 text-muted-foreground">
                          {job.location}
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {job.type}
                        </td>
                        <td className="py-4">{job.applications}</td>
                        <td className="py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                              job.status
                            )}`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Applications + Status overview */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent applications */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Applications</CardTitle>

                  <Button variant="outline" size="sm">
                    View All Applicants
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={`${application.name}-${application.job}`}
                      className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">{application.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.job}
                        </p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {application.date}
                      </div>

                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application status overview */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status Overview</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {[
                  ['Submitted', 48],
                  ['Under Review', 32],
                  ['Shortlisted', 24],
                  ['Rejected', 32],
                  ['Hired', 12],
                ].map(([label, count]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
                </main>
              </div>
          </div>
  </div>
  )
}