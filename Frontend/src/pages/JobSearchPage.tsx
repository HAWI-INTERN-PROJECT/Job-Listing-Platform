import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  LayoutGrid,
  User,
  FileText,
  ClipboardList,
  Search,
  Settings,
  LogOut,
  Bell,
  Briefcase,
  MapPin,
  DollarSign,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import api from '@/lib/api'

const navItems = [
  { label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
  { label: 'My Profile', icon: User, path: '/my-profile' },
  { label: 'Applications', icon: FileText, path: '/my-applications' },
  { label: 'CV/Resume', icon: ClipboardList, path: '/cv-resume' },
  { label: 'Job Search', icon: Search, path: '/job-search' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

interface JobPost {
  id: number
  title: string
  slug: string
  description: string
  job_type_label: string
  experience_level_label: string
  location: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  is_remote: boolean
  employer: {
    company_name: string
    logo: string | null
  } | null
  category: {
    name: string
  } | null
}

interface JobsResponse {
  data: JobPost[]
  meta?: { total: number }
}

export default function JobSearchPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set())

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', search, locationFilter],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (locationFilter) params.location = locationFilter

      const res = await api.get('/jobs', { params })
      return res.data.data as JobsResponse
    },
  })

  const applyMutation = useMutation({
    mutationFn: (jobId: number) => api.post(`/jobs/${jobId}/apply`),
    onSuccess: (_response, jobId) => {
      setAppliedIds((prev) => new Set(prev).add(jobId))
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleApply = (jobId: number) => {
    applyMutation.mutate(jobId)
  }

  const formatSalary = (job: JobPost): string => {
    if (!job.salary_min && !job.salary_max) return 'Salary not specified'
    if (job.salary_min && job.salary_max) {
      return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.salary_currency}`
    }
    return `${(job.salary_min ?? job.salary_max)?.toLocaleString()} ${job.salary_currency}`
  }

  const jobs = data?.data ?? []

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-64 bg-background border-r flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 px-6 py-5">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">HireStream</span>
          </div>

          <nav className="px-3 mt-2 space-y-1">
            {navItems.map((item) => {
              const isActive = item.path === location.pathname
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {t('auth.logout')}
        </button>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between px-8 py-5 border-b bg-background">
          <h1 className="text-xl font-semibold">Job Search</h1>
          <div className="flex items-center gap-6">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-muted overflow-hidden flex items-center justify-center text-sm font-medium">
                {user?.name?.[0] ?? 'U'}
              </div>
              <div className="text-sm">
                <p className="font-medium leading-tight">{user?.name ?? 'User'}</p>
                <p className="text-muted-foreground text-xs leading-tight">Addis Ababa, ET</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-8 py-6">
          <div className="bg-background border rounded-lg p-4 mb-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job title, keyword..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-muted/40 focus:outline-none"
              />
            </div>
            <div className="relative w-64">
              <MapPin className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Location"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-muted/40 focus:outline-none"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-12">Loading jobs...</div>
          ) : isError ? (
            <div className="text-center text-sm text-red-600 py-12">Failed to load jobs.</div>
          ) : jobs.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">
              No jobs found matching your search.
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const hasApplied = appliedIds.has(job.id)
                return (
                  <div key={job.id} className="bg-background border rounded-lg p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.employer?.company_name ?? 'Unknown company'}
                            {job.location ? ` • ${job.location}` : ''}
                            {job.is_remote ? ' • Remote' : ''}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="px-2 py-1 rounded-full bg-muted">{job.job_type_label}</span>
                            <span className="px-2 py-1 rounded-full bg-muted">
                              {job.experience_level_label}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatSalary(job)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={hasApplied || applyMutation.isPending}
                        className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                          hasApplied
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                        }`}
                      >
                        {hasApplied ? 'Applied' : 'Apply Now'}
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