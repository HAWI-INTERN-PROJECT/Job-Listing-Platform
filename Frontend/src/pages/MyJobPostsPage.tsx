import { useState, useEffect } from 'react'
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
import api from '@/lib/api'

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
    id: 1,
    title: 'Senior React Developer',
    category: 'Technology',
    location: 'Addis Ababa',
    type: 'Full-time',
    applications: 24,
    deadline: 'Aug 30, 2026',
    status: 'Approved',
  },
  {
    id: 2,
    title: 'UI/UX Designer',
    category: 'Design',
    location: 'Addis Ababa',
    type: 'Contract',
    applications: 12,
    deadline: 'Sep 5, 2026',
    status: 'Pending',
  },
  {
    id: 3,
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

  useEffect(() => {
    let mounted = true
    const fetchEmployerJobs = async () => {
      try {
        const res = await api.get('/employer/jobs')
        const data = res.data?.data?.data || res.data?.data
        if (mounted && Array.isArray(data) && data.length > 0) {
          setJobs(
            data.map((j: any) => ({
              id: j.id,
              title: j.title,
              category: j.category?.name || 'General',
              location: j.location || 'Remote',
              type: j.job_type_label || j.job_type || 'Full-time',
              applications: j.applications_count ?? 0,
              deadline: j.deadline ? new Date(j.deadline).toLocaleDateString() : 'N/A',
              status: j.status
                ? j.status.charAt(0).toUpperCase() + j.status.slice(1)
                : 'Pending',
            })),
          )
        }
      } catch {
        // Fallback to initialJobs if guest or offline
      }
    }
    fetchEmployerJobs()
    return () => {
      mounted = false
    }
  }, [])

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

  const handleCloseJob = (jobId: number) => {
    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.id === jobId
          ? { ...job, status: 'Closed' }
          : job,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <EmployerSidebar />

      <div className="min-w-0 flex-1">
        <header className="relative flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
          <h1 className="text-xl font-semibold">
            My Job Posts
          </h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowNotifications(!showNotifications)
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

                    <div>Job post approved.</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              TC
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                My Job Posts
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage your job listings and track applications.
              </p>
            </div>

            <Link to="/create-job">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Post a New Job
              </Button>
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Jobs
                </CardTitle>

                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-bold">12</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Jobs
                </CardTitle>

                <span className="h-2 w-2 rounded-full bg-green-500" />
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-bold">8</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Currently receiving applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Approval
                </CardTitle>

                <span className="h-2 w-2 rounded-full bg-yellow-500" />
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-bold">3</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Under admin review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Applications
                </CardTitle>

                <span className="text-xs text-muted-foreground">
                  👥
                </span>
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-bold">142</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Across all job posts
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) =>
                      handleSearchChange(e.target.value)
                    }
                    className="pl-9"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    handleStatusChange(e.target.value)
                  }
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option>All Status</option>
                  <option>Approved</option>
                  <option>Pending</option>
                  <option>Rejected</option>
                  <option>Closed</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) =>
                    handleTypeChange(e.target.value)
                  }
                  className="h-10 rounded-md border bg-background px-3 text-sm"
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

          <Card className="mt-6">
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
                        Type
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
                          key={job.id}
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
                              <Link to={`/job-applicants?jobId=${job.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                >
                                  View
                                </Button>
                              </Link>

                              <Link to="/edit-job">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                >
                                  Edit
                                </Button>
                              </Link>

                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={
                                  job.status === 'Closed'
                                }
                                onClick={() =>
                                  handleCloseJob(job.id)
                                }
                              >
                                {job.status === 'Closed'
                                  ? 'Closed'
                                  : 'Close'}
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
