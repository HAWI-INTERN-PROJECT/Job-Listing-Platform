
import { useState } from 'react'
import {
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import EmployerSidebar from '@/components/employer/EmployerSidebar'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const initialJobs = [
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
  const [jobs, setJobs] = useState(initialJobs)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [typeFilter, setTypeFilter] = useState(
    'All Employment Types',
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [showNotifications, setShowNotifications] =
    useState(false)

  const jobsPerPage = 2

  const filteredJobs = jobs.filter((job) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      job.title.toLowerCase().includes(search) ||
      job.category.toLowerCase().includes(search) ||
      job.location.toLowerCase().includes(search)

    const matchesStatus =
      statusFilter === 'All Status' ||
      job.status === statusFilter

    const matchesType =
      typeFilter === 'All Employment Types' ||
      job.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const totalPages = Math.max(
    1,
    Math.ceil(filteredJobs.length / jobsPerPage),
  )

  const startIndex = (currentPage - 1) * jobsPerPage

  const paginatedJobs = filteredJobs.slice(
    startIndex,
    startIndex + jobsPerPage,
  )

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleTypeChange = (value: string) => {
    setTypeFilter(value)
    setCurrentPage(1)
  }

  const handleCloseJob = (jobTitle: string) => {
    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.title === jobTitle
          ? { ...job, status: 'Closed' }
          : job,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      {/* Sidebar */}
      <EmployerSidebar />

      {/* Main area */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <header className="relative flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
          <h1 className="text-xl font-semibold">
            My Job Posts
          </h1>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    !showNotifications,
                  )
                }
                className="rounded-full p-2 hover:bg-muted"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-20 w-72 rounded-lg border bg-background p-4 shadow-lg">
                  <p className="font-semibold">
                    Notifications
                  </p>

                  <div className="mt-3 space-y-3 text-sm">
                    <div className="border-b pb-3">
                      You have new applications to review.
                    </div>

                    <div className="border-b pb-3">
                      Your job post is awaiting review.
                    </div>

                    <div>
                      Your employer account is approved.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <Link
              to="/company-profile"
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                AR
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-medium">
                  Employer
                </p>

                <p className="text-xs text-muted-foreground">
                  Company Profile
                </p>
              </div>
            </Link>
          </div>
        </header>

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

            <Link to="/create-job">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Post a New Job
              </Button>
            </Link>
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
                    value={searchTerm}
                    onChange={(event) =>
                      handleSearchChange(
                        event.target.value,
                      )
                    }
                  />
                </div>

                {/* Status */}
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={statusFilter}
                  onChange={(event) =>
                    handleStatusChange(
                      event.target.value,
                    )
                  }
                >
                  <option>All Status</option>
                  <option>Approved</option>
                  <option>Pending</option>
                  <option>Rejected</option>
                  <option>Closed</option>
                </select>

                {/* Employment type */}
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={typeFilter}
                  onChange={(event) =>
                    handleTypeChange(
                      event.target.value,
                    )
                  }
                >
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
                    {paginatedJobs.length > 0 ? (
                      paginatedJobs.map((job) => (
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
                            <StatusBadge
                              status={job.status}
                            />
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              {/* View */}
                              <Link to="/job-applicants">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                >
                                  View
                                </Button>
                              </Link>

                              {/* Edit */}
                              <Link to="/edit-job">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                >
                                  Edit
                                </Button>
                              </Link>

                              {/* Close */}
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={
                                  job.status === 'Closed'
                                }
                                onClick={() =>
                                  handleCloseJob(
                                    job.title,
                                  )
                                }
                              >
                                {job.status === 'Closed'
                                  ? 'Closed'
                                  : 'Close'}
                              </Button>

                              {/* More */}
                              <Button
                                variant="ghost"
                                size="icon"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-12 text-center text-muted-foreground"
                        >
                          No job posts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between py-5">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedJobs.length} of{' '}
              {filteredJobs.length} job posts
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(page - 1, 1),
                  )
                }
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>

              {Array.from(
                { length: totalPages },
                (_, index) => (
                  <Button
                    key={index + 1}
                    size="sm"
                    variant={
                      currentPage === index + 1
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      setCurrentPage(index + 1)
                    }
                  >
                    {index + 1}
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={
                  currentPage === totalPages ||
                  filteredJobs.length === 0
                }
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(page + 1, totalPages),
                  )
                }
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
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
                Create your first job post to start receiving
                applications.
              </p>

              <Link to="/create-job">
                <Button className="mt-5">
                  <Plus className="mr-2 h-4 w-4" />
                  Post a New Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

