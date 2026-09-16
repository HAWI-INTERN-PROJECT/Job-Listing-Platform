import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { savedJobService } from '@/services/savedJobService'
import { useAuthStore } from '@/stores/auth'

export function useSavedJobs(params?: { search?: string; category_id?: string; page?: number; per_page?: number }) {
  const { user } = useAuthStore()
  const isEmployee = user?.role === 'employee'
  const queryClient = useQueryClient()

  // Query saved job IDs (O(1) lookup set)
  const { data: savedIds = [], isLoading: isLoadingIds } = useQuery({
    queryKey: ['saved-job-ids'],
    queryFn: () => savedJobService.getSavedJobIds(),
    enabled: isEmployee,
    staleTime: 60000,
  })

  // Query paginated saved jobs
  const {
    data: savedJobsResponse,
    isLoading: isLoadingList,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['saved-jobs', params?.search, params?.category_id, params?.page],
    queryFn: () => savedJobService.getSavedJobs(params),
    enabled: isEmployee,
  })

  const savedIdsSet = new Set<number>(savedIds)

  // Toggle mutation with optimistic update
  const toggleMutation = useMutation({
    mutationFn: (jobPostId: number) => savedJobService.toggleSaveJob(jobPostId),
    onMutate: async (jobPostId: number) => {
      await queryClient.cancelQueries({ queryKey: ['saved-job-ids'] })
      const previousIds = queryClient.getQueryData<number[]>(['saved-job-ids']) || []
      const wasSaved = previousIds.includes(jobPostId)

      const nextIds = wasSaved
        ? previousIds.filter((id) => id !== jobPostId)
        : [...previousIds, jobPostId]

      queryClient.setQueryData(['saved-job-ids'], nextIds)

      return { previousIds, wasSaved }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
      if (data.is_saved) {
        toast.success('Job saved to your bookmarks')
      } else {
        toast.info('Job removed from saved jobs')
      }
    },
    onError: (_err, _jobPostId, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(['saved-job-ids'], context.previousIds)
      }
      toast.error('Failed to update saved job status')
    },
  })

  // Explicit remove mutation
  const removeMutation = useMutation({
    mutationFn: (jobPostId: number) => savedJobService.unsaveJob(jobPostId),
    onMutate: async (jobPostId: number) => {
      await queryClient.cancelQueries({ queryKey: ['saved-job-ids'] })
      const previousIds = queryClient.getQueryData<number[]>(['saved-job-ids']) || []
      queryClient.setQueryData(
        ['saved-job-ids'],
        previousIds.filter((id) => id !== jobPostId)
      )
      return { previousIds }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
      toast.info('Job removed from saved jobs')
    },
    onError: (_err, _jobPostId, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(['saved-job-ids'], context.previousIds)
      }
      toast.error('Failed to remove job')
    },
  })

  return {
    savedJobs: savedJobsResponse?.data ?? [],
    meta: savedJobsResponse?.meta,
    savedIds: savedIdsSet,
    isSaved: (jobId: number) => savedIdsSet.has(jobId),
    isLoading: isLoadingList || isLoadingIds,
    isError,
    refetch,
    toggleSave: (jobId: number) => toggleMutation.mutate(jobId),
    removeSaved: (jobId: number) => removeMutation.mutate(jobId),
    isToggling: toggleMutation.isPending,
  }
}
