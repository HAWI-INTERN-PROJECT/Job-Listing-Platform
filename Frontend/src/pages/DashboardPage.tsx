import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Search, FileText, ClipboardList, Briefcase,
  CheckCircle2, Clock, XCircle, ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import api from '@/lib/api'

type StatusLabel = 'Submitted' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Hired'

interface Application {
  id: number
  status?: string
  status_label?: StatusLabel
  created_at: string
  job_post: {
    title: string
    slug: string
    employer: { company_name: string } | null
    location: string | null
  } | null
}

const statusStyles: Record<StatusLabel, string> = {
  Submitted: 'bg-blue-50 text-blue-600',
  'Under Review': 'bg-amber-50 text-amber-600',
  Shortlisted: 'bg-green-50 text-green-600',
  Rejected: 'bg-red-50 text-red-600',
  Hired: 'bg-purple-50 text-purple-600',
}

const statusMap: Record<string, StatusLabel> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
  Submitted: 'Submitted',
  'Under Review': 'Under Review',
  Shortlisted: 'Shortlisted',
  Rejected: 'Rejected',
  Hired: 'Hired',
}

function getStatusLabel(app: Application): StatusLabel {
  if (app.status_label && app.status_label in statusStyles) {
    return app.status_label
  }
  if (app.status && statusMap[app.status]) {
    return statusMap[app.status]
  }
  return 'Submitted'
}

export default function DashboardPage() {
  const { user, getProfile } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    getProfile()
  }, [getProfile])

  useEffect(() => {
    if (!user) return
    if (user.role === 'employer') {
      navigate('/employer-dashboard', { replace: true })
    } else if (user.role === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [user, getProfile, navigate])

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await api.get('/employee/applications')
      const raw = res.data?.data?.data ?? res.data?.data ?? res.data
      return (Array.isArray(raw) ? raw : []) as Application[]
    },
    enabled: !!user,
  })

  const applications = Array.isArray(data) ? data : []
  const total = applications.length
  const active = applications.filter((a) => {
    const status = getStatusLabel(a)
    return status === 'Submitted' || status === 'Under Review'
  }).length
  const shortlisted = applications.filter((a) => {
    const status = getStatusLabel(a)
    return status === 'Shortlisted' || status === 'Hired'
  }).length
  const rejected = applications.filter((a) => getStatusLabel(a) === 'Rejected').length
  const recent = applications.slice(0, 4)

  const stats = [
    { label: t('dashboard.totalApplied'), value: total, icon: Briefcase, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: t('dashboard.inProgress'), value: active, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: t('dashboard.shortlisted'), value: shortlisted, icon: CheckCircle2, bg: 'bg-green-50', color: 'text-green-600' },
    { label: t('dashboard.rejected'), value: rejected, icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
  ]

  const quickLinks = [
    { label: t('dashboard.searchJobs'), icon: Search, path: '/job-search', desc: t('dashboard.searchJobsDesc') },
    { label: t('dashboard.myApplications'), icon: FileText, path: '/my-applications', desc: t('dashboard.myApplicationsDesc') },
    { label: t('dashboard.cvResume'), icon: ClipboardList, path: '/cv-resume', desc: t('dashboard.cvResumeDesc') },
  ]

  return (
    <div className="h-screen flex overflow-hidden bg-muted/30">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title={t('dashboard.title')} />

        <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-sm">
            <h1 className="text-2xl font-bold">
              {t('dashboard.welcome', { name: user?.name ?? 'there' })}
            </h1>
            <p className="mt-1 text-green-100 text-sm">
              {t('dashboard.description')}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-background border rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-foreground">{isLoading ? '—' : stat.value}</p>
                </div>
              )
            })}
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-4">{t('dashboard.quickActions')}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="flex items-center justify-between p-4 bg-background border rounded-xl hover:border-green-400 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted group-hover:bg-green-50 transition-colors">
                        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-green-600 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{link.label}</p>
                        <p className="text-xs text-muted-foreground">{link.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors ml-2 flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recent Applications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">{t('dashboard.recentApplications')}</h2>
              {applications.length > 0 && (
                <button
                  onClick={() => navigate('/my-applications')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {t('dashboard.viewAll')}
                </button>
              )}
            </div>

            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-background border rounded-lg px-5 py-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-md bg-muted" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && applications.length === 0 && (
              <div className="bg-background border rounded-xl p-8 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">{t('dashboard.noApplicationsYet')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('dashboard.startApplying')}</p>
                <button
                  onClick={() => navigate('/job-search')}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  {t('dashboard.browseJobs')}
                </button>
              </div>
            )}

            {!isLoading && applications.length > 0 && (
              <div className="space-y-3">
                {recent.map((app) => {
                  const statusLabel = getStatusLabel(app)
                  return (
                    <div
                      key={app.id}
                      onClick={() => app.job_post?.slug && navigate(`/jobs/${app.job_post.slug}`)}
                      className="flex items-center justify-between p-4 bg-background border rounded-xl hover:border-border/80 transition-colors cursor-pointer gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{app.job_post?.title ?? t('applications.unknownPosition')}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {app.job_post?.employer?.company_name ?? '—'}
                          {app.job_post?.location ? ` • ${app.job_post.location}` : ''}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[statusLabel] ?? 'bg-muted text-muted-foreground'}`}>
                        {statusLabel}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
