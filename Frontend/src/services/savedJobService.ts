import api from '@/lib/api'
import type { SavedJobItem } from '@/types'

export interface SavedJobsResponse {
  data: SavedJobItem[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export const savedJobService = {
  async getSavedJobs(params?: { search?: string; category_id?: string; page?: number; per_page?: number }): Promise<SavedJobsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.category_id) searchParams.append('category_id', params.category_id)
    if (params?.page) searchParams.append('page', String(params.page))
    if (params?.per_page) searchParams.append('per_page', String(params.per_page))

    const res = await api.get(`/employee/saved-jobs?${searchParams.toString()}`)
    const payload = res.data?.data ?? res.data
    return {
      data: Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [],
      meta: payload?.meta,
    }
  },

  async getSavedJobIds(): Promise<number[]> {
    const res = await api.get('/employee/saved-jobs/ids')
    const raw = res.data?.data ?? res.data
    return Array.isArray(raw) ? raw : []
  },

  async saveJob(jobPostId: number): Promise<SavedJobItem> {
    const res = await api.post(`/employee/saved-jobs/${jobPostId}`)
    return res.data?.data ?? res.data
  },

  async unsaveJob(jobPostId: number): Promise<{ job_post_id: number; removed: boolean }> {
    const res = await api.delete(`/employee/saved-jobs/${jobPostId}`)
    return res.data?.data ?? res.data
  },

  async toggleSaveJob(jobPostId: number): Promise<{ is_saved: boolean; job_post_id: number; saved_job?: SavedJobItem }> {
    const res = await api.post(`/employee/saved-jobs/${jobPostId}/toggle`)
    return res.data?.data ?? res.data
  },
}
