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
      return 'bg-green-100 text-green-700 border-green-200'
    }
    if (normalized.includes('pending')) {
      return 'bg-amber-100 text-amber-700 border-amber-200'
    }
    if (normalized.includes('rejected')) {
      return 'bg-red-100 text-red-700 border-red-200'
    }
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-xl border p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-slate-100 animate-pulse rounded mt-2" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                  )}
                  <p className="text-xs text-slate-500 mt-2">{stat.subtitle}</p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Platform Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Platform Overview</h3>
              <p className="text-sm text-slate-500">Live platform activity metrics</p>
            </div>
            <TrendingUp className="text-green-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <UserCheck className="text-blue-600 mb-2" size={22} />
              {isLoading ? (
                <div className="h-7 w-16 bg-slate-200 animate-pulse rounded my-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{stats?.active_users ?? 0}</p>
              )}
              <p className="text-sm text-slate-500">Active users</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <Clock className="text-orange-500 mb-2" size={22} />
              {isLoading ? (
                <div className="h-7 w-16 bg-slate-200 animate-pulse rounded my-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{stats?.pending_reviews ?? 0}</p>
              )}
              <p className="text-sm text-slate-500">Pending reviews</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <CheckCircle className="text-green-600 mb-2" size={22} />
              {isLoading ? (
                <div className="h-7 w-16 bg-slate-200 animate-pulse rounded my-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{stats?.jobs_approved ?? 0}</p>
              )}
              <p className="text-sm text-slate-500">Jobs approved</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/create-job')}
              className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
            >
              + Add New Job
            </button>
            <button
              onClick={() => navigate('/admin/applications')}
              className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
            >
              Review Applications
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
            >
              Manage Users
            </button>
          </div>
        </div>
      </div>

      {/* Recent Job Listings */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recent Job Listings</h3>
            <p className="text-sm text-slate-500">Latest jobs submitted across the platform</p>
          </div>
          <button
            onClick={() => navigate('/admin/jobs')}
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-500 border-b bg-slate-50/50">
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Applications</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={20} />
                      <span>Loading recent job listings...</span>
                    </div>
                  </td>
                </tr>
              ) : !stats?.recent_jobs || stats.recent_jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No recent job listings found.
                  </td>
                </tr>
              ) : (
                stats.recent_jobs.map((job) => (
                  <tr key={job.id} className="border-b last:border-0 hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{job.title}</td>
                    <td className="px-6 py-4 text-slate-600">{job.company}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{job.applications}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate('/admin/jobs')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
