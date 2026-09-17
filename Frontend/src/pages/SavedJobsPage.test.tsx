import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SavedJobsPage from './SavedJobsPage'
import api from '@/lib/api'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}))

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/components/employee/EmployeeSidebar', () => ({
  default: () => <div>Sidebar</div>,
}))

vi.mock('@/components/employer/EmployerHeader', () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 1, role: 'employee', name: 'Test Employee' },
  }),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('SavedJobsPage', () => {
  const mockSavedJobs = [
    {
      id: 101,
      user_id: 1,
      job_post_id: 1,
      created_at: '2026-09-15T12:00:00Z',
      created_at_human: '1 day ago',
      job_post: {
        id: 1,
        title: 'Senior Frontend Engineer',
        slug: 'senior-frontend-engineer',
        description: 'Lead our frontend architecture with React.',
        location: 'San Francisco, CA',
        is_remote: true,
        job_type: 'full_time',
        job_type_label: 'Full Time',
        experience_level: 'senior',
        experience_level_label: 'Senior',
        salary_min: 120000,
        salary_max: 150000,
        salary_currency: 'USD',
        requirements: ['React', 'TypeScript', 'Tailwind'],
        category: { id: 1, name: 'Engineering', slug: 'engineering' },
        employer: { company_name: 'Acme Corp' },
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith('/employee/saved-jobs/ids')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [1],
          },
        })
      }
      if (url.startsWith('/employee/saved-jobs')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              data: mockSavedJobs,
              meta: { current_page: 1, total: 1 },
            },
          },
        })
      }
      if (url.startsWith('/categories')) {
        return Promise.resolve({
          data: {
            data: [{ id: 1, name: 'Engineering', slug: 'engineering' }],
          },
        })
      }
      if (url.startsWith('/employee/applications')) {
        return Promise.resolve({ data: { data: [] } })
      }
      return Promise.resolve({ data: {} })
    })
    vi.mocked(api.delete).mockImplementation(() =>
      Promise.resolve({
        data: { success: true, data: { job_post_id: 1, removed: true } },
      })
    )
  })

  it('renders saved jobs list with job title, company name, and details', async () => {
    render(<SavedJobsPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument()
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
      expect(screen.getAllByText('Engineering').length).toBeGreaterThan(0)
      expect(screen.getByText('React')).toBeInTheDocument()
    })
  })

  it('renders empty state when no jobs are saved', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith('/employee/saved-jobs')) {
        return Promise.resolve({
          data: {
            success: true,
            data: { data: [] },
          },
        })
      }
      return Promise.resolve({ data: { data: [] } })
    })

    render(<SavedJobsPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('No saved jobs yet')).toBeInTheDocument()
      expect(screen.getByText('Browse Open Positions')).toBeInTheDocument()
    })
  })

  it('allows user to remove a saved job', async () => {
    render(<SavedJobsPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument()
    })

    const removeButton = screen.getByTitle('Remove from saved jobs')
    expect(removeButton).toBeInTheDocument()
    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/employee/saved-jobs/1')
    })
  })
})
