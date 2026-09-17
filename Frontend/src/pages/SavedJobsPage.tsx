import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Bookmark,
  Search,
  Building2,
  Check,
  X,
  Layers,
  ArrowRight,
  Trash2,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import api from '@/lib/api'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import type { SavedJobItem } from '@/types'

interface Category {
  id: number
  name: string
  slug: string
}

function formatSalary(job: NonNullable<SavedJobItem['job_post']>, notSpecified: string) {
  if (!job.salary_min && !job.salary_max) return notSpecified
  if (job.salary_min && job.salary_max) {
    return `${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()} ${job.salary_currency}`
  }
  return `${Number(job.salary_min ?? job.salary_max).toLocaleString()} ${job.salary_currency}`
}

export default function SavedJobsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set())

  // Categories for filter
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

  // Saved jobs hook
  const {
    savedJobs,
    isLoading,
    isError,
    refetch,
    removeSaved,
  } = useSavedJobs({ search: search.trim() || undefined, category_id: categoryFilter || undefined })

  // Applications data to check if already applied
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
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success(t('jobs.applicationSubmitted'))
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message ?? t('jobs.failedToApply')
      toast.error(msg)
    },
  })

  const hasActiveFilters = Boolean(search || categoryFilter)

  const clearAllFilters = () => {
    setSearch('')
    setCategoryFilter('')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title="Saved Jobs" />

        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="border-b border-border/60 pb-5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px]">
                <Bookmark className="h-3 w-3" />
              </span>
              <span>Saved Opportunities</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Saved Jobs
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Keep track of positions you want to review, compare, and apply for later.
                </p>
              </div>

              {!isLoading && savedJobs.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {savedJobs.length} {savedJobs.length === 1 ? 'saved position' : 'saved positions'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-card border border-border/70 rounded-xl p-3 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Search */}
              <div className="relative sm:col-span-8">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your saved jobs by title, company, or keyword..."
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

              {/* Category Filter */}
              <div className="relative sm:col-span-4">
                <Layers className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 text-xs rounded-lg bg-muted/40 border border-transparent focus:border-border/80 focus:bg-background focus:outline-none transition-colors cursor-pointer appearance-none text-foreground"
                  aria-label="Filter saved jobs by category"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {categoryFilter && (
                  <button
                    onClick={() => setCategoryFilter('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Clear category"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground text-[11px]">Active filters:</span>
                  {search && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px]">
                      <span>&ldquo;{search}&rdquo;</span>
                      <button onClick={() => setSearch('')} className="hover:opacity-75 cursor-pointer">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {categoryFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px]">
                      <span>Category: {categories.find((c) => String(c.id) === categoryFilter)?.name}</span>
                      <button onClick={() => setCategoryFilter('')} className="hover:opacity-75 cursor-pointer">
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
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
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
            <div className="bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 rounded-xl p-6 text-center space-y-3">
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                Failed to load saved jobs.
              </p>
              <button
                onClick={() => refetch()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-border hover:bg-muted transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : savedJobs.length === 0 ? (
            /* Empty State */
            <div className="bg-card border border-border/70 rounded-2xl p-12 sm:p-16 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Bookmark className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-semibold text-foreground">
                  {hasActiveFilters ? 'No matching saved jobs' : 'No saved jobs yet'}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {hasActiveFilters
                    ? 'No saved positions match your filter criteria. Try clearing search or choosing another category.'
                    : "Bookmark jobs you find interesting to easily compare requirements, keep tabs on deadlines, and apply when you're ready."}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted transition-colors cursor-pointer"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/job-search')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Browse Open Positions</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Saved Jobs List */
            <div className="space-y-3">
              {savedJobs.map((item) => {
                const job = item.job_post
                if (!job) return null

                const hasApplied =
                  appliedIds.has(job.id) ||
                  (applicationsData ?? []).some(
                    (app: any) => app.job_post?.id === job.id || app.job_post_id === job.id
                  )
                const isApplyingThis =
                  applyMutation.isPending && applyMutation.variables === job.id

                return (
                  <div
                    key={item.id}
                    className="group bg-card border border-border/70 rounded-xl p-5 hover:border-foreground/25 hover:bg-muted/30 transition-all space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Job Header & Details */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-muted text-foreground/80 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          {job.employer?.company_name?.[0]?.toUpperCase() ?? (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/jobs/${job.slug}`)}
                              className="font-semibold text-sm text-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors text-left truncate"
                            >
                              {job.title}
                            </button>
                          </div>

                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-foreground/80">
                              {job.employer?.company_name ?? 'Unknown Company'}
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

                          {/* Requirements Pills */}
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

                          <div className="flex items-center gap-1 pt-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Saved {item.created_at_human ?? new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                        {/* Remove from saved */}
                        <button
                          type="button"
                          onClick={() => removeSaved(job.id)}
                          title="Remove from saved jobs"
                          className="p-2 rounded-lg border border-border/80 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => navigate(`/jobs/${job.slug}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background text-foreground hover:bg-muted/70 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </button>

                        {/* Apply Button */}
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
