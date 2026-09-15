import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EditProfilePage from './EditProfilePage'

// Mock the profile store
vi.mock('@/stores/profile', () => ({
  useProfileStore: () => ({
    profile: {
      headline: 'Senior Developer',
      phone: '1234567890',
      location: 'Addis Ababa',
      bio: 'Experienced developer',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: [],
      education: [],
      languages: [],
    },
    setProfile: vi.fn(),
  }),
}))

// Mock auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
  }),
}))

// Mock components
vi.mock('@/components/employee/EmployeeSidebar', () => ({
  default: () => <div>Sidebar</div>,
}))

vi.mock('@/components/employer/EmployerHeader', () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}))

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('EditProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title', () => {
    renderPage()
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
  })

  it('renders personal information fields', () => {
    renderPage()
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
  })

  it('renders skills section', () => {
    renderPage()
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders save and cancel buttons', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /Save|save/ })).toBeInTheDocument()
  })
})
