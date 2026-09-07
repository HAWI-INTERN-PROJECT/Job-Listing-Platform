import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MyApplicationsPage from './MyApplicationsPage'
import api from '@/lib/api'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

vi.mock('@/components/employee/EmployeeSidebar', () => ({
  default: () => <div>Sidebar</div>,
}))

vi.mock('@/components/employer/EmployerHeader', () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}))

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('MyApplicationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockResolvedValue({ data: { data: [] } })
  })

  it('loads applications from the employee route', async () => {
    render(<MyApplicationsPage />, { wrapper })

    await waitFor(() => {
      expect(vi.mocked(api.get)).toHaveBeenCalledWith('/employee/applications')
    })
  })
})
