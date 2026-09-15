import { render, waitFor, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MyApplicationsPage from './MyApplicationsPage'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/components/employee/EmployeeSidebar', () => ({
  default: () => <div>Sidebar</div>,
}))

vi.mock('@/components/employer/EmployerHeader', () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ 
      data: { 
        data: [
          { id: 1, job_title: 'Test Job', company: 'Test Co', status: 'pending' }
        ] 
      } 
    }),
  },
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
  })

  it('renders the page', async () => {
    render(<MyApplicationsPage />, { wrapper })
    await waitFor(() => {
      expect(screen.getByText(/My Applications|applications/i)).toBeInTheDocument()
    })
  })
})
