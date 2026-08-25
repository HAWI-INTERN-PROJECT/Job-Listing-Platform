
import { useMemo, useState } from 'react'
import {
  Download,
  MoreHorizontal,
  Search,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Applicant = {
  id: number
  name: string
  job: string
  date: string
  dateValue: string
  experience: string
  status: string
  cv: string
}

const initialApplicants: Applicant[] = [
  {
    id: 1,
    name: 'Alex Rivers',
    job: 'Senior React Developer',
    date: 'Aug 12, 2026',
    dateValue: '2026-08-12',
    experience: '3 years',
    status: 'Under Review',
    cv: 'Alex-Rivers-CV.pdf',
  },
  {
    id: 2,
    name: 'Sara Johnson',
    job: 'Senior React Developer',
    date: 'Aug 11, 2026',
    dateValue: '2026-08-11',
    experience: '2 years',
    status: 'Submitted',
    cv: 'Sara-Johnson-CV.pdf',
  },
  {
    id: 3,
    name: 'Daniel Smith',
    job: 'Senior React Developer',
    date: 'Aug 10, 2026',
    dateValue: '2026-08-10',
    experience: '4 years',
    status: 'Shortlisted',
    cv: 'Daniel-Smith-CV.pdf',
  },
  {
    id: 4,
    name: 'Emily Brown',
    job: 'UI/UX Designer',
    date: 'Aug 9, 2026',
    dateValue: '2026-08-09',
    experience: '5 years',
    status: 'Submitted',
    cv: 'Emily-Brown-CV.pdf',
  },
  {
    id: 5,
    name: 'Michael Green',
    job: 'UI/UX Designer',
    date: 'Aug 8, 2026',
    dateValue: '2026-08-08',
    experience: '3 years',
    status: 'Under Review',
    cv: 'Michael-Green-CV.pdf',
  },
  {
    id: 6,
    name: 'Sophia Williams',
    job: 'Marketing Manager',
    date: 'Aug 7, 2026',
    dateValue: '2026-08-07',
    experience: '6 years',
    status: 'Shortlisted',
    cv: 'Sophia-Williams-CV.pdf',
  },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Submitted: 'bg-blue-100 text-blue-700',
    'Under Review': 'bg-yellow-100 text-yellow-700',
    Shortlisted: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Hired: 'bg-purple-100 text-purple-700',
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

export default function JobApplicantsPage() {
  const navigate = useNavigate()

  const [applicants, setApplicants] =
    useState<Applicant[]>(initialApplicants)

  const [selectedJob, setSelectedJob] =
    useState('Senior React Developer')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [jobFilter, setJobFilter] = useState('All Jobs')
  const [dateFilter, setDateFilter] = useState('')

  const [currentPage, setCurrentPage] = useState(1)

  const [openMenu, setOpenMenu] =
    useState<number | null>(null)

  const itemsPerPage = 3

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const matchesSearch =
        applicant.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        applicant.job
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'All Statuses' ||
        applicant.status === statusFilter

      const matchesJob =
        jobFilter === 'All Jobs' ||
        applicant.job === jobFilter

      const matchesDate =
        dateFilter === '' ||
        applicant.dateValue === dateFilter

      const matchesSelectedJob =
        selectedJob === 'All Jobs' ||
        applicant.job === selectedJob

      return (
        matchesSearch &&
        matchesStatus &&
        matchesJob &&
        matchesDate &&
        matchesSelectedJob
      )
    })
  }, [
    applicants,
    search,
    statusFilter,
    jobFilter,
    dateFilter,
    selectedJob,
  ])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplicants.length / itemsPerPage),
  )

  const startIndex = (currentPage - 1) * itemsPerPage

  const visibleApplicants = filteredApplicants.slice(
    startIndex,
    startIndex + itemsPerPage,
  )

  function resetPage() {
    setCurrentPage(1)
  }

  function handleSearch(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setSearch(event.target.value)
    resetPage()
  }

  function handleStatusFilter(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setStatusFilter(event.target.value)
    resetPage()
  }

  function handleJobFilter(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setJobFilter(event.target.value)
    resetPage()
  }

  function handleDateFilter(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setDateFilter(event.target.value)
    resetPage()
  }

  function handleSelectedJob(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setSelectedJob(event.target.value)
    resetPage()
  }

  function handlePrevious() {
    setCurrentPage((page) => Math.max(page - 1, 1))
  }

  function handleNext() {
    setCurrentPage((page) =>
      Math.min(page + 1, totalPages),
    )
  }

  function handlePageChange(page: number) {
    setCurrentPage(page)
  }

  function handleDownloadCV(applicant: Applicant) {
    const cvContent = `
${applicant.name}

Applied Position: ${applicant.job}
Experience: ${applicant.experience}

This is a sample CV file for demonstration purposes.
    `

    const blob = new Blob([cvContent], {
      type: 'text/plain',
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = applicant.cv.replace('.pdf', '.txt')

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  function updateApplicantStatus(
    applicantId: number,
    status: string,
  ) {
    setApplicants((currentApplicants) =>
      currentApplicants.map((applicant) =>
        applicant.id === applicantId
          ? { ...applicant, status }
          : applicant,
      ),
    )

    setOpenMenu(null)
  }

  function handleViewProfile(applicantId: number) {
    setOpenMenu(null)

    navigate(`/applicant-details?id=${applicantId}`)
  }

  function clearFilters() {
    setSearch('')
    setStatusFilter('All Statuses')
    setJobFilter('All Jobs')
    setDateFilter('')
    setSelectedJob('All Jobs')
    setCurrentPage(1)
  }

  const selectedJobApplicants =
    selectedJob === 'All Jobs'
      ? applicants
      : applicants.filter(
          (applicant) => applicant.job === selectedJob,
        )

  const totalApplicants =
    selectedJobApplicants.length

  const submittedCount =
    selectedJobApplicants.filter(
      (applicant) => applicant.status === 'Submitted',
    ).length

  const underReviewCount =
    selectedJobApplicants.filter(
      (applicant) =>
        applicant.status === 'Under Review',
    ).length

  const shortlistedCount =
    selectedJobApplicants.filter(
      (applicant) =>
        applicant.status === 'Shortlisted',
    ).length

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      {/* Sidebar */}
      <EmployerSidebar />

      {/* Main area */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <EmployerHeader title="Job Applicants" />

        {/* Content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              Job Applicants
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Review and manage applications received for your job posts.
            </p>
          </div>

          {/* Job selector */}
          <Card>
            <CardContent className="p-4">
              <div>
                <label className="text-sm font-medium">
                  Select Job
                </label>

                <select
                  value={selectedJob}
                  onChange={handleSelectedJob}
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-80"
                >
                  <option>All Jobs</option>
                  <option>Senior React Developer</option>
                  <option>UI/UX Designer</option>
                  <option>Marketing Manager</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Summary cards */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Total Applicants
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {totalApplicants}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Submitted
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {submittedCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Under Review
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {underReviewCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Shortlisted
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {shortlistedCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mt-5">
            <CardContent className="p-4">
              <div className="grid gap-3 md:grid-cols-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={search}
                    onChange={handleSearch}
                    className="pl-9"
                    placeholder="Search applicant"
                  />
                </div>

                {/* Status */}
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option>All Statuses</option>
                  <option>Submitted</option>
                  <option>Under Review</option>
                  <option>Shortlisted</option>
                  <option>Rejected</option>
                  <option>Hired</option>
                </select>

                {/* Job */}
                <select
                  value={jobFilter}
                  onChange={handleJobFilter}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option>All Jobs</option>
                  <option>Senior React Developer</option>
                  <option>UI/UX Designer</option>
                  <option>Marketing Manager</option>
                </select>

                {/* Date */}
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={handleDateFilter}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={clearFilters}
                    title="Clear filters"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applicants table */}
          <Card className="mt-5">
            <CardHeader>
              <CardTitle>
                Applicants
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="px-6 py-3 font-medium">
                        Applicant
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Job
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Applied Date
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Experience
                      </th>

                      <th className="px-6 py-3 font-medium">
                        CV
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
                    {visibleApplicants.length > 0 ? (
                      visibleApplicants.map(
                        (applicant) => (
                          <tr
                            key={applicant.id}
                            className="border-b last:border-0 hover:bg-muted/20"
                          >
                            {/* Applicant */}
                            <td className="px-6 py-4">
                              <Link
                                to={`/applicant-details?id=${applicant.id}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {applicant.name}
                              </Link>
                            </td>

                            {/* Job */}
                            <td className="px-6 py-4">
                              {applicant.job}
                            </td>

                            {/* Date */}
                            <td className="px-6 py-4">
                              {applicant.date}
                            </td>

                            {/* Experience */}
                            <td className="px-6 py-4">
                              {applicant.experience}
                            </td>

                            {/* CV */}
                            <td className="px-6 py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownloadCV(applicant)
                                }
                              >
                                <Download className="mr-2 h-4 w-4" />
                                CV
                              </Button>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              <StatusBadge
                                status={applicant.status}
                              />
                            </td>

                            {/* Actions */}
                            <td className="relative px-6 py-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  setOpenMenu(
                                    openMenu === applicant.id
                                      ? null
                                      : applicant.id,
                                  )
                                }
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>

                              {openMenu === applicant.id && (
                                <div className="absolute right-6 top-14 z-20 w-48 rounded-md border bg-background p-1 shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleViewProfile(
                                        applicant.id,
                                      )
                                    }
                                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                                  >
                                    View Profile
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateApplicantStatus(
                                        applicant.id,
                                        'Under Review',
                                      )
                                    }
                                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                                  >
                                    Mark Under Review
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateApplicantStatus(
                                        applicant.id,
                                        'Shortlisted',
                                      )
                                    }
                                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                                  >
                                    Shortlist
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateApplicantStatus(
                                        applicant.id,
                                        'Rejected',
                                      )
                                    }
                                    className="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-muted"
                                  >
                                    Reject
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateApplicantStatus(
                                        applicant.id,
                                        'Hired',
                                      )
                                    }
                                    className="w-full rounded px-3 py-2 text-left text-sm text-green-600 hover:bg-muted"
                                  >
                                    Hire Applicant
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ),
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-muted-foreground"
                        >
                          No applicants found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{' '}
                  {filteredApplicants.length === 0
                    ? 0
                    : startIndex + 1}
                  –
                  {Math.min(
                    startIndex + itemsPerPage,
                    filteredApplicants.length,
                  )}{' '}
                  of {filteredApplicants.length} applicants
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <Button
                      key={page}
                      variant={
                        currentPage === page
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        handlePageChange(page)
                      }
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={
                      currentPage === totalPages
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

