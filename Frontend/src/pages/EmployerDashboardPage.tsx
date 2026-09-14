import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  Plus,
  Eye,
  Pencil,
  X,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import { Button } from '@/components/ui/button'

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
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
      case 'Pending':
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
      case 'Shortlisted':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
      case 'Submitted':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
      case 'Closed':
      default:
        return 'bg-muted text-muted-foreground border border-border'
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <EmployerSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title="Employer Dashboard" />

        {/* Dashboard content */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Notion Document Header */}
          <div className="border-b border-border/60 pb-5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-foreground text-[11px] font-semibold">
                📊
              </span>
              <span>Employer Portal / Operations Dashboard</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Employer Dashboard
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Welcome back! Here's an overview of your job postings, candidate applications, and hiring funnel.
                </p>
              </div>

              <Link to="/create-job">
                <Button size="sm" className="rounded-lg h-8 px-3.5 text-xs font-medium self-start sm:self-auto bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Post a New Job
                </Button>
              </Link>
            </div>
          </div>

          {/* Approval banner */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-start gap-3 text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold">Employer Account Approved</p>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90 mt-0.5">
                Your company is verified and approved to publish active job posts across the platform.
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/70 bg-card p-4.5 shadow-xs space-y-2 hover:border-foreground/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Active Jobs</span>
                <div className="p-2 rounded-lg bg-muted text-foreground">
                  <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">12</p>
              <p className="text-[11px] text-muted-foreground">Currently published</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4.5 shadow-xs space-y-2 hover:border-foreground/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Applications</span>
                <div className="p-2 rounded-lg bg-muted text-foreground">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">148</p>
              <p className="text-[11px] text-muted-foreground">Across all job postings</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4.5 shadow-xs space-y-2 hover:border-foreground/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Pending Review</span>
                <div className="p-2 rounded-lg bg-muted text-foreground">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">32</p>
              <p className="text-[11px] text-muted-foreground">Awaiting your screening</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4.5 shadow-xs space-y-2 hover:border-foreground/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Closed Jobs</span>
                <div className="p-2 rounded-lg bg-muted text-foreground">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">8</p>
              <p className="text-[11px] text-muted-foreground">Archived or filled</p>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
            <div className="p-4.5 border-b border-border/60 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Recent Job Posts</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Your latest job listings and real-time response rates</p>
              </div>

              <Link to="/my-job-posts">
                <Button variant="outline" size="sm" className="rounded-lg h-7 px-2.5 text-xs">
                  View All Jobs
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3">Job Title</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Employment Type</th>
                    <th className="px-5 py-3">Applications</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/50">
                  {jobs.map((job) => (
                    <tr key={job.title} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        {job.title}
                      </td>

                      <td className="px-5 py-3.5 text-muted-foreground">
                        {job.location}
                      </td>

                      <td className="px-5 py-3.5 text-muted-foreground">
                        {job.type}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-foreground">
                        {job.applications}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusClass(job.status)}`}>
                          {job.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to="/my-job-posts">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="View job">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Link to="/edit-job">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Edit job">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400" title="Close job">
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Applications + Status overview */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent applications */}
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Recent Applications</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Latest candidates who submitted applications</p>
                </div>

                <Link to="/job-applicants">
                  <Button variant="outline" size="sm" className="rounded-lg h-7 px-2.5 text-xs">
                    View All Applicants
                  </Button>
                </Link>
              </div>

              <div className="space-y-2.5">
                {applications.map((application) => (
                  <div
                    key={`${application.name}-${application.job}`}
                    className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <Link
                        to="/applicant-details"
                        className="font-medium text-foreground text-xs hover:underline"
                      >
                        {application.name}
                      </Link>

                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {application.job}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground">
                        {application.date}
                      </span>

                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusClass(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application status overview */}
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-sm font-semibold text-foreground">Application Status Overview</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Candidate funnel distribution</p>
              </div>

              <div className="space-y-3">
                {[
                  ['Submitted', 48, 'text-blue-600 dark:text-blue-400'],
                  ['Under Review', 32, 'text-amber-600 dark:text-amber-400'],
                  ['Shortlisted', 24, 'text-purple-600 dark:text-purple-400'],
                  ['Rejected', 32, 'text-rose-600 dark:text-rose-400'],
                  ['Hired', 12, 'text-emerald-600 dark:text-emerald-400'],
                ].map(([label, count, colorClass]) => (
                  <div
                    key={label as string}
                    className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0 text-xs"
                  >
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className={`font-semibold font-mono ${colorClass}`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
