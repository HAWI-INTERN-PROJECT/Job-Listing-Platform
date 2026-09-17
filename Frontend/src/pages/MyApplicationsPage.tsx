import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Briefcase, MoreVertical } from 'lucide-react'
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
    id: number; title: string; slug: string; job_type_label: string
    location: string | null; salary_min: number | null; salary_max: number | null
    salary_currency: string; employer: { company_name: string } | null
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

function formatSalary(app: Application['job_post']): string {
  if (!app || (app.salary_min == null && app.salary_max == null)) return ''
  const min = app.salary_min != null ? Number(app.salary_min).toLocaleString() : null
  const max = app.salary_max != null ? Number(app.salary_max).toLocaleString() : null
  if (min && max)
    return `${min} – ${max} ${app.salary_currency}`
  return `${min ?? max} ${app.salary_currency}`
}

export default function MyApplicationsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<StatusLabel | 'All'>('All')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await api.get('/employee/applications')
      const raw = res.data?.data?.data ?? res.data?.data ?? res.data
      return (Array.isArray(raw) ? raw : []) as Application[]
    },
  })

  const applications = Array.isArray(data) ? data : []
  const filtered = activeTab === 'All'
    ? applications
    : applications.filter((a) => getStatusLabel(a) === activeTab)
  const countFor = (val: StatusLabel | 'All') =>
    val === 'All'
      ? applications.length
      : applications.filter((a) => getStatusLabel(a) === val).length

  const tabs: { label: string; value: StatusLabel | 'All' }[] = [
    { label: t('applications.all'), value: 'All' },
    { label: t('applications.submitted'), value: 'Submitted' },
    { label: t('applications.underReview'), value: 'Under Review' },
    { label: t('applications.shortlisted'), value: 'Shortlisted' },
    { label: t('applications.rejected'), value: 'Rejected' },
    { label: t('applications.hired'), value: 'Hired' },
  ]

  return (
    <div className="h-screen flex overflow-hidden bg-muted/30">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title={t('applications.title')} />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {tabs.map((tab) => {
              const isActive = tab.value === activeTab
              return (
                <button key={tab.value} onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-full text-sm border ${isActive ? 'bg-green-500 text-white border-green-500' : 'bg-background text-foreground border-border hover:bg-muted'}`}>
                  {tab.label} ({countFor(tab.value)})
                </button>
              )
            })}
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

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-600">{t('applications.failedToLoad')}</div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-16">
              {activeTab === 'All' ? t('applications.noApplications') : t('applications.noStatusApplications', { status: activeTab })}
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((app) => {
                const job = app.job_post
                const salary = formatSalary(job)
                const statusLabel = getStatusLabel(app)
                return (
                  <div key={app.id} className="flex items-center justify-between bg-background border rounded-lg px-5 py-4 gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <button onClick={() => job?.slug && navigate(`/jobs/${job.slug}`)} className="font-medium text-left hover:text-blue-600 hover:underline">
                          {job?.title ?? t('applications.unknownPosition')}
                        </button>
                        <p className="text-sm text-muted-foreground">
                          {job?.employer?.company_name ?? '—'}
                          {job?.location ? ` • ${job.location}` : ''}
                          {salary ? ` • ${salary}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusStyles[statusLabel] ?? 'bg-muted text-muted-foreground'}`}>
                        {statusLabel}
                      </span>
                      <button onClick={() => job?.slug && navigate(`/jobs/${job.slug}`)} className="text-muted-foreground hover:text-foreground" title="View job">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
