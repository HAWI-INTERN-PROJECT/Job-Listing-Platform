import {
  Download,
  MoreHorizontal,
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'

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

const applicants = [
  {
    name: 'Alex Rivers',
    job: 'Senior React Developer',
    date: 'Aug 12, 2026',
    experience: '3 years',
    status: 'Under Review',
  },
  {
    name: 'Sara Johnson',
    job: 'Senior React Developer',
    date: 'Aug 11, 2026',
    experience: '2 years',
    status: 'Submitted',
  },
  {
    name: 'Daniel Smith',
    job: 'Senior React Developer',
    date: 'Aug 10, 2026',
    experience: '4 years',
    status: 'Shortlisted',
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
  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      {/* Sidebar */}
      <EmployerSidebar />

      {/* Main area */}
      <div className="min-w-0 flex-1 ">
        {/* Top navigation */}
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

                <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-80">
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
                  48
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Submitted
                </p>

                <p className="mt-1 text-2xl font-bold">
                  18
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Under Review
                </p>

                <p className="mt-1 text-2xl font-bold">
                  15
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Shortlisted
                </p>

                <p className="mt-1 text-2xl font-bold">
                  8
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
                    className="pl-9"
                    placeholder="Search applicant"
                  />
                </div>

                {/* Status */}
                <select className="h-10 rounded-md border bg-background px-3 text-sm">
                  <option>All Statuses</option>
                  <option>Submitted</option>
                  <option>Under Review</option>
                  <option>Shortlisted</option>
                  <option>Rejected</option>
                  <option>Hired</option>
                </select>

                {/* Job */}
                <select className="h-10 rounded-md border bg-background px-3 text-sm">
                  <option>All Jobs</option>
                  <option>Senior React Developer</option>
                  <option>UI/UX Designer</option>
                  <option>Marketing Manager</option>
                </select>

                {/* Date */}
                <Input type="date" />
              </div>
            </CardContent>
          </Card>

          {/* Applicants table */}
          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Applicants</CardTitle>
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
                    {applicants.map((applicant) => (
                      <tr
                        key={applicant.name}
                        className="border-b last:border-0 hover:bg-muted/20"
                      >
                        {/* Applicant */}
                        <td className="px-6 py-4">
                          <Link
                            to="/applicant-details"
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
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing 1–3 of 48 applicants
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                  >
                    1
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                  >
                    2
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty state */}
          <Card className="mt-5 hidden">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <h2 className="text-lg font-semibold">
                No applicants yet
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                When candidates apply to your jobs, they will appear here.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}