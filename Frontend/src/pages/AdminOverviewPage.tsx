import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  BriefcaseBusiness,
  FileText,
  Building2,
  TrendingUp,
  UserCheck,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import api from '@/lib/api'

interface RecentJob {
  id: number
  title: string
  company: string
  applications: number
  status: string
}

interface AdminStatsData {
  total_users: number
  active_jobs: number
  total_applications: number
  total_companies: number
  active_users: number
  pending_reviews: number
  jobs_approved: number
  pending_job_approvals: number
  pending_employer_approvals: number
  recent_jobs: RecentJob[]
}

export default function AdminOverviewPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStatsData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.get('/admin/stats')
        const data: AdminStatsData = response.data?.data ?? response.data
        setStats(data)
      } catch (err: unknown) {
        console.error('Failed to fetch admin stats:', err)
        setError('Failed to load dashboard statistics from backend.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Users',
      value: stats ? stats.total_users.toLocaleString() : '0',
      subtitle: 'Registered accounts',
      icon: Users,
    },
    {
      title: 'Active Jobs',
      value: stats ? stats.active_jobs.toLocaleString() : '0',
      subtitle: 'Published listings',
      icon: BriefcaseBusiness,
    },
    {
      title: 'Applications',
      value: stats ? stats.total_applications.toLocaleString() : '0',
      subtitle: 'Submitted by candidates',
      icon: FileText,
    },
    {
      title: 'Companies',
      value: stats ? stats.total_companies.toLocaleString() : '0',
      subtitle: 'Registered employers',
      icon: Building2,
    },
  ]

  const getStatusBadge = (status: string) => {
    const normalized = status.toLowerCase()
    if (normalized.includes('approved') || normalized.includes('published')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    }
    if (normalized.includes('pending')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
    }
    if (normalized.includes('rejected')) {
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
    }
    return 'bg-muted text-muted-foreground border border-border'
  }

  return (
    <div className="space-y-6">
      {/* Notion Document Header */}
      <div className="border-b border-border/60 pb-5 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-foreground text-[11px] font-semibold">
            ⌘
          </span>
          <span>Admin Workspace / Operations & Metrics</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              High-level system metrics, pending approval queues, and real-time platform activity.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/create-job')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
            >
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              <span>Post Job</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm font-medium">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="bg-card border border-border/70 rounded-xl p-4.5 transition-all duration-150 hover:border-foreground/20 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <div className="p-2 rounded-lg bg-muted text-foreground flex-shrink-0">
                  <Icon size={16} />
                </div>
              </div>
              <div>
                {isLoading ? (
                  <div className="h-7 w-20 bg-muted animate-pulse rounded my-1" />
                ) : (
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                )}
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Platform Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Overview */}
        <div className="lg:col-span-2 bg-card border border-border/70 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Platform Overview</h3>
              <p className="text-xs text-muted-foreground">Live platform activity and operational metrics</p>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserCheck size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium">Active Users</span>
              </div>
              {isLoading ? (
                <div className="h-6 w-14 bg-muted animate-pulse rounded my-1" />
              ) : (
                <p className="text-xl font-bold text-foreground">{stats?.active_users ?? 0}</p>
              )}
              <p className="text-[10px] text-muted-foreground">Verified accounts</p>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium">Pending Reviews</span>
              </div>
              {isLoading ? (
                <div className="h-6 w-14 bg-muted animate-pulse rounded my-1" />
              ) : (
                <p className="text-xl font-bold text-foreground">{stats?.pending_reviews ?? 0}</p>
              )}
              <p className="text-[10px] text-muted-foreground">Requires moderation</p>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium">Jobs Approved</span>
              </div>
              {isLoading ? (
                <div className="h-6 w-14 bg-muted animate-pulse rounded my-1" />
              ) : (
                <p className="text-xl font-bold text-foreground">{stats?.jobs_approved ?? 0}</p>
              )}
              <p className="text-[10px] text-muted-foreground">Published listings</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border/70 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/admin/jobs')}
              className="w-full group flex items-center justify-between p-3 rounded-lg border border-border/70 bg-card hover:bg-muted/40 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <BriefcaseBusiness className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Review Job Queue</p>
                  <p className="text-[10px] text-muted-foreground">Approve or reject job listings</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            <button
              onClick={() => navigate('/admin/applications')}
              className="w-full group flex items-center justify-between p-3 rounded-lg border border-border/70 bg-card hover:bg-muted/40 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Review Applications</p>
                  <p className="text-[10px] text-muted-foreground">Track candidate submissions</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="w-full group flex items-center justify-between p-3 rounded-lg border border-border/70 bg-card hover:bg-muted/40 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Manage Users</p>
                  <p className="text-[10px] text-muted-foreground">Account access & suspensions</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Job Listings */}
      <div className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Recent Job Listings</h3>
            <p className="text-xs text-muted-foreground">Latest jobs submitted across the platform</p>
          </div>
          <button
            onClick={() => navigate('/admin/jobs')}
            className="text-xs text-foreground font-medium hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                <th className="px-5 py-3">Job Title</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Applications</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span>Loading recent job listings...</span>
                    </div>
                  </td>
                </tr>
              ) : !stats?.recent_jobs || stats.recent_jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No recent job listings found.
                  </td>
                </tr>
              ) : (
                stats.recent_jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{job.title}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{job.company}</td>
                    <td className="px-5 py-3.5 text-foreground font-mono">{job.applications}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${getStatusBadge(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate('/admin/jobs')}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
