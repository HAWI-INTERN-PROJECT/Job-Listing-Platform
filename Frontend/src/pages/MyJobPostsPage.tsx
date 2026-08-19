import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react'

import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const jobs = [
  {
    title: 'Senior React Developer',
    category: 'Technology',
    location: 'Addis Ababa',
    type: 'Full-time',
    applications: 24,
    deadline: 'Aug 30, 2026',
    status: 'Approved',
  },
  {
    title: 'UI/UX Designer',
    category: 'Design',
    location: 'Addis Ababa',
    type: 'Contract',
    applications: 12,
    deadline: 'Sep 5, 2026',
    status: 'Pending',
  },
  {
    title: 'Marketing Manager',
    category: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    applications: 15,
    deadline: 'Aug 25, 2026',
    status: 'Closed',
  },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Approved: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Rejected: 'bg-red-100 text-red-700',
    Closed: 'bg-gray-100 text-gray-700',
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {status}
    </span>
  )
}

export default function MyJobPostsPage() {
  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      {/* Sidebar */}
      <EmployerSidebar />

      {/* Main area */}
      <div className="min-w-0 flex-1 ">
        {/* Top navigation */}
        <EmployerHeader title="My Job Posts" />

        {/* Content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Page heading */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                My Job Posts
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage and track all jobs posted by your company.
              </p>
            </div>

            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post a New Job
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-3 md:grid-cols-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    className="pl-9"
                    placeholder="Search jobs"
                  />
                </div>

                {/* Status */}
                <select className="h-10 rounded-md border bg-background px-3 text-sm">
                  <option>All Status</option>
                  <option>Approved</option>
                  <option>Pending</option>
                  <option>Rejected</option>
                  <option>Closed</option>
                </select>

                {/* Employment type */}
                <select className="h-10 rounded-md border bg-background px-3 text-sm">
                  <option>All Employment Types</option>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Jobs table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Job Posts</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="px-6 py-3 font-medium">
                        Job Title
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Category
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Location
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Employment Type
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Applications
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Deadline
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Status
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {jobs.map((job) => (
                      <tr
                        key={job.title}
                        className="border-b last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-6 py-4 font-medium">
                          {job.title}
                        </td>

                        <td className="px-6 py-4">
                          {job.category}
                        </td>

                        <td className="px-6 py-4">
                          {job.location}
                        </td>

                        <td className="px-6 py-4">
                          {job.type}
                        </td>

                        <td className="px-6 py-4">
                          {job.applications}
                        </td>

                        <td className="px-6 py-4">
                          {job.deadline}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={job.status} />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              View
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              Edit
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              Close
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <MoreHorizontal className="h-4 w-4" />
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

          {/* Pagination */}
          <div className="flex items-center justify-between py-5">
            <p className="text-sm text-muted-foreground">
              Showing 1–3 of 3 job posts
            </p>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>

              <Button size="sm">1</Button>

              <Button variant="outline" size="sm">
                <ChevronRight className="ml-1 h-4 w-4" />
                Next
              </Button>
            </div>
          </div>

          {/* Empty state */}
          <Card className="mt-4 hidden">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>

              <h3 className="text-lg font-semibold">
                No job posts yet
              </h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Create your first job post to start receiving applications.
              </p>

              <Button className="mt-5">
                <Plus className="mr-2 h-4 w-4" />
                Post a New Job
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}