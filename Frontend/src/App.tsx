import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import NotFoundPage from '@/pages/NotFoundPage'
import EmployerDashboardPage from '@/pages/EmployerDashboardPage'
import MyJobPostsPage from '@/pages/MyJobPostsPage'
import CreateJobPage from '@/pages/CreateJobPage'
import EditJobPage from '@/pages/EditJobPage'
import JobApplicantsPage from '@/pages/JobApplicantsPage'
import ApplicantDetailsPage from '@/pages/ApplicantDetailsPage'
import CompanyProfilePage from './pages/CompanyProfilePage'
import SettingsPage from '@/pages/SettingsPage'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />

  <Route
    path="/login"
    element={
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    }
  />

  <Route
    path="/register"
    element={
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    }
  />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    }
  />

 <Route
  path="/employer-dashboard"
  element={
    
      <EmployerDashboardPage />
    
      }
/>
<Route
  path="/my-job-posts"
  element={<MyJobPostsPage />}
/>

<Route
  path="/create-job"
  element={<CreateJobPage />}
/>
<Route
  path="/edit-job"
  element={<EditJobPage />}
/>
<Route 
 path="/job-applicants" 
 element={<JobApplicantsPage />} />
 <Route 
   path="/applicant-details" 
   element={<ApplicantDetailsPage />} />

   <Route
  path="/company-profile"
  element={<CompanyProfilePage />}
/>
<Route
  path="/settings"
  element={<SettingsPage />}
/>

  <Route path="*" element={<NotFoundPage />} />
</Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
