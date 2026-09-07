import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  username: 'johndoe',
  role: 'employee',
  email_verified_at: '2026-01-01',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: mockUser,
    getProfile: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: true,
  })),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the HireStream sidebar', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText('HireStream')).toBeInTheDocument()
  })

  it('renders the welcome message with the user name', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Welcome back, John Doe/)).toBeInTheDocument()
  })

  it('shows stats counted from the applications list', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getAllByText('Applications').length).toBeGreaterThan(0)
    expect(screen.getByText('Saved Jobs')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders recent applications', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Recent Applications')).toBeInTheDocument()
        expect(screen.getByText(/Ethiopian Airlines/)).toBeInTheDocument()
  })

  it('renders the upcoming interview card', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Upcoming Interview')).toBeInTheDocument()
  })

  it('renders recommended jobs', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Recommended Jobs')).toBeInTheDocument()
    expect(screen.getByText('GlobalTech')).toBeInTheDocument()
  })

  it('renders the logout button', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })
})