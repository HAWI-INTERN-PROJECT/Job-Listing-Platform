import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search, MapPin, Building2, Check, X, Layers, Briefcase, Filter, Bookmark } from 'lucide-react'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import { toast } from 'sonner'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import api from '@/lib/api'

interface Category {
  id: number
  name: string
  slug: string
  icon?: string | null
}

interface JobPost {
  id: number
  title: string
  slug: string
  description: string
  category_id?: number
  category?: Category | null
  requirements?: string[] | null
  responsibilities?: string[] | null
  job_type_label: string
  experience_level_label: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  location: string | null
  is_remote: boolean
  employer: { company_name: string } | null
}

function formatSalary(job: JobPost, notSpecified: string) {
  if (!job.salary_min && !job.salary_max) return notSpecified
  if (job.salary_min && job.salary_max) {
    return `${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()} ${job.salary_currency}`
  }
  return `${Number(job.salary_min ?? job.salary_max).toLocaleString()} ${job.salary_currency}`
}

export default function JobSearchPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set())
  const [applyError, setApplyError] = useState<string | null>(null)
  const { isSaved, toggleSave } = useSavedJobs()

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await api.get('/categories')
        const raw = res.data?.data ?? res.data
        return Array.isArray(raw) ? raw : []
      } catch {
        return []
      }
    },
  })

  // Fetch jobs with enhanced title, keyword, category, and location filtering
  const { data, isLoading, isError } = useQuery<JobPost[]>({
    queryKey: ['jobs', search, categoryFilter, locationFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search.trim()) params.append('search', search.trim())
      if (categoryFilter) params.append('category_id', categoryFilter)
      if (locationFilter.trim()) params.append('location', locationFilter.trim())
      const res = await api.get(`/jobs?${params.toString()}`)
      const raw = res.data?.data?.data ?? res.data?.data ?? res.data
      return Array.isArray(raw) ? raw : []
    },
  })

  const { data: applicationsData } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      try {
        const res = await api.get('/employee/applications')
        const raw = res.data?.data?.data ?? res.data?.data ?? res.data
        return Array.isArray(raw) ? raw : []
      } catch {
        return []
      }
    },
  })

  const applyMutation = useMutation({
    mutationFn: (jobId: number) => api.post(`/jobs/${jobId}/apply`),
    onSuccess: (_res, jobId) => {
      setAppliedIds((prev) => new Set(prev).add(jobId))
      setApplyError(null)
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success(t('jobs.applicationSubmitted'))
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message ?? t('jobs.failedToApply')
      setApplyError(msg)
      toast.error(msg)
    },
  })

  const jobs = Array.isArray(data) ? data : []

  const hasActiveFilters = Boolean(search || categoryFilter || locationFilter)

  const clearAllFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setLocationFilter('')
  }

  const selectedCategoryObj = categories.find((c) => String(c.id) === categoryFilter)

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title={t('jobs.title')} />

        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Opportunities Directory Header */}
          <div className="border-b border-border/60 pb-5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-foreground text-[11px] font-semibold">
                🔍
              </span>
              <span>Opportunities Directory</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t('jobs.title')}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore open positions, remote opportunities, and career openings across verified employers.
            </p>
          </div>

          {/* Search & Multi-Filter Bar */}
          <div className="bg-card border border-border/70 rounded-xl p-3 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              {/* Keyword / Title Search */}
              <div className="relative md:col-span-6">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search job title, keywords, skills (React, Python...), or company..."
                  className="w-full pl-8 pr-8 py-2 text-xs rounded-lg bg-muted/40 border border-transparent focus:border-border/80 focus:bg-background focus:outline-none transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Category Filter Dropdown */}
              <div className="relative md:col-span-3">
                <Layers className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 text-xs rounded-lg bg-muted/40 border border-transparent focus:border-border/80 focus:bg-background focus:outline-none transition-colors cursor-pointer appearance-none text-foreground"
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {categoryFilter ? (
                  <button
                    onClick={() => setCategoryFilter('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Clear category"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : (
                  <Filter className="h-3 w-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
                )}
              </div>

              {/* Location Filter */}
              <div className="relative md:col-span-3">
                <MapPin className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Location or 'Remote'..."
                  className="w-full pl-8 pr-8 py-2 text-xs rounded-lg bg-muted/40 border border-transparent focus:border-border/80 focus:bg-background focus:outline-none transition-colors"
                />
                {locationFilter && (
                  <button
                    onClick={() => setLocationFilter('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Clear location"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Category Chips / Pills */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    !categoryFilter
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => {
                  const isSelected = categoryFilter === String(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryFilter(isSelected ? '' : String(cat.id))}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground text-[11px]">Filtered by:</span>
                  {search && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px]">
                      <span>Keyword: &ldquo;{search}&rdquo;</span>
                      <button onClick={() => setSearch('')} className="hover:opacity-75 cursor-pointer">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategoryObj && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px]">
                      <span>Category: {selectedCategoryObj.name}</span>
                      <button onClick={() => setCategoryFilter('')} className="hover:opacity-75 cursor-pointer">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {locationFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px]">
                      <span>Location: {locationFilter}</span>
                      <button onClick={() => setLocationFilter('')} className="hover:opacity-75 cursor-pointer">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] text-muted-foreground hover:text-foreground font-medium underline underline-offset-2 cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

          {applyError && (
            <div className="bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 rounded-xl px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
              {applyError}
            </div>
          )}

          {/* Results Counter */}
          {!isLoading && !isError && jobs.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{jobs.length}</strong> {jobs.length === 1 ? 'position' : 'positions'}
              </span>
            </div>
          )}

          {/* Skeleton Loaders */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border/70 rounded-xl p-5 animate-pulse space-y-3"
                >
                  <div className="flex gap-3.5">
                    <div className="h-10 w-10 rounded-lg bg-muted flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 rounded-xl p-6 text-xs text-rose-700 dark:text-rose-300">
              {t('jobs.failedToLoad')}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-card border border-border/70 rounded-xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mx-auto">
                <Briefcase className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t('jobs.noJobs')}</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No matching opportunities found. Try adjusting your keyword query, choosing another category, or resetting filters.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted transition-colors cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const hasApplied =
                  appliedIds.has(job.id) ||
                  (applicationsData ?? []).some(
                    (app: any) => app.job_post?.id === job.id || app.job_post_id === job.id
                  )
                const isApplyingThis =
                  applyMutation.isPending && applyMutation.variables === job.id

                return (
                  <div
                    key={job.id}
                    className="group bg-card border border-border/70 rounded-xl p-5 hover:border-foreground/25 hover:bg-muted/40 transition-all space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-muted text-foreground/80 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          {job.employer?.company_name?.[0]?.toUpperCase() ?? (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/jobs/${job.slug}`)}
                            className="font-semibold text-sm text-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors text-left"
                          >
                            {job.title}
                          </button>

                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-foreground/80">
                              {job.employer?.company_name ?? t('jobs.unknownCompany')}
                            </span>
                            {job.location && (
                              <>
                                <span>•</span>
                                <span>{job.location}</span>
                              </>
                            )}
                            {job.is_remote && (
                              <>
                                <span>•</span>
                                <span className="text-foreground/90 font-medium">
                                  {t('jobs.remote')}
                                </span>
                              </>
                            )}
                          </p>

                          {/* Property Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                            {job.category?.name && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-medium">
                                {job.category.name}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                              {job.job_type_label}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                              {job.experience_level_label}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-foreground border border-neutral-200 dark:border-neutral-700 font-mono">
                              {formatSalary(job, t('jobs.salaryNotSpecified'))}
                            </span>
                          </div>

                          {/* Skills / Requirements tags if available */}
                          {job.requirements && job.requirements.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-1.5">
                              {job.requirements.slice(0, 4).map((req, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-muted/80 text-muted-foreground font-mono"
                                >
                                  {req}
                                </span>
                              ))}
                              {job.requirements.length > 4 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{job.requirements.length - 4} more
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 pt-1">
                            {job.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => toggleSave(job.id)}
                          title={isSaved(job.id) ? 'Remove from saved' : 'Save job'}
                          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                            isSaved(job.id)
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
                              : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/70'
                          }`}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isSaved(job.id) ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/jobs/${job.slug}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() => !hasApplied && applyMutation.mutate(job.id)}
                          disabled={hasApplied || applyMutation.isPending}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                            hasApplied
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 cursor-default flex items-center gap-1'
                              : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50'
                          }`}
                        >
                          {isApplyingThis ? (
                            t('jobs.applying')
                          ) : hasApplied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              <span>{t('jobs.applied')}</span>
                            </>
                          ) : (
                            t('jobs.applyNow')
                          )}
                        </button>
                      </div>
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
