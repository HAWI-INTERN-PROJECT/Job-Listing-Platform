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
import CompanyProfilePage from '@/pages/CompanyProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import MyProfilePage from '@/pages/MyProfilePage'
import MyApplicationsPage from '@/pages/MyApplicationsPage'

import AdminApplicationsPage from '@/pages/AdminApplicationsPage'
import AdminJobsPage from '@/pages/AdminJobsPage'
import AdminLayoutPage from '@/pages/AdminLayoutPage'
import AdminOverviewPage from '@/pages/AdminOverviewPage'
import AdminSettingsPage from '@/pages/AdminSettingsPage'
import AdminUsersPage from '@/pages/AdminUsersPage'
import AdmincompaniesPage from '@/pages/AdmincompaniesPage'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

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
                <ProtectedRoute>
                  <EmployerDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-job-posts"
              element={
                <ProtectedRoute>
                  <MyJobPostsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-job"
              element={
                <ProtectedRoute>
                  <CreateJobPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-job"
              element={
                <ProtectedRoute>
                  <EditJobPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/job-applicants"
              element={
                <ProtectedRoute>
                  <JobApplicantsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/applicant-details"
              element={
                <ProtectedRoute>
                  <ApplicantDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/company-profile"
              element={
                <ProtectedRoute>
                  <CompanyProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <MyProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-applications"
              element={
                <ProtectedRoute>
                  <MyApplicationsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - nested under AdminLayoutPage so the sidebar/header
               render once and every sub-page shows inside it via <Outlet />.
               Only the parent needs ProtectedRoute; children inherit the guard. */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayoutPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="overview" element={<AdminOverviewPage />} />
              <Route path="applications" element={<AdminApplicationsPage />} />
              <Route path="jobs" element={<AdminJobsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="companies" element={<AdmincompaniesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Routes>
        </BrowserRouter>

        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}